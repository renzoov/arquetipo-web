// Todos los fragmentos de código del contenido, para revisar que sus comentarios estén traducidos.
import { PATTERNS } from '../data/patterns.ts';
import { PILARES, RELACIONES } from './poo.ts';
import { PRINCIPIOS_SOLID } from './solid.ts';
import { PRINCIPIOS_DISENO } from './diseno.ts';
import { COMPARACIONES } from './comparaciones.ts';
import { ANTIPATRONES } from './antipatrones.ts';

export function fragmentosDeCodigo(): { lugar: string; codigo: string }[] {
  return [
    ...PATTERNS.flatMap((p) => [
      { lugar: `patrón ${p.slug} (antes)`, codigo: p.codigoProblematico },
      { lugar: `patrón ${p.slug} (después)`, codigo: p.codigoSolucion },
    ]),
    ...PILARES.map((p) => ({ lugar: `POO ${p.id}`, codigo: p.codigo })),
    ...RELACIONES.map((r) => ({ lugar: `POO ${r.nombre.es}`, codigo: r.codigo })),
    ...[...PRINCIPIOS_SOLID, ...PRINCIPIOS_DISENO].flatMap((p) => [
      { lugar: `principio ${p.id} (antes)`, codigo: p.antes },
      { lugar: `principio ${p.id} (después)`, codigo: p.despues },
    ]),
    ...COMPARACIONES.flatMap((c) => c.soluciones.map((s) => ({ lugar: `comparación ${c.id} (${s.patron})`, codigo: s.codigo }))),
    ...ANTIPATRONES.flatMap((a) => [
      { lugar: `antipatrón ${a.id} (antes)`, codigo: a.antes },
      { lugar: `antipatrón ${a.id} (después)`, codigo: a.despues },
    ]),
  ];
}
