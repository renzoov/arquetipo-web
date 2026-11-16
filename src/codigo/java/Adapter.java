// El resultado es una interfaz `sealed` con sus casos como `record`. Quien lo recibe usa un `switch`
// con patrones de registro (`case Aprobado(var operacion)`): como la interfaz es sellada, el compilador
// sabe que no hay más casos y no hace falta un `default`.

void main() {
    PasarelaPago pasarela = new AdaptadorPagoLocal(new SdkPagoLocal());
    var tarjeta = new Tarjeta("4111111111111111", "12/28");

    for (var monto : List.of(250.0, 1500.0)) {
        var mensaje = switch (pasarela.cobrar(monto, tarjeta)) {
            case Aprobado(var operacion) -> "aprobado → " + operacion;
            case Rechazado(var motivo) -> "rechazado → " + motivo;
            case Reintentar() -> "reintentar más tarde";
        };
        IO.println(mensaje); // aprobado → TX-tok_1111 · rechazado → Código del proveedor 05
    }
}

record Tarjeta(String numero, String vencimiento) {}

sealed interface ResultadoPago permits Aprobado, Rechazado, Reintentar {}
record Aprobado(String operacion) implements ResultadoPago {}
record Rechazado(String motivo) implements ResultadoPago {}
record Reintentar() implements ResultadoPago {}

interface PasarelaPago {
    ResultadoPago cobrar(double monto, Tarjeta tarjeta);
}

// SDK de un tercero: no se puede modificar
class SdkPagoLocal {
    String tokenizar(Tarjeta tarjeta) {
        return "tok_" + tarjeta.numero().substring(tarjeta.numero().length() - 4);
    }

    Map<String, String> crearTransaccion(long importeCentimos, String token) {
        return importeCentimos > 100_000
                ? Map.of("codigo", "05")
                : Map.of("codigo", "00", "id", "TX-" + token);
    }
}

class AdaptadorPagoLocal implements PasarelaPago {
    private final SdkPagoLocal sdk;

    AdaptadorPagoLocal(SdkPagoLocal sdk) {
        this.sdk = sdk;
    }

    @Override
    public ResultadoPago cobrar(double monto, Tarjeta tarjeta) {
        var respuesta = sdk.crearTransaccion(Math.round(monto * 100), sdk.tokenizar(tarjeta));
        return switch (respuesta.get("codigo")) {
            case "00" -> new Aprobado(respuesta.get("id"));
            case "91" -> new Reintentar();
            case String codigo -> new Rechazado("Código del proveedor " + codigo);
        };
    }
}
