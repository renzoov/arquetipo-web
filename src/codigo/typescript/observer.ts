// `suscribir` devuelve la función para darse de baja (el estilo habitual en JavaScript), los
// suscriptores se guardan en un `Set` y cada uno se ejecuta en un try/catch para que un fallo
// no impida que los demás reciban el aviso.

export interface Pedido {
  id: string;
  total: number;
}

export interface SuscriptorPagos {
  pedidoPagado(pedido: Pedido): void | Promise<void>;
}

export class ServicioPagos {
  readonly #suscriptores = new Set<SuscriptorPagos>();

  suscribir(suscriptor: SuscriptorPagos): () => void {
    this.#suscriptores.add(suscriptor);
    return () => this.#suscriptores.delete(suscriptor);
  }

  async pagar(pedido: Pedido): Promise<void> {
    console.log(`Pedido ${pedido.id} cobrado`);
    for (const suscriptor of this.#suscriptores) {
      try {
        await suscriptor.pedidoPagado(pedido);
      } catch (error) {
        console.log(`  ⚠ un suscriptor falló: ${(error as Error).message}`);
      }
    }
  }
}

// ── Uso ──
const pagos = new ServicioPagos();

pagos.suscribir({ pedidoPagado: (p) => console.log(`  correo de confirmación para ${p.id}`) });
pagos.suscribir({ pedidoPagado: () => { throw new Error('inventario no disponible'); } });
const darDeBajaFactura = pagos.suscribir({ pedidoPagado: (p) => console.log(`  factura emitida por ${p.total}`) });

await pagos.pagar({ id: 'P-1', total: 250 });

darDeBajaFactura();
await pagos.pagar({ id: 'P-2', total: 90 }); // ya no se emite factura
