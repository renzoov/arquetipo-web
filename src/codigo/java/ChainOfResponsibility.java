// Es el diseño de los filtros de Servlet (`Filter` + `FilterChain`) y de Spring Security: cada control
// recibe el pago y el resto de la cadena. Como `Control` es una interfaz funcional, cada control es
// una lambda, y `cadena` los encadena del último al primero.

void main() {
    var revisar = Controles.cadena(Controles.LISTA_BLOQUEO, Controles.limiteDiario(1000), Controles.MISMO_PAIS);

    var pago = new Pago("4111111111111111", "cli-2", 120, "PE", "PE");
    IO.println(revisar.apply(pago));                                                     // Resultado[aprobado=true, motivo=null]
    IO.println(revisar.apply(new Pago("4111111111111111", "cli-1", 120, "PE", "PE")));   // Supera el límite diario
    IO.println(revisar.apply(new Pago("4111111111111111", "cli-2", 120, "PE", "RU")));   // El país de conexión no coincide
}

record Pago(String tarjeta, String cliente, double monto, String paisTarjeta, String paisConexion) {}

record Resultado(boolean aprobado, String motivo) {
    static Resultado ok() { return new Resultado(true, null); }
    static Resultado rechazado(String motivo) { return new Resultado(false, motivo); }
}

@FunctionalInterface
interface Control {
    Resultado revisar(Pago pago, Function<Pago, Resultado> siguiente);
}

final class Controles {
    private static final Set<String> TARJETAS_BLOQUEADAS = Set.of("4000000000000002");
    private static final Map<String, Double> GASTADO_HOY = Map.of("cli-1", 900.0);

    static final Control LISTA_BLOQUEO = (pago, siguiente) ->
            TARJETAS_BLOQUEADAS.contains(pago.tarjeta()) ? Resultado.rechazado("Tarjeta bloqueada") : siguiente.apply(pago);

    static final Control MISMO_PAIS = (pago, siguiente) ->
            pago.paisTarjeta().equals(pago.paisConexion()) ? siguiente.apply(pago) : Resultado.rechazado("El país de conexión no coincide");

    static Control limiteDiario(double limite) {
        return (pago, siguiente) -> GASTADO_HOY.getOrDefault(pago.cliente(), 0.0) + pago.monto() > limite
                ? Resultado.rechazado("Supera el límite diario")
                : siguiente.apply(pago);
    }

    static Function<Pago, Resultado> cadena(Control... controles) {
        Function<Pago, Resultado> resto = pago -> Resultado.ok(); // final: todo en orden
        for (var i = controles.length - 1; i >= 0; i--) {
            var control = controles[i];
            var siguiente = resto;
            resto = pago -> control.revisar(pago, siguiente);
        }
        return resto;
    }
}
