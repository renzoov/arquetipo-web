// La implementación es una interfaz y la abstracción una clase `abstract` que la recibe en su
// constructor y la guarda en un campo `final`. Para que el ejemplo se pueda ejecutar, los formatos
// son Markdown y CSV; en producción serían PDF o Excel.

void main() {
    IO.println(new ReporteVentas(new RenderizadorMarkdown()).exportar());
    IO.println(new ReporteInventario(new RenderizadorCsv()).exportar());
}

interface Renderizador {
    void titulo(String texto);
    void tabla(List<String> columnas, List<List<String>> filas);
    String generar();
}

class RenderizadorMarkdown implements Renderizador {
    private final StringBuilder sb = new StringBuilder();

    @Override public void titulo(String texto) { sb.append("# ").append(texto).append('\n'); }

    @Override public void tabla(List<String> columnas, List<List<String>> filas) {
        sb.append("| ").append(String.join(" | ", columnas)).append(" |\n");
        filas.forEach(fila -> sb.append("| ").append(String.join(" | ", fila)).append(" |\n"));
    }

    @Override public String generar() { return sb.toString().strip(); }
}

class RenderizadorCsv implements Renderizador {
    private final StringBuilder sb = new StringBuilder();

    @Override public void titulo(String texto) { } // un CSV no tiene título

    @Override public void tabla(List<String> columnas, List<List<String>> filas) {
        sb.append(String.join(",", columnas)).append('\n');
        filas.forEach(fila -> sb.append(String.join(",", fila)).append('\n'));
    }

    @Override public String generar() { return sb.toString().strip(); }
}

// Abstracción: guarda el "puente" hacia la implementación
abstract class Reporte {
    protected final Renderizador salida;

    protected Reporte(Renderizador salida) {
        this.salida = salida;
    }

    abstract String exportar();
}

class ReporteVentas extends Reporte {
    ReporteVentas(Renderizador salida) { super(salida); }

    @Override
    String exportar() {
        salida.titulo("Ventas de noviembre");
        salida.tabla(List.of("producto", "unidades"), List.of(List.of("Teclado", "12"), List.of("Monitor", "4")));
        return salida.generar();
    }
}

class ReporteInventario extends Reporte {
    ReporteInventario(Renderizador salida) { super(salida); }

    @Override
    String exportar() {
        salida.titulo("Inventario");
        salida.tabla(List.of("sku", "stock"), List.of(List.of("TEC-01", "30"), List.of("MON-02", "0")));
        return salida.generar();
    }
}
