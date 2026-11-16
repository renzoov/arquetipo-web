// Verifica que los diagramas de Archify (iframes) se vean completos, sin cortes.
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
    await page.waitForTimeout(1000);

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
    console.error(`\n${failures} diagrama(s) cortado(s).`);
    process.exit(1);
  }
  console.log('\nTodos los diagramas se ven completos.');
}

checkDiagrams().catch((err) => {
  console.error(err);
  process.exit(1);
});
