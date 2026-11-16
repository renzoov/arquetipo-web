// Verifica que los diagramas de Archify (iframes) se vean completos, sin cortes, y que el alto que se
// reserva antes de cargarlos coincida con el alto final (si no, la página salta al cargarlos).
// Uso: con el servidor de desarrollo levantado (astro dev), ejecutar:
//   npm run check:diagrams
// Opcional: BASE_URL=http://localhost:4321 npm run check:diagrams
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';

const FIXED_PAGES = ['/principios/solid', '/fundamentos/poo'];

async function checkDiagrams() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  let failures = 0;

  // Las páginas de patrones se descubren desde los enlaces del catálogo de inicio
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
  const patternPages = await page.$$eval('a[href^="/patrones/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
  const PAGES = [...FIXED_PAGES, ...patternPages];

  for (const path of PAGES) {
    const url = BASE_URL + path;
    console.log(`\nPágina: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    // Los diagramas se cargan al acercarse a ellos: se fuerza la carga y se guarda el alto reservado
    const reservados = await page.$$eval('iframe.archify-frame', (frames) =>
      frames.map((f) => {
        const alto = f.getBoundingClientRect().height;
        if (!f.src) f.src = f.dataset.src;
        return { archivo: f.dataset.src.split('/').pop(), alto };
      }),
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const finales = await page.$$eval('iframe.archify-frame', (frames) => frames.map((f) => f.getBoundingClientRect().height));

    for (const [i, r] of reservados.entries()) {
      // Si el alto reservado no coincide con el final, la página salta al cargar el diagrama
      const diferencia = Math.abs(finales[i] - r.alto);
      const bien = diferencia <= 4;
      if (!bien) failures++;
      console.log(`  [${r.archivo}] alto reservado=${Math.round(r.alto)}px, final=${Math.round(finales[i])}px -> ${bien ? '✅ sin salto' : `❌ salta ${Math.round(diferencia)}px (ejecuta npm run medir:diagramas)`}`);
    }

    for (const frame of page.frames().slice(1)) {
      const name = frame.url().split('/').pop();
      const m = await frame.evaluate(() => {
        const rail = document.querySelector('.reader-rail') || document.querySelector('[data-node-index]');
        const container = document.querySelector('.container') || document.body;
        const bottom = (rail ?? container).getBoundingClientRect().bottom;
        return { windowHeight: window.innerHeight, bottom, hasRail: !!rail };
      });
      const ok = m.bottom <= m.windowHeight + 5;
      if (!ok) failures++;
      console.log(
        `  [${name}] alto=${m.windowHeight}px, fin=${Math.round(m.bottom)}px, índice=${m.hasRail} -> ${ok ? '✅ visible' : '❌ cortado'}`,
      );
    }
  }

  await browser.close();
  if (failures > 0) {
    console.error(`\n${failures} problema(s) en los diagramas.`);
    process.exit(1);
  }
  console.log('\nTodos los diagramas se ven completos y sin saltos.');
}

checkDiagrams().catch((err) => {
  console.error(err);
  process.exit(1);
});
