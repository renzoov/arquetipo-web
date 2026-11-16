<?php
// El proxy implementa la misma interfaz y crea la historia real en el primer acceso con `??=`. PHP
// también ofrece alternativas: el método mágico `__call` para reenviar cualquier método, y desde PHP 8.4
// los "lazy objects" nativos (`ReflectionClass::newLazyProxy`), que usan los ORM como Doctrine.

declare(strict_types=1);

interface HistoriaClinica
{
    /** @return list<string> */
    public function diagnosticos(): array;
    /** @return list<string> */
    public function imagenes(): array;
}

final class HistoriaClinicaReal implements HistoriaClinica
{
    public function __construct(string $pacienteId)
    {
        echo "  (cargando la historia {$pacienteId} y sus estudios...)\n";
    }

    public function diagnosticos(): array { return ['Hipertensión controlada']; }
    public function imagenes(): array { return ['resonancia-2026-10.dcm']; }
}

final readonly class Usuario
{
    /** @param list<string> $pacientesAsignados */
    public function __construct(public string $id, public array $pacientesAsignados) {}
}

final class ProxyHistoriaClinica implements HistoriaClinica
{
    private ?HistoriaClinicaReal $real = null; // se crea en el primer acceso

    public function __construct(private readonly string $pacienteId, private readonly Usuario $usuario) {}

    public function diagnosticos(): array { return $this->real()->diagnosticos(); }
    public function imagenes(): array { return $this->real()->imagenes(); }

    private function real(): HistoriaClinicaReal
    {
        if (!in_array($this->pacienteId, $this->usuario->pacientesAsignados, true)) {
            throw new DomainException("Acceso denegado a la historia {$this->pacienteId}");
        }
        return $this->real ??= new HistoriaClinicaReal($this->pacienteId);
    }
}

$medica = new Usuario('dra-rios', ['P-77']);

$historia = new ProxyHistoriaClinica('P-77', $medica);
echo "Proxy creado: todavía no se cargó nada\n";
echo implode(', ', $historia->diagnosticos()), "\n"; // carga la historia la primera vez
echo count($historia->imagenes()), "\n";             // ya está cargada

try {
    (new ProxyHistoriaClinica('P-90', $medica))->diagnosticos();
} catch (DomainException $error) {
    echo $error->getMessage(), "\n"; // Acceso denegado a la historia P-90
}
