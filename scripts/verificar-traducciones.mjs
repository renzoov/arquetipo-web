// Comprueba que todo el contenido tiene traducción al inglés:
//   1. Cada comentario del código de ejemplo (src/codigo y los fragmentos de código del contenido).
//   2. Cada texto de los 23 patrones (src/data/patterns.en.ts).
//
// Uso:
//   npm run verificar:traducciones                 → lista lo que falta y termina con error si falta algo
//   npm run verificar:traducciones -- --pendientes x.json   → además guarda los comentarios pendientes en x.json
//
// Requiere Node 22.18+ (ejecuta los módulos .ts del proyecto quitando los tipos).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { textosDeComentarios } = await import('../src/i18n/comentarios.ts');
const { COMENTARIOS_EN } = await import('../src/i18n/comentarios/en/index.ts');
const { fragmentosDeCodigo } = await import('../src/contenido/fragmentos.ts');
const { PATTERNS } = await import('../src/data/patterns.ts');
const { PATRONES_EN } = await import('../src/data/patterns.en.ts');

const MARCADORES = { python: '#' };

/** @type {Map<string, Set<string>>} texto → lugares donde aparece */
const pendientes = new Map();
const anotar = (texto, lugar) => {
  if (COMENTARIOS_EN[texto] !== undefined) return;
  if (!pendientes.has(texto)) pendientes.set(texto, new Set());
  pendientes.get(texto).add(lugar);
};

// 1a. Archivos de código por lenguaje
const carpeta = join(raiz, 'src', 'codigo');
for (const lenguaje of readdirSync(carpeta)) {
  for (const archivo of readdirSync(join(carpeta, lenguaje))) {
    const codigo = readFileSync(join(carpeta, lenguaje, archivo), 'utf8');
    const opciones = { marcador: MARCADORES[lenguaje] ?? '//', sinComillaSimple: lenguaje === 'rust' };
    for (const texto of textosDeComentarios(codigo, opciones)) anotar(texto, `${lenguaje}/${archivo}`);
  }
}

// 1b. Fragmentos de código del contenido (patrones, POO, SOLID, comparaciones…)
for (const { lugar, codigo } of fragmentosDeCodigo()) {
  for (const texto of textosDeComentarios(codigo, { marcador: '//' })) anotar(texto, lugar);
}

// 2. Textos de los patrones
const camposTexto = ['aka', 'purpose', 'problema', 'historiaReal', 'dolorIngenuo', 'solucionPatron', 'principiosClave', 'cuandoUsarlo', 'cuandoNoUsarlo', 'relaciones'];
const faltanPatrones = [];
for (const patron of PATTERNS) {
  const en = PATRONES_EN[patron.slug];
  const campos = [...camposTexto, ...(patron.nota ? ['nota'] : [])];
  const faltan = en ? campos.filter((c) => !en[c] || (Array.isArray(patron[c]) && en[c].length !== patron[c].length)) : campos;
  if (faltan.length) faltanPatrones.push(`${patron.slug}: ${faltan.join(', ')}`);
}

const argumentos = process.argv.slice(2);
const iSalida = argumentos.indexOf('--pendientes');
if (iSalida >= 0) {
  const salida = Object.fromEntries([...pendientes].map(([texto, lugares]) => [texto, [...lugares].join(' · ')]));
  writeFileSync(argumentos[iSalida + 1], JSON.stringify(salida, null, 2));
}

console.log(`Comentarios sin traducir: ${pendientes.size}`);
for (const [texto, lugares] of [...pendientes].slice(0, 15)) console.log(`  · ${JSON.stringify(texto)}  (${[...lugares][0]})`);
if (pendientes.size > 15) console.log(`  … y ${pendientes.size - 15} más`);
console.log(`Patrones con textos sin traducir: ${faltanPatrones.length}`);
for (const f of faltanPatrones) console.log(`  · ${f}`);

process.exit(pendientes.size || faltanPatrones.length ? 1 : 0);
