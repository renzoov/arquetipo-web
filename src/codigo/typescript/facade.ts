// La fachada recibe el subsistema por constructor (con valores por defecto, así es fácil de usar
// y de sustituir en pruebas) y expone una única función `async`. Las clases del subsistema no
// se exportan: fuera de este módulo solo se ve la fachada.

interface Venta { id: string; cliente: { numeroFiscal: string }; total: number }
interface Comprobante { serie: string; constancia: string }

class ValidadorFiscal {
  async validar(numeroFiscal: string): Promise<void> {
    if (!/^\d{11}$/.test(numeroFiscal)) throw new Error(`Número fiscal inválido: ${numeroFiscal}`);
  }
}

class GeneradorXml {
  crear(venta: Venta): string {
    return `<Factura id="${venta.id}" total="${venta.total.toFixed(2)}"/>`;
  }
}

class FirmadorDigital {
  firmar(xml: string): string {
    return xml.replace('/>', ' firma="a1b2c3"/>');
  }
}

class ClienteAutoridadTributaria {
  async enviar(xmlFirmado: string): Promise<string> {
    return `CONSTANCIA-${xmlFirmado.length}`;
  }
}

class AlmacenComprobantes {
  async guardar(venta: Venta, constancia: string): Promise<Comprobante> {
    return { serie: `F001-${venta.id}`, constancia };
  }
}

export class FacturacionElectronica {
  constructor(
    private readonly validador = new ValidadorFiscal(),
    private readonly generador = new GeneradorXml(),
    private readonly firmador = new FirmadorDigital(),
    private readonly autoridad = new ClienteAutoridadTributaria(),
    private readonly almacen = new AlmacenComprobantes(),
  ) {}

  async emitir(venta: Venta): Promise<Comprobante> {
    await this.validador.validar(venta.cliente.numeroFiscal);
    const firmado = this.firmador.firmar(this.generador.crear(venta));
    const constancia = await this.autoridad.enviar(firmado);
    return this.almacen.guardar(venta, constancia);
  }
}

// ── Uso: una sola línea en cada cliente ──
const facturacion = new FacturacionElectronica();
console.log(await facturacion.emitir({ id: '000123', cliente: { numeroFiscal: '20123456789' }, total: 118 }));
// { serie: 'F001-000123', constancia: 'CONSTANCIA-52' }
