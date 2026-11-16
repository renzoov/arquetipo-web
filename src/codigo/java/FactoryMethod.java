// Java está muy cerca del Factory Method clásico: una clase `abstract` declara el método fábrica y el
// compilador obliga a cada subclase a implementarlo. Los datos son `record` y el dinero se maneja con
// `BigDecimal`, sin los errores de redondeo de `double`. (Archivo compacto de Java 25+: `void main()`
// sin clase envolvente.)

void main() {
    var ventas = Map.of("F-001", new BigDecimal("150"), "F-002", new BigDecimal("80"));

    IO.println(new ConciliadorBancoAndino().conciliar("2026-11-01;F-001;150\n2026-11-01;F-002;75", ventas));
    // [F-002: banco 75, ventas 80]
    IO.println(new ConciliadorBancoPacifico().conciliar("2026-11-01F-001   150\n2026-11-02F-003   40", ventas));
    // [F-003: banco 40, ventas sin registro]
}

record Movimiento(String fecha, String referencia, BigDecimal monto) {}

interface LectorExtracto {
    List<Movimiento> leer(String contenido);
}

class LectorCsvAndino implements LectorExtracto {
    @Override
    public List<Movimiento> leer(String contenido) {
        return contenido.strip().lines()
                .map(linea -> linea.split(";"))
                .map(partes -> new Movimiento(partes[0], partes[1], new BigDecimal(partes[2])))
                .toList();
    }
}

class LectorTxtPacifico implements LectorExtracto {
    // Ancho fijo: fecha (10) + referencia (8) + monto (resto)
    @Override
    public List<Movimiento> leer(String contenido) {
        return contenido.strip().lines()
                .map(l -> new Movimiento(l.substring(0, 10), l.substring(10, 18).strip(), new BigDecimal(l.substring(18).strip())))
                .toList();
    }
}

abstract class Conciliador {
    // Método fábrica: cada subclase decide qué lector crear
    protected abstract LectorExtracto crearLector();

    List<String> conciliar(String contenido, Map<String, BigDecimal> ventas) {
        var diferencias = new ArrayList<String>();
        for (var mov : crearLector().leer(contenido)) {
            var esperado = ventas.get(mov.referencia());
            if (esperado == null) {
                diferencias.add(mov.referencia() + ": banco " + mov.monto() + ", ventas sin registro");
            } else if (esperado.compareTo(mov.monto()) != 0) {
                diferencias.add(mov.referencia() + ": banco " + mov.monto() + ", ventas " + esperado);
            }
        }
        return diferencias;
    }
}

class ConciliadorBancoAndino extends Conciliador {
    @Override
    protected LectorExtracto crearLector() {
        return new LectorCsvAndino();
    }
}

class ConciliadorBancoPacifico extends Conciliador {
    @Override
    protected LectorExtracto crearLector() {
        return new LectorTxtPacifico();
    }
}
