<?php
// Los comandos implementan una interfaz y el historial es un `SplStack`, la pila de la biblioteca
// estándar de PHP. Cada comando recibe sus dependencias con promoción de propiedades y guarda lo que
// necesita para deshacerse.

declare(strict_types=1);

final class Producto
{
    public function __construct(
        public readonly string $id,
        public readonly string $categoria,
        public float $precio,
        public bool $activo = true,
    ) {}
}

final class RepoProductos
{
    /** @var array<string, Producto> */
    private array $productos = [];

    public function __construct(Producto ...$productos)
    {
        foreach ($productos as $p) $this->productos[$p->id] = $p;
    }

    /** @return list<Producto> */
    public function deCategoria(string $categoria): array
    {
        return array_values(array_filter($this->productos, fn (Producto $p) => $p->categoria === $categoria));
    }

    public function buscar(string $id): Producto
    {
        return $this->productos[$id] ?? throw new OutOfBoundsException("No existe el producto {$id}");
    }

    public function listar(): string
    {
        return implode(', ', array_map(fn (Producto $p) => "{$p->id} {$p->precio}" . ($p->activo ? '' : ' (inactivo)'), $this->productos));
    }
}

interface Comando
{
    public function descripcion(): string;
    public function ejecutar(): void;
    public function deshacer(): void;
}

final class AjustarPrecios implements Comando
{
    /** @var array<string, float> */
    private array $anteriores = [];

    public function __construct(private readonly RepoProductos $repo, private readonly string $categoria, private readonly float $factor) {}

    public function descripcion(): string { return "Ajustar precios de {$this->categoria} ×{$this->factor}"; }

    public function ejecutar(): void
    {
        foreach ($this->repo->deCategoria($this->categoria) as $producto) {
            $this->anteriores[$producto->id] = $producto->precio;
            $producto->precio = round($producto->precio * $this->factor, 2);
        }
    }

    public function deshacer(): void
    {
        foreach ($this->anteriores as $id => $precio) $this->repo->buscar($id)->precio = $precio;
    }
}

final readonly class DesactivarProducto implements Comando
{
    public function __construct(private RepoProductos $repo, private string $id) {}

    public function descripcion(): string { return "Desactivar {$this->id}"; }
    public function ejecutar(): void { $this->repo->buscar($this->id)->activo = false; }
    public function deshacer(): void { $this->repo->buscar($this->id)->activo = true; }
}

final class Invocador
{
    /** @var SplStack<Comando> */
    private SplStack $historial;

    public function __construct() { $this->historial = new SplStack(); }

    public function ejecutar(Comando $comando, string $usuario): void
    {
        $comando->ejecutar();
        $this->historial->push($comando);
        echo "[auditoría] {$usuario}: {$comando->descripcion()}\n";
    }

    public function deshacerUltimo(): void
    {
        if (!$this->historial->isEmpty()) $this->historial->pop()->deshacer();
    }
}

$repo = new RepoProductos(
    new Producto('teclado', 'perifericos', 100),
    new Producto('mouse', 'perifericos', 40),
    new Producto('monitor', 'pantallas', 900),
);
$panel = new Invocador();

$panel->ejecutar(new AjustarPrecios($repo, 'perifericos', 1.1), 'ana');
$panel->ejecutar(new DesactivarProducto($repo, 'monitor'), 'ana');
echo $repo->listar(), "\n"; // teclado 110, mouse 44, monitor 900 (inactivo)

$panel->deshacerUltimo();
$panel->deshacerUltimo();
echo $repo->listar(), "\n"; // teclado 100, mouse 40, monitor 900
