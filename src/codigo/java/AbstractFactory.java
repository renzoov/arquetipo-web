// Cada familia es una constante de un `enum` que implementa la interfaz de la fábrica: así el
// catálogo de familias es cerrado y no se puede crear una fábrica "a medias". Como cada producto
// tiene un solo método, sus interfaces son funcionales y se implementan con lambdas.

void main() {
    for (var entorno : Entorno.values()) {
        arrancar(entorno);
    }
    try {
        Entorno.valueOf("MARTE");
    } catch (IllegalArgumentException error) {
        IO.println("error: entorno desconocido"); // valueOf falla con un nombre que no existe
    }
}

void arrancar(Entorno entorno) {
    Infraestructura infra = entorno; // se elige UNA vez; todo lo demás es de la misma familia
    IO.println("[" + entorno + "]");
    IO.println("  " + infra.crearAlmacenamiento().subir("F-001.pdf"));
    IO.println("  " + infra.crearCola().publicar("factura-emitida"));
    IO.println("  " + infra.crearSecretos().leer("certificado-firma"));
}

@FunctionalInterface
interface Almacenamiento { String subir(String nombre); }

@FunctionalInterface
interface Cola { String publicar(String mensaje); }

@FunctionalInterface
interface Secretos { String leer(String clave); }

interface Infraestructura {
    Almacenamiento crearAlmacenamiento();
    Cola crearCola();
    Secretos crearSecretos();
}

enum Entorno implements Infraestructura {
    NUBE {
        @Override public Almacenamiento crearAlmacenamiento() { return nombre -> "objetos-nube://facturas/" + nombre; }
        @Override public Cola crearCola() { return mensaje -> "cola gestionada ← " + mensaje; }
        @Override public Secretos crearSecretos() { return clave -> "gestor-de-secretos:" + clave; }
    },
    ON_PREMISE {
        @Override public Almacenamiento crearAlmacenamiento() { return nombre -> "/mnt/nas/facturas/" + nombre; }
        @Override public Cola crearCola() { return mensaje -> "RabbitMQ ← " + mensaje; }
        @Override public Secretos crearSecretos() { return clave -> "vault:" + clave; }
    }
}
