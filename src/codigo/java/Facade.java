// Las piezas del subsistema son clases anidadas `private static`: fuera de la fachada no existen.
// La función de envío se recibe como `Function<String, String>` para poder sustituirla en pruebas,
// y `Locale.ROOT` fija el formato de los números (punto decimal) sin depender del sistema.

void main() {
    var facturacion = new FacturacionElectronica();
    IO.println(facturacion.emitir(new Venta("000123", "20123456789", 118)));
    // Comprobante[serie=F001-000123, constancia=CONSTANCIA-52]

    try {
        facturacion.emitir(new Venta("000125", "123", 10));
    } catch (IllegalArgumentException error) {
        IO.println(error.getMessage()); // Número fiscal inválido: 123
    }

    // En una prueba, sin llamar a la autoridad tributaria real
    var prueba = new FacturacionElectronica(xml -> "CONSTANCIA-PRUEBA");
    IO.println(prueba.emitir(new Venta("000124", "20123456789", 50)));
}

record Venta(String id, String numeroFiscal, double total) {}
record Comprobante(String serie, String constancia) {}

final class FacturacionElectronica {
    private final Function<String, String> enviar;

    FacturacionElectronica() {
        this(AutoridadTributaria::enviar);
    }

    FacturacionElectronica(Function<String, String> enviar) {
        this.enviar = enviar;
    }

    // La fachada: una sola operación pública
    Comprobante emitir(Venta venta) {
        ValidadorFiscal.validar(venta.numeroFiscal());
        var xmlFirmado = FirmadorDigital.firmar(GeneradorXml.crear(venta));
        return new Comprobante("F001-" + venta.id(), enviar.apply(xmlFirmado));
    }

    // ── Subsistema: invisible fuera de la fachada ──
    private static final class ValidadorFiscal {
        static void validar(String numero) {
            if (!numero.matches("\\d{11}")) throw new IllegalArgumentException("Número fiscal inválido: " + numero);
        }
    }

    private static final class GeneradorXml {
        static String crear(Venta venta) {
            return String.format(Locale.ROOT, "<Factura id=\"%s\" total=\"%.2f\"/>", venta.id(), venta.total());
        }
    }

    private static final class FirmadorDigital {
        static String firmar(String xml) {
            return xml.replace("/>", " firma=\"a1b2c3\"/>");
        }
    }

    private static final class AutoridadTributaria {
        static String enviar(String xmlFirmado) {
            return "CONSTANCIA-" + xmlFirmado.length();
        }
    }
}
