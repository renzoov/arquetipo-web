// Índice del buscador global (Ctrl+K): un JSON estático con todo lo que se puede buscar.
// El navegador lo descarga la primera vez que se abre el buscador.
import type { APIRoute } from 'astro';
import { ui } from '../contenido/ui.ts';
import { PATRONES, nombrePatron, rutaPatron } from '../data/catalogo.ts';
import { LENGUAJES } from '../data/lenguajes.ts';
import { PRINCIPIOS_SOLID, ENCABEZADO as SOLID } from '../contenido/solid.ts';
import { PRINCIPIOS_DISENO, ENCABEZADO as DISENO } from '../contenido/diseno.ts';
import { PILARES, RELACIONES, ENCABEZADO as POO } from '../contenido/poo.ts';
import { COMPARACIONES, ENCABEZADO as COMPARAR } from '../contenido/comparaciones.ts';
import { ANTIPATRONES, ENCABEZADO as ANTI } from '../contenido/antipatrones.ts';

interface EntradaBusqueda {
  /** Título que se muestra. */
  t: string;
  /** Descripción corta. */
  d: string;
  /** Tipo (Patrón, Principio…). */
  k: string;
  /** Icono de Material Symbols. */
  i: string;
  /** Enlace. */
  u: string;
  /** Texto extra para buscar (no se muestra). */
  x?: string;
}

const sinHtml = (s: string) => s.replace(/<[^>]+>/g, '');
const corto = (s: string, n = 140) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function indice(): EntradaBusqueda[] {
  return [
    // Páginas
    { t: POO.titulo, d: corto(POO.intro), k: ui.tipoPagina, i: 'account_tree', u: '/fundamentos/poo' },
    { t: DISENO.titulo, d: corto(DISENO.intro), k: ui.tipoPagina, i: 'lightbulb', u: '/principios/diseno' },
    { t: SOLID.titulo, d: corto(SOLID.intro), k: ui.tipoPagina, i: 'memory', u: '/principios/solid' },
    { t: COMPARAR.titulo, d: corto(COMPARAR.intro), k: ui.tipoPagina, i: 'compare_arrows', u: '/comparaciones' },
    { t: ANTI.titulo, d: corto(ANTI.intro), k: ui.tipoPagina, i: 'report', u: '/antipatrones' },

    // Patrones: se buscan por nombre, alias y, sobre todo, por el problema que resuelven
    ...PATRONES.map((p) => ({
      t: p.name,
      d: corto(p.problema),
      k: `${ui.tipoPatron} · ${p.categoryLabel}`,
      i: 'category',
      u: rutaPatron(p.slug),
      x: `${p.aka} ${p.purpose}`,
    })),

    // Pilares y relaciones de la POO
    ...PILARES.map((p) => ({
      t: p.nombre,
      d: corto(sinHtml(p.explicacion)),
      k: ui.tipoPilar,
      i: 'account_tree',
      u: `/fundamentos/poo#${p.id}`,
      x: p.lema,
    })),
    ...RELACIONES.map((rel) => ({
      t: rel.nombre,
      d: corto(rel.texto),
      k: ui.tipoPilar,
      i: 'hub',
      u: '/fundamentos/poo',
      x: rel.subtitulo,
    })),

    // Principios
    ...PRINCIPIOS_DISENO.map((p) => ({
      t: p.nombre,
      d: corto(p.definicion),
      k: ui.tipoPrincipio,
      i: p.icono,
      u: `/principios/diseno#${p.id}`,
      x: `${p.lema} ${p.sintoma}`,
    })),
    ...PRINCIPIOS_SOLID.map((p) => ({
      t: `${p.letra} · ${p.nombre}`,
      d: corto(p.idea),
      k: `${ui.tipoPrincipio} SOLID`,
      i: 'memory',
      u: `/principios/solid#${p.id}`,
      x: `${p.siglas} ${p.ingles} ${p.lema} ${p.sintomaCorto}`,
    })),

    // Comparaciones y antipatrones
    ...COMPARACIONES.map((c) => ({
      t: c.patrones.map(nombrePatron).join(' vs '),
      d: corto(c.idea),
      k: ui.tipoComparacion,
      i: 'compare_arrows',
      u: `/comparaciones#${c.id}`,
      x: c.caso,
    })),
    ...ANTIPATRONES.map((a) => ({
      t: a.nombre,
      d: corto(a.sintoma),
      k: ui.tipoAntipatron,
      i: a.icono,
      u: `/antipatrones#${a.id}`,
      x: `${a.alias} ${a.correccion}`,
    })),

    // Lenguajes
    ...LENGUAJES.map((l) => ({
      t: l.nombre,
      d: l.desc,
      k: ui.tipoLenguaje,
      i: 'code_blocks',
      u: `/lenguajes/${l.id}`,
      x: l.rasgos.join(' '),
    })),
  ];
}

export const GET: APIRoute = () =>
  new Response(JSON.stringify(indice()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
