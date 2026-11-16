<?php
// En PHP cada petición web empieza desde cero, así que un singleton vive lo que dura la petición. La
// forma clásica usa un constructor privado, `??=` para crear la instancia una sola vez y `__clone`
// privado para que no se pueda copiar. En Laravel no se escribe a mano: `$app->singleton(...)`.

declare(strict_types=1);

final class Configuracion
{
    private static ?self $instancia = null;

    /** @var array<string, bool> */
    private array $flags;

    private function __construct()
    {
        echo "Cargando configuración (solo ocurre una vez)...\n";
        $this->flags = ['pagos.billetera' => true, 'envios.express' => false];
    }

    private function __clone() {}

    public static function obtener(): self
    {
        return self::$instancia ??= new self();
    }

    public function estaActiva(string $flag): bool
    {
        return $this->flags[$flag] ?? false;
    }
}

$desdePagos = Configuracion::obtener();
$desdeEnvios = Configuracion::obtener();

var_dump($desdePagos === $desdeEnvios);                   // bool(true)
var_dump($desdePagos->estaActiva('pagos.billetera'));     // bool(true)
var_dump($desdeEnvios->estaActiva('envios.express'));     // bool(false)
// new Configuracion();  ← Error: el constructor es privado
