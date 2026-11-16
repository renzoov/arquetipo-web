// Un `record` es inmutable y trae `equals` y `hashCode` por valor, así que sirve directamente como
// clave de un `Map`; `computeIfAbsent` crea el formato solo la primera vez. El propio JDK usa este
// patrón: `Integer.valueOf` devuelve objetos compartidos para los números de -128 a 127.

void main() {
    var fabrica = new FabricaFormatos();
    var celdas = new ArrayList<Celda>(100_000);

    for (var fila = 0; fila < 1000; fila++) {
        for (var columna = 0; columna < 100; columna++) {
            var formato = fabrica.obtener(new Formato("Inter", 11,
                    fila == 0 ? "#000000" : "#333333",
                    columna == 0 ? "@" : "#,##0.00"));
            celdas.add(new Celda(fila, columna, "", formato));
        }
    }

    IO.println(celdas.size() + " celdas comparten " + fabrica.total() + " formatos"); // 100000 celdas comparten 4 formatos
    IO.println(celdas.get(101).formato() == celdas.get(102).formato());               // true: el mismo objeto
}

record Formato(String fuente, int tamano, String color, String formatoNumero) {}

record Celda(int fila, int columna, String valor, Formato formato) {}

final class FabricaFormatos {
    private final Map<Formato, Formato> cache = new HashMap<>();

    Formato obtener(Formato datos) {
        return cache.computeIfAbsent(datos, clave -> clave);
    }

    int total() {
        return cache.size();
    }
}
