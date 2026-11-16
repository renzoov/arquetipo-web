// robots.txt: permite indexar todo y, si se conoce el dominio (SITE_URL), indica dónde está el sitemap.
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const lineas = ['User-agent: *', 'Allow: /', 'Disallow: /buscar.json'];
  if (site) lineas.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);
  return new Response(`${lineas.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
