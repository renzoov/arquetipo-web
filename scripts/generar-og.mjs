// Genera public/og.png (1200×630), la imagen que se ve al compartir un enlace de la web.
// Uso: npm run generar:og   (requiere Playwright con Chromium instalado)
import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const logo = `<svg width="148" height="148" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="61" height="61" rx="15" fill="#0b0e15" stroke="#00f0ff" stroke-opacity="0.35" stroke-width="2"/>
  <path d="M32 22 L18 41 M32 22 L46 41" stroke="#849495" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M24 33 H40" stroke="#849495" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 4.2"/>
  <rect x="24" y="11" width="16" height="12" rx="3" fill="#00f0ff"/><rect x="24" y="15.5" width="16" height="1.6" fill="#0b0e15" fill-opacity="0.55"/>
  <rect x="9" y="40" width="16" height="12" rx="3" fill="#00fe66"/><rect x="9" y="44.5" width="16" height="1.6" fill="#0b0e15" fill-opacity="0.55"/>
  <rect x="39" y="40" width="16" height="12" rx="3" fill="#ecb2ff"/><rect x="39" y="44.5" width="16" height="1.6" fill="#0b0e15" fill-opacity="0.55"/>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=JetBrains+Mono:wght@500&family=Space+Grotesk:wght@700&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: radial-gradient(circle at 85% 15%, #00f0ff1f, transparent 45%), radial-gradient(circle at 10% 95%, #00fe6614, transparent 40%), #11131a;
         color: #dbfcff; font-family: Geist, sans-serif; padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .marca { display: flex; align-items: center; gap: 32px; }
  h1 { font-family: 'Space Grotesk', sans-serif; font-size: 92px; letter-spacing: -2px; }
  .sub { font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #b9cacb; margin-top: 6px; }
  h2 { font-family: 'Space Grotesk', sans-serif; font-size: 50px; line-height: 1.12; max-width: 980px; }
  .chips { display: flex; gap: 14px; flex-wrap: wrap; }
  .chip { font-family: 'JetBrains Mono', monospace; font-size: 22px; padding: 10px 20px; border-radius: 999px; border: 2px solid; }
</style></head><body>
  <div class="marca">${logo}<div><h1>Arquetipo</h1><p class="sub">patrones de diseño de software</p></div></div>
  <h2>POO, principios de diseño, SOLID y los 23 patrones, con casos reales y código en 8 lenguajes.</h2>
  <div class="chips">
    <span class="chip" style="color:#00fe66;border-color:#00fe6655">POO</span>
    <span class="chip" style="color:#00f0ff;border-color:#00f0ff55">SOLID</span>
    <span class="chip" style="color:#ecb2ff;border-color:#ecb2ff55">23 patrones</span>
    <span class="chip" style="color:#fcd34d;border-color:#fcd34d55">TS · C# · Java · JS · Python · Go · Rust · PHP</span>
  </div>
</body></html>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.setContent(html, { waitUntil: 'networkidle' });
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: join(raiz, 'public', 'og.png') });
await navegador.close();
console.log('public/og.png generado');
