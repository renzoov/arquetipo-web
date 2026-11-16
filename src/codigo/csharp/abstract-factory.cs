// Interfaces para cada producto y para la fábrica, y una expresión `switch` para elegir la familia;
// el descarte `_ => throw` hace que un entorno desconocido falle de forma explícita. En una aplicación
// real, la fábrica elegida se registraría una sola vez en el contenedor de inyección de dependencias.

foreach (var entorno in new[] { "nube", "on-premise", "marte" })
{
    try
    {
        Arrancar(entorno);
    }
    catch (ArgumentException error)
    {
        Console.WriteLine($"error: {error.Message}"); // error: Entorno desconocido: marte
    }
}

static void Arrancar(string entorno)
{
    IInfraestructura infra = entorno switch
    {
        "nube" => new InfraNube(),
        "on-premise" => new InfraOnPremise(),
        _ => throw new ArgumentException($"Entorno desconocido: {entorno}"),
    };
    Console.WriteLine($"[{entorno}]");
    Console.WriteLine($"  {infra.CrearAlmacenamiento().Subir("F-001.pdf")}");
    Console.WriteLine($"  {infra.CrearCola().Publicar("factura-emitida")}");
    Console.WriteLine($"  {infra.CrearSecretos().Leer("certificado-firma")}");
}

public interface IAlmacenamiento { string Subir(string nombre); }
public interface ICola { string Publicar(string mensaje); }
public interface ISecretos { string Leer(string clave); }

public interface IInfraestructura
{
    IAlmacenamiento CrearAlmacenamiento();
    ICola CrearCola();
    ISecretos CrearSecretos();
}

// ── Familia: nube ──
public class AlmacenamientoNube : IAlmacenamiento { public string Subir(string nombre) => $"objetos-nube://facturas/{nombre}"; }
public class ColaGestionada : ICola { public string Publicar(string mensaje) => $"cola gestionada ← {mensaje}"; }
public class SecretosNube : ISecretos { public string Leer(string clave) => $"gestor-de-secretos:{clave}"; }

public class InfraNube : IInfraestructura
{
    public IAlmacenamiento CrearAlmacenamiento() => new AlmacenamientoNube();
    public ICola CrearCola() => new ColaGestionada();
    public ISecretos CrearSecretos() => new SecretosNube();
}

// ── Familia: on-premise ──
public class DiscoEnRed : IAlmacenamiento { public string Subir(string nombre) => $"/mnt/nas/facturas/{nombre}"; }
public class ColaRabbit : ICola { public string Publicar(string mensaje) => $"RabbitMQ ← {mensaje}"; }
public class SecretosVault : ISecretos { public string Leer(string clave) => $"vault:{clave}"; }

public class InfraOnPremise : IInfraestructura
{
    public IAlmacenamiento CrearAlmacenamiento() => new DiscoEnRed();
    public ICola CrearCola() => new ColaRabbit();
    public ISecretos CrearSecretos() => new SecretosVault();
}
