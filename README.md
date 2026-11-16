# Arquetipo — Patrones de diseño de software

Web educativa en español para aprender diseño de software, desde los fundamentos de la Programación Orientada a Objetos hasta los 23 patrones de diseño GoF, con ejemplos realistas, diagramas y código en 8 lenguajes (C#, Python, Java, Go, TypeScript, JavaScript, Rust y PHP).

Construida con [Astro](https://astro.build) y [Tailwind CSS](https://tailwindcss.com).

## Contenido

| Página | Ruta | Qué incluye |
| :-- | :-- | :-- |
| Inicio | `/` | Ruta de aprendizaje, resúmenes y catálogo de patrones con filtro |
| Fundamentos de POO | `/fundamentos/poo` | Los 4 pilares y las 4 relaciones entre clases |
| Principios de diseño | `/principios/diseno` | Encapsula lo que varía, interfaces, composición, acoplamiento débil, menor conocimiento |
| Principios SOLID | `/principios/solid` | SRP, OCP, LSP, ISP y DIP con diagrama y código antes y después |
| 23 patrones | `/patrones/[categoria]/[slug]` | Caso real, problema, solución, diagrama, código, cuándo usarlo y el código en 8 lenguajes |
| Patrones que se confunden | `/comparaciones` | Pares de patrones parecidos: tabla de diferencias y el mismo caso resuelto con cada uno |
| Antipatrones | `/antipatrones` | Code smells, por qué duelen y qué principio o patrón los corrige |
| Código por lenguaje | `/lenguajes/[lenguaje]` | Los 23 patrones de forma idiomática en cada lenguaje |

El buscador global se abre con **Ctrl+K** (o ⌘K) y busca patrones (también por el problema que resuelven), principios, pilares, comparaciones, antipatrones y lenguajes.

## Estructura

```text
├── public/
│   ├── diagrams/            # Diagramas HTML de Archify
│   └── og.png               # Imagen para compartir (npm run generar:og)
├── scripts/
│   ├── check-diagrams.mjs        # Los diagramas no salen cortados
│   ├── generar-og.mjs            # Genera public/og.png
│   └── verificar-codigo.mjs      # Compila y ejecuta los ejemplos
└── src/
    ├── codigo/<lenguaje>/   # Los 23 ejemplos por lenguaje
    ├── components/          # Navbar, Footer, Buscador, BloqueCodigo, Logo
    │   └── inicio/          # Secciones de la página de inicio
    ├── contenido/           # Textos de cada página y de la interfaz (ui.ts)
    ├── data/                # Patrones, catálogo y lenguajes
    ├── layouts/             # Layout con SEO (canonical, Open Graph)
    ├── lib/                 # Resaltado de código
    ├── pages/
    │   ├── buscar.json.ts   # Índice del buscador
    │   ├── 404.astro
    │   └── robots.txt.ts
    └── styles/
```

## Comandos

| Comando | Acción |
| :-- | :-- |
| `npm install` | Instala las dependencias |
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run build` | Genera el sitio en `./dist/` |
| `npm run preview` | Previsualiza el build localmente |
| `npm run verificar:codigo` | Compila y ejecuta todos los ejemplos de código (`-- --salida` para ver lo que imprimen) |
| `npm run check:diagrams` | Comprueba que los diagramas no salgan cortados (requiere el servidor levantado; `BASE_URL` para otro puerto) |
| `npm run generar:og` | Regenera `public/og.png` con Playwright |

## SEO y dominio

El dominio se define al compilar con la variable `SITE_URL`:

```sh
SITE_URL=https://tu-dominio.com npm run build
```

Con ella se generan el sitemap (`sitemap-index.xml`), la línea `Sitemap:` de `robots.txt` y las URLs absolutas de `canonical` y `og:image`. Sin ella el sitio funciona igual, pero sin esos datos.

## Diagramas

Se generan con Archify desde `../research/nuevos-diagramas/generar.mjs`:

```sh
node generar.mjs [slug ...]   # genera y copia a public/diagrams/
```

## Verificación del código

`npm run verificar:codigo [lenguaje ...]` compila, analiza y ejecuta cada ejemplo (`-- --salida` muestra lo que imprime):

| Lenguaje | Herramientas |
| :-- | :-- |
| TypeScript | `tsc --strict` (vía npx) + Node 24 |
| JavaScript | `tsc --checkJs` + Node |
| Python | Pyright (vía npx) + Python 3.12+ |
| Go | `gofmt` + `go vet` + `go run` |
| C# | `dotnet run` de archivos sueltos (.NET 10+), advertencias como errores |
| Java | `javac -Xlint:all -Werror` + `java` (JDK 25+) |
| Rust | `rustfmt` + `clippy-driver -D warnings` |
| PHP | `php -l` + ejecución con `E_ALL` (PHP 8.5+) |

Las rutas de Java, PHP y Rust se pueden ajustar con las variables `JAVA_BIN`, `PHP` y `CARGO_BIN`.
