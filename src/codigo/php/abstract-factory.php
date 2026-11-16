<?php
// Los entornos son un `enum` respaldado por texto: `Entorno::from('nube')` convierte la
// configuración en un caso válido o lanza `ValueError`. El método `fabrica()` usa `match` para
// devolver la fábrica concreta de cada familia.

declare(strict_types=1);

interface Almacenamiento { public function subir(string $nombre): string; }
interface Cola { public function publicar(string $mensaje): string; }
interface Secretos { public function leer(string $clave): string; }

interface Infraestructura
{
    public function crearAlmacenamiento(): Almacenamiento;
    public function crearCola(): Cola;
    public function crearSecretos(): Secretos;
}

// ── Familia: nube ──
final class AlmacenamientoNube implements Almacenamiento { public function subir(string $nombre): string { return "objetos-nube://facturas/{$nombre}"; } }
final class ColaGestionada implements Cola { public function publicar(string $mensaje): string { return "cola gestionada ← {$mensaje}"; } }
final class SecretosNube implements Secretos { public function leer(string $clave): string { return "gestor-de-secretos:{$clave}"; } }

final class InfraNube implements Infraestructura
{
    public function crearAlmacenamiento(): Almacenamiento { return new AlmacenamientoNube(); }
    public function crearCola(): Cola { return new ColaGestionada(); }
    public function crearSecretos(): Secretos { return new SecretosNube(); }
}

// ── Familia: on-premise ──
final class DiscoEnRed implements Almacenamiento { public function subir(string $nombre): string { return "/mnt/nas/facturas/{$nombre}"; } }
final class ColaRabbit implements Cola { public function publicar(string $mensaje): string { return "RabbitMQ ← {$mensaje}"; } }
final class SecretosVault implements Secretos { public function leer(string $clave): string { return "vault:{$clave}"; } }

final class InfraOnPremise implements Infraestructura
{
    public function crearAlmacenamiento(): Almacenamiento { return new DiscoEnRed(); }
    public function crearCola(): Cola { return new ColaRabbit(); }
    public function crearSecretos(): Secretos { return new SecretosVault(); }
}

enum Entorno: string
{
    case Nube = 'nube';
    case OnPremise = 'on-premise';

    public function fabrica(): Infraestructura
    {
        return match ($this) {
            self::Nube => new InfraNube(),
            self::OnPremise => new InfraOnPremise(),
        };
    }
}

foreach (['nube', 'on-premise', 'marte'] as $configuracion) {
    try {
        $infra = Entorno::from($configuracion)->fabrica(); // se elige UNA vez
        echo "[{$configuracion}]\n";
        echo '  ', $infra->crearAlmacenamiento()->subir('F-001.pdf'), "\n";
        echo '  ', $infra->crearCola()->publicar('factura-emitida'), "\n";
        echo '  ', $infra->crearSecretos()->leer('certificado-firma'), "\n";
    } catch (ValueError) {
        echo "error: entorno desconocido: {$configuracion}\n";
    }
}
