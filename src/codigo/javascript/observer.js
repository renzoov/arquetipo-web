// JavaScript ya trae el patrón: `EventTarget` con `addEventListener` y `dispatchEvent`, y los datos
// viajan en un `CustomEvent`. Para darse de baja se usa un `AbortController`, la forma moderna de
// cancelar suscripciones. Cada suscriptor se envuelve en un try/catch para aislar sus fallos.

export class ServicioPagos extends EventTarget {
  /**
   * @param {(pedido: { id: string, total: number }) => void} alPagar
   * @param {AddEventListenerOptions} [opciones]  por ejemplo, { signal } para darse de baja
   */
  suscribir(alPagar, opciones = {}) {
    this.addEventListener('pedido-pagado', (evento) => {
      try {
        alPagar(/** @type {CustomEvent} */ (evento).detail);
      } catch (error) {
        console.log(`  ⚠ un suscriptor falló: ${error.message}`);
      }
    }, opciones);
  }

  pagar(pedido) {
    console.log(`Pedido ${pedido.id} cobrado`);
    this.dispatchEvent(new CustomEvent('pedido-pagado', { detail: pedido }));
  }
}

// ── Uso ──
const pagos = new ServicioPagos();
const facturacion = new AbortController();

pagos.suscribir((p) => console.log(`  correo de confirmación para ${p.id}`));
pagos.suscribir(() => { throw new Error('inventario no disponible'); });
pagos.suscribir((p) => console.log(`  factura emitida por ${p.total}`), { signal: facturacion.signal });

pagos.pagar({ id: 'P-1', total: 250 });

facturacion.abort(); // da de baja al suscriptor de facturación
pagos.pagar({ id: 'P-2', total: 90 }); // ya no se emite factura
