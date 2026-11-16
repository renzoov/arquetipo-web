<?php
// La colección implementa `IteratorAggregate` y su `getIterator()` es un generador: con `yield from`
// entrega los clientes de cada página. Se recorre con `foreach`, y como los generadores son
// perezosos, un `break` evita pedir más páginas.

declare(strict_types=1);

final readonly class Cliente
{
    public function __construct(public int $id, public string $nombre) {}
}

final class ApiCrm
{
    public int $peticiones = 0;
    /** @var list<Cliente> */
    private array $clientes;

    public function __construct()
    {
        $this->clientes = array_map(
            fn (int $i, string $nombre) => new Cliente($i + 1, $nombre),
            array_keys($nombres = ['Ana', 'Luis', 'Marta', 'Jorge', 'Elena']),
            $nombres,
        );
    }

    /** @return array{datos: list<Cliente>, siguiente: ?int} */
    public function listarClientes(int $limite, int $cursor): array
    {
        $this->peticiones++;
        $hasta = min($cursor + $limite, count($this->clientes));
        return [
            'datos' => array_slice($this->clientes, $cursor, $limite),
            'siguiente' => $hasta < count($this->clientes) ? $hasta : null,
        ];
    }
}

/** @implements IteratorAggregate<int, Cliente> */
final readonly class ClientesCrm implements IteratorAggregate
{
    public function __construct(private ApiCrm $api, private int $limite = 2) {}

    public function getIterator(): Generator
    {
        $cursor = 0;
        do {
            $pagina = $this->api->listarClientes($this->limite, $cursor);
            yield from $pagina['datos'];
            $cursor = $pagina['siguiente'];
        } while ($cursor !== null);
    }
}

$crm = new ApiCrm();
foreach (new ClientesCrm($crm) as $cliente) {
    echo $cliente->nombre, "\n";
}
echo "Peticiones a la API: {$crm->peticiones}\n"; // 3

$otroCrm = new ApiCrm();
foreach (new ClientesCrm($otroCrm) as $cliente) {
    if ($cliente->id === 2) break;
}
echo "Peticiones a la API: {$otroCrm->peticiones}\n"; // 1
