// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// El dominio se define al compilar con la variable SITE_URL (por ejemplo, SITE_URL=https://midominio.com).
// Sin ella, el sitio funciona igual, pero no se generan el sitemap ni las URLs absolutas (canonical, og:image).
const site = process.env.SITE_URL || undefined;

// https://astro.build/config
export default defineConfig({
  site,
  integrations: site ? [sitemap({ filter: (pagina) => !pagina.includes('/404') })] : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
