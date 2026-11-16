// El formato compartido es un `record` (inmutable y con igualdad por valor), así que sirve directamente
// como clave de diccionario. `GetOrAdd` de `ConcurrentDictionary` lo guarda solo la primera vez y es
// seguro con varios hilos. La celda es un `record struct`: no crea un objeto aparte por celda.

using System.Collections.Concurrent;

var fabrica = new FabricaFormatos();
var celdas = new List<Celda>(100_000);

for (var fila = 0; fila < 1000; fila++)
    for (var columna = 0; columna < 100; columna++)
        celdas.Add(new Celda(fila, columna, "", fabrica.Obtener(new Formato(
            "Inter", 11,
            fila == 0 ? "#000000" : "#333333",
            columna == 0 ? "@" : "#,##0.00"))));

Console.WriteLine($"{celdas.Count} celdas comparten {fabrica.Total} formatos"); // 100000 celdas comparten 4 formatos
Console.WriteLine(ReferenceEquals(celdas[101].Formato, celdas[102].Formato));   // True: el mismo objeto

public sealed record Formato(string Fuente, int Tamano, string Color, string FormatoNumero);

public record struct Celda(int Fila, int Columna, string Valor, Formato Formato);

public class FabricaFormatos
{
    private readonly ConcurrentDictionary<Formato, Formato> _cache = new();

    public Formato Obtener(Formato datos) => _cache.GetOrAdd(datos, datos);

    public int Total => _cache.Count;
}
