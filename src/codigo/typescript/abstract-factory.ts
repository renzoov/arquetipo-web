// Las familias se describen con interfaces y cada fábrica devuelve objetos literales que cumplen
// esas interfaces. La fábrica se elige con un `Record<Entorno, ...>` tipado en lugar de un switch:
// si añades un entorno al tipo, el compilador te obliga a registrar su fábrica.

export interface Almacenamiento { subir(nombre: string): string }
export interface Cola { publicar(mensaje: string): string }
export interface Secretos { leer(clave: string): string }

export interface Infraestructura {
  crearAlmacenamiento(): Almacenamiento;
  crearCola(): Cola;
  crearSecretos(): Secretos;
}

class InfraNube implements Infraestructura {
  crearAlmacenamiento(): Almacenamiento {
    return { subir: (nombre) => `objetos-nube://facturas/${nombre}` };
  }
  crearCola(): Cola {
    return { publicar: (mensaje) => `cola gestionada ← ${mensaje}` };
  }
  crearSecretos(): Secretos {
    return { leer: (clave) => `gestor-de-secretos:${clave}` };
  }
}

class InfraOnPremise implements Infraestructura {
  crearAlmacenamiento(): Almacenamiento {
    return { subir: (nombre) => `/mnt/nas/facturas/${nombre}` };
  }
  crearCola(): Cola {
    return { publicar: (mensaje) => `RabbitMQ ← ${mensaje}` };
  }
  crearSecretos(): Secretos {
    return { leer: (clave) => `vault:${clave}` };
  }
}

type Entorno = 'nube' | 'on-premise';

const fabricas: Record<Entorno, () => Infraestructura> = {
  'nube': () => new InfraNube(),
  'on-premise': () => new InfraOnPremise(),
};

export function arrancar(entorno: Entorno) {
  const infra = fabricas[entorno](); // se elige UNA vez; todo lo demás es de la misma familia
  console.log(`[${entorno}]`);
  console.log(' ', infra.crearAlmacenamiento().subir('F-001.pdf'));
  console.log(' ', infra.crearCola().publicar('factura-emitida'));
  console.log(' ', infra.crearSecretos().leer('certificado-firma'));
}

// ── Uso ──
arrancar('nube');
arrancar('on-premise');
