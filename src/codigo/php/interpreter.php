<?php
// Cada elemento de la gramática es una clase `readonly` que implementa `Expresion`. La interfaz
// extiende `Stringable` (`__toString`), así que la regla se puede imprimir con `echo` de forma
// legible, y las expresiones compuestas guardan sus hijos con promoción de propiedades.

declare(strict_types=1);

final readonly class Carrito
{
    public function __construct(public float $total, public bool $clienteFrecuente, public ?string $cupon = null) {}
}

interface Expresion extends Stringable
{
    public function interpretar(Carrito $carrito): bool;
}

final readonly class TotalMayorQue implements Expresion
{
    public function __construct(private float $limite) {}
    public function interpretar(Carrito $carrito): bool { return $carrito->total > $this->limite; }
    public function __toString(): string { return "total > {$this->limite}"; }
}

final readonly class EsClienteFrecuente implements Expresion
{
    public function interpretar(Carrito $carrito): bool { return $carrito->clienteFrecuente; }
    public function __toString(): string { return 'cliente_frecuente'; }
}

final readonly class CuponIgual implements Expresion
{
    public function __construct(private string $codigo) {}
    public function interpretar(Carrito $carrito): bool { return $carrito->cupon === $this->codigo; }
    public function __toString(): string { return "cupon = \"{$this->codigo}\""; }
}

final readonly class Y implements Expresion
{
    public function __construct(private Expresion $izquierda, private Expresion $derecha) {}
    public function interpretar(Carrito $carrito): bool { return $this->izquierda->interpretar($carrito) && $this->derecha->interpretar($carrito); }
    public function __toString(): string { return "({$this->izquierda} Y {$this->derecha})"; }
}

final readonly class O implements Expresion
{
    public function __construct(private Expresion $izquierda, private Expresion $derecha) {}
    public function interpretar(Carrito $carrito): bool { return $this->izquierda->interpretar($carrito) || $this->derecha->interpretar($carrito); }
    public function __toString(): string { return "({$this->izquierda} O {$this->derecha})"; }
}

// total > 100 Y cliente_frecuente O cupon = "VERANO"
// (en la aplicación real, este árbol lo construiría un parser a partir del texto)
$regla = new O(new Y(new TotalMayorQue(100), new EsClienteFrecuente()), new CuponIgual('VERANO'));

echo $regla, "\n";                                                             // ((total > 100 Y cliente_frecuente) O cupon = "VERANO")
var_dump($regla->interpretar(new Carrito(150, clienteFrecuente: true)));       // bool(true)
var_dump($regla->interpretar(new Carrito(150, clienteFrecuente: false)));      // bool(false)
var_dump($regla->interpretar(new Carrito(20, false, cupon: 'VERANO')));        // bool(true)
