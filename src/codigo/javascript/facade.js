// En JavaScript el propio módulo puede ser la fachada: las piezas del subsistema son funciones
// internas que no se exportan, y solo se exporta `emitirFactura`. Para las pruebas, las piezas
// se pueden reemplazar pasando un segundo argumento con dependencias.

async function validarNumeroFiscal(numero) {
  if (!/^\d{11}$/.test(numero)) throw new Error(`Número fiscal inválido: ${numero}`);
}

const generarXml = (venta) => `<Factura id="${venta.id}" total="${venta.total.toFixed(2)}"/>`;
const firmar = (xml) => xml.replace('/>', ' firma="a1b2c3"/>');
const enviarAAutoridad = async (xmlFirmado) => `CONSTANCIA-${xmlFirmado.length}`;
const guardarComprobante = async (venta, constancia) => ({ serie: `F001-${venta.id}`, constancia });

const subsistema = { validarNumeroFiscal, generarXml, firmar, enviarAAutoridad, guardarComprobante };

// La fachada: la única función exportada
export async function emitirFactura(venta, dependencias = {}) {
  const s = { ...subsistema, ...dependencias };
  await s.validarNumeroFiscal(venta.cliente.numeroFiscal);
  const constancia = await s.enviarAAutoridad(s.firmar(s.generarXml(venta)));
  return s.guardarComprobante(venta, constancia);
}

// ── Uso: una sola llamada desde cualquier parte ──
console.log(await emitirFactura({ id: '000123', cliente: { numeroFiscal: '20123456789' }, total: 118 }));
// { serie: 'F001-000123', constancia: 'CONSTANCIA-52' }

// En una prueba, sin llamar a la autoridad tributaria real:
console.log(await emitirFactura(
  { id: '000124', cliente: { numeroFiscal: '20123456789' }, total: 50 },
  { enviarAAutoridad: async () => 'CONSTANCIA-PRUEBA' },
));
