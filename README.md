# Arquetipo — Patrones de diseño de software

Web educativa en español para aprender arquitectura de software, desde los fundamentos de la Programación Orientada a Objetos hasta los 23 patrones de diseño GoF, con ejemplos realistas, diagramas y código en 8 lenguajes (C#, Python, Java, Go, TypeScript, JavaScript, Rust y PHP).

Construida con [Astro](https://astro.build) y [Tailwind CSS](https://tailwindcss.com). Los diagramas de clases están generados con Archify desde `../research/nuevos-diagramas/generar.mjs` (`node generar.mjs [slug]`), que los copia a `public/diagrams/`.

## Contenido

- **Fundamentos de POO** (`/fundamentos/poo`): pilares y relaciones entre objetos.
- **Principios SOLID** (`/principios/solid`): SRP, OCP, LSP, ISP y DIP.
- **Código por lenguaje** (`/lenguajes/[lenguaje]`): los 23 patrones en TypeScript, C#, Java, JavaScript, Python, Go, Rust y PHP, de forma idiomática. Los ejemplos viven en `src/codigo/<lenguaje>/` (cada lenguaje con su convención de nombres) y se verifican con `npm run verificar:codigo`.
- **23 patrones** (`/patrones/[categoria]/[slug]`): creacionales, estructurales y de comportamiento. Cada uno incluye un caso real, el problema sin el patrón, la solución, un diagrama, el código antes y después, matices importantes, cuándo usarlo y cuándo no, y patrones relacionados.

## Estructura

```text
├── public/
│   └── diagrams/        # Diagramas HTML generados con Archify
├── scripts/
│   └── check-diagrams.mjs  # Verificación visual de diagramas (Playwright)
└── src/
    ├── components/      # Navbar, Footer, Logo
    │   └── inicio/      # Secciones de la página principal
    ├── data/
    │   └── patterns.ts  # Contenido de los 23 patrones
    ├── layouts/
    ├── pages/           # Rutas: inicio, fundamentos, principios, patrones
    └── styles/
```

## Comandos

| Comando                  | Acción                                                       |
| :----------------------- | :----------------------------------------------------------- |
| `npm install`            | Instala las dependencias                                     |
| `npm run dev`            | Servidor de desarrollo en `localhost:4321`                   |
| `npm run build`          | Genera el sitio de producción en `./dist/`                   |
| `npm run preview`        | Previsualiza el build localmente                             |
| `npm run verificar:codigo` | Compila y ejecuta todos los ejemplos de código (`-- --salida` para ver lo que imprimen) |
| `npm run check:diagrams` | Comprueba que los diagramas no salgan cortados (requiere el servidor de desarrollo levantado) |

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
