// Un generador asíncrono (`async *`) implementa `AsyncIterable` y el cliente lo recorre con
// `for await`: no hace falta escribir `next()` a mano. Además el recorrido es perezoso: si el
// cliente sale del bucle antes, no se piden más páginas.

interface Cliente { id: number; nombre: string }
interface Pagina { datos: Cliente[]; siguienteCursor?: string }

// API simulada que devuelve los clientes de dos en dos
class ApiCrm {
  readonly #clientes: Cliente[] = ['Ana', 'Luis', 'Marta', 'Jorge', 'Elena'].map((nombre, i) => ({ id: i + 1, nombre }));
  peticiones = 0;

  async listarClientes({ limite, cursor }: { limite: number; cursor?: string }): Promise<Pagina> {
    this.peticiones++;
    const desde = cursor ? Number(cursor) : 0;
    const hasta = desde + limite;
    return {
      datos: this.#clientes.slice(desde, hasta),
      siguienteCursor: hasta < this.#clientes.length ? String(hasta) : undefined,
    };
  }
}

export class ClientesCrm implements AsyncIterable<Cliente> {
  constructor(private readonly crm: ApiCrm, private readonly limite = 2) {}

  async *[Symbol.asyncIterator](): AsyncGenerator<Cliente> {
    let cursor: string | undefined;
    do {
      const pagina = await this.crm.listarClientes({ limite: this.limite, cursor });
      yield* pagina.datos;
      cursor = pagina.siguienteCursor;
    } while (cursor);
  }
}

// ── Uso ──
const crm = new ApiCrm();
for await (const cliente of new ClientesCrm(crm)) {
  console.log(cliente.nombre);
}
console.log(`Peticiones a la API: ${crm.peticiones}`); // 3

// Perezoso: si se corta antes, no se piden más páginas
const otroCrm = new ApiCrm();
for await (const cliente of new ClientesCrm(otroCrm)) {
  if (cliente.id === 2) break;
}
console.log(`Peticiones a la API: ${otroCrm.peticiones}`); // 1
