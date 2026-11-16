// Es el estilo de "programación orientada a datos" de Java 21+: el árbol es una interfaz `sealed` con
// `record`, y la evaluación es un `switch` con patrones de registro que el compilador revisa por
// completo (si falta un caso, no compila). Los métodos `default` `y`/`o` permiten escribir las reglas
// de forma encadenada.

void main() {
    // total > 100 Y cliente_frecuente O cupon = "VERANO"
    var regla = new TotalMayorQue(100).y(new EsClienteFrecuente()).o(new CuponIgual("VERANO"));

    IO.println(regla.describir());                                     // ((total > 100 Y cliente_frecuente) O cupon = "VERANO")
    IO.println(regla.interpretar(new Carrito(150, true, null)));       // true
    IO.println(regla.interpretar(new Carrito(150, false, null)));      // false
    IO.println(regla.interpretar(new Carrito(20, false, "VERANO")));   // true
}

record Carrito(double total, boolean clienteFrecuente, String cupon) {}

sealed interface Expresion permits TotalMayorQue, EsClienteFrecuente, CuponIgual, Y, O {

    default boolean interpretar(Carrito c) {
        return switch (this) {
            case TotalMayorQue(var limite) -> c.total() > limite;
            case EsClienteFrecuente() -> c.clienteFrecuente();
            case CuponIgual(var codigo) -> codigo.equals(c.cupon());
            case Y(var izquierda, var derecha) -> izquierda.interpretar(c) && derecha.interpretar(c);
            case O(var izquierda, var derecha) -> izquierda.interpretar(c) || derecha.interpretar(c);
        };
    }

    default String describir() {
        return switch (this) {
            case TotalMayorQue(var limite) -> "total > %.0f".formatted(limite);
            case EsClienteFrecuente() -> "cliente_frecuente";
            case CuponIgual(var codigo) -> "cupon = \"%s\"".formatted(codigo);
            case Y(var izquierda, var derecha) -> "(%s Y %s)".formatted(izquierda.describir(), derecha.describir());
            case O(var izquierda, var derecha) -> "(%s O %s)".formatted(izquierda.describir(), derecha.describir());
        };
    }

    default Expresion y(Expresion otra) { return new Y(this, otra); }
    default Expresion o(Expresion otra) { return new O(this, otra); }
}

record TotalMayorQue(double limite) implements Expresion {}
record EsClienteFrecuente() implements Expresion {}
record CuponIgual(String codigo) implements Expresion {}
record Y(Expresion izquierda, Expresion derecha) implements Expresion {}
record O(Expresion izquierda, Expresion derecha) implements Expresion {}
