// La forma recomendada en Java es un `enum` de un solo elemento ("Effective Java", ítem 3): la JVM
// garantiza una única instancia, es segura con hilos y resiste la serialización y la reflexión. En
// Spring no se escribe el patrón: los beans ya son singleton por defecto.

void main() throws Exception {
    // Diez hilos virtuales la piden a la vez
    try (var hilos = Executors.newVirtualThreadPerTaskExecutor()) {
        var tareas = IntStream.range(0, 10).mapToObj(i -> hilos.submit(() -> Configuracion.INSTANCIA)).toList();
        var instancias = new ArrayList<Configuracion>();
        for (var tarea : tareas) instancias.add(tarea.get());
        IO.println("10 hilos, misma instancia: " + instancias.stream().allMatch(i -> i == instancias.get(0))); // true
    }

    IO.println(Configuracion.INSTANCIA.estaActiva("pagos.billetera")); // true
    IO.println(Configuracion.INSTANCIA.estaActiva("envios.express"));  // false
}

enum Configuracion {
    INSTANCIA;

    private final Map<String, Boolean> flags;

    Configuracion() {
        IO.println("Cargando configuración (solo ocurre una vez)...");
        flags = Map.of("pagos.billetera", true, "envios.express", false);
    }

    boolean estaActiva(String flag) {
        return flags.getOrDefault(flag, false);
    }
}
