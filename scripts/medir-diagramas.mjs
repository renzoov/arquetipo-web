// Mide el alto de cada diagrama de Archify (public/diagrams) a distintos anchos y lo guarda en
// src/data/alturas-diagramas.json. La web usa esos altos para reservar el espacio del diagrama antes
// de cargarlo, así la página no "salta" cuando aparece.
//
// Uso: npm run medir:diagramas   (volver a ejecutarlo cada vez que se regeneren los diagramas)
// Requiere Playwright con Chromium instalado.
import { chromium } from 'playwright';
import { readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const carpeta = join(raiz, 'public', 'diagrams');
const DESDE = 280;
const HASTA = 1280;
const PASO = 20;

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
const alturas = {};

for (const archivo of readdirSync(carpeta).filter((f) => f.endsWith('.class.html')).sort()) {
  const altos = [];
  for (let ancho = DESDE; ancho <= HASTA; ancho += PASO) {
    await pagina.setViewportSize({ width: ancho, height: 3000 });
    await pagina.goto(pathToFileURL(join(carpeta, archivo)).href, { waitUntil: 'load' });
    await pagina.evaluate(() => document.fonts.ready);
    // Mismo cálculo que el ajuste de alto del Layout: fondo del último elemento visible + margen superior.
    // Archify termina de dibujar partes (como el índice de nodos) después de cargar: se mide hasta que el
    // alto queda estable.
    altos.push(
      await pagina.evaluate(async () => {
        const medir = () => {
          const contenido = document.querySelector('.container') ?? document.body;
          let fondo = 0;
          for (const hijo of Array.from(contenido.children)) {
            const r = hijo.getBoundingClientRect();
            if (r.height > 0) fondo = Math.max(fondo, r.bottom);
          }
          const margen = parseFloat(getComputedStyle(document.body).paddingTop) || 20;
          return Math.ceil(fondo + window.scrollY + margen);
        };
        let anterior = -1;
        let estables = 0;
        for (let i = 0; i < 40 && estables < 4; i++) {
          await new Promise((r) => setTimeout(r, 100));
          const actual = medir();
          estables = actual === anterior ? estables + 1 : 0;
          anterior = actual;
        }
        return anterior;
      }),
    );
  }
  alturas[archivo] = altos;
  console.log(`✓ ${archivo}`);
}

await navegador.close();
writeFileSync(join(raiz, 'src', 'data', 'alturas-diagramas.json'), JSON.stringify({ desde: DESDE, paso: PASO, alturas }) + '\n');
console.log(`\n${Object.keys(alturas).length} diagramas medidos → src/data/alturas-diagramas.json`);
