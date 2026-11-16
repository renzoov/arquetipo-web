// Una estrategia puede ser simplemente un delegado `Func<Pedido, decimal>`: las lambdas y las funciones
// que devuelven funciones sustituyen a una clase por algoritmo. Para dinero se usa `decimal`, que no
// tiene los errores de redondeo de `double`.

var tarifasPais = new Dictionary<string, decimal> { ["US"] = 45, ["ES"] = 60 };

(string Nombre, Func<Pedido, decimal> Calcular)[] modalidades =
[
    ("ciudad", TarifaPlana(10)),
    ("nacional", PorPeso(4.5m)),
    ("internacional", pedido => tarifasPais.GetValueOrDefault(pedido.Pais, 80)),
    ("campania", TarifaPlana(0)),
];

var pedidoEjemplo = new Pedido(Subtotal: 200, PesoKg: 3.2m, Pais: "ES");

// La modalidad la elige el cliente en tiempo de ejecución
foreach (var (nombre, calcular) in modalidades)
    Console.WriteLine($"{nombre,-14} {TotalConEnvio(pedidoEjemplo, calcular):0.##}");
// ciudad 210 · nacional 214.4 · internacional 260 · campania 200

static Func<Pedido, decimal> TarifaPlana(decimal monto) => _ => monto;

static Func<Pedido, decimal> PorPeso(decimal precioPorKg) => pedido => Math.Round(pedido.PesoKg * precioPorKg, 2);

static decimal TotalConEnvio(Pedido pedido, Func<Pedido, decimal> calcularEnvio) => pedido.Subtotal + calcularEnvio(pedido);

public record Pedido(decimal Subtotal, decimal PesoKg, string Pais);
