<?php
// Con los argumentos con nombre de PHP 8, `new Busqueda(texto: ..., orden: ...)` ya evita el
// constructor telescópico. El builder aporta cuando el objeto se arma por pasos: aquí es inmutable y
// cada paso devuelve una copia con `clone($this, [...])`, la sintaxis "clone with" de PHP 8.5.

declare(strict_types=1);

enum Orden: string
{
    case Relevancia = 'relevancia';
    case Descuento = 'descuento';
    case Novedad = 'novedad';
}

final readonly class Busqueda
{
    public function __construct(
        public ?string $texto = null,
        public ?float $precioMin = null,
        public ?float $precioMax = null,
        public bool $soloConStock = false,
        public Orden $orden = Orden::Relevancia,
    ) {
        if ($precioMin !== null && $precioMax !== null && $precioMin > $precioMax) {
            throw new InvalidArgumentException('Rango de precio inválido');
        }
    }
}

final readonly class BusquedaBuilder
{
    public function __construct(
        private ?string $texto = null,
        private ?float $precioMin = null,
        private ?float $precioMax = null,
        private bool $soloConStock = false,
        private Orden $orden = Orden::Relevancia,
    ) {}

    public function texto(string $texto): static { return clone($this, ['texto' => trim($texto)]); }
    public function precioEntre(float $min, float $max): static { return clone($this, ['precioMin' => $min, 'precioMax' => $max]); }
    public function soloConStock(): static { return clone($this, ['soloConStock' => true]); }
    public function ordenarPor(Orden $orden): static { return clone($this, ['orden' => $orden]); }

    public function build(): Busqueda
    {
        return new Busqueda($this->texto, $this->precioMin, $this->precioMax, $this->soloConStock, $this->orden);
    }
}

// Construcción por pasos, por ejemplo a partir de los parámetros de la URL
$parametros = ['q' => '  zapatillas ', 'min' => '50', 'max' => '120', 'stock' => '1'];
$builder = new BusquedaBuilder();
if (isset($parametros['q'])) $builder = $builder->texto($parametros['q']);
if (isset($parametros['min'], $parametros['max'])) $builder = $builder->precioEntre((float) $parametros['min'], (float) $parametros['max']);
if (($parametros['stock'] ?? '') === '1') $builder = $builder->soloConStock();
var_dump($builder->build());

// Con todos los datos a mano, bastan los argumentos con nombre
echo (new Busqueda(texto: 'auriculares', orden: Orden::Novedad))->orden->value, "\n"; // novedad

try {
    (new BusquedaBuilder())->precioEntre(200, 100)->build();
} catch (InvalidArgumentException $error) {
    echo $error->getMessage(), "\n"; // Rango de precio inválido
}
