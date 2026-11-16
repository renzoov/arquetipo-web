// Comprueba que los ejemplos de src/codigo/<lenguaje>/ compilan y se ejecutan sin errores.
// Uso:  npm run verificar:codigo [lenguaje ...]      (por defecto, todos los disponibles)
//       npm run verificar:codigo -- --salida          (muestra lo que imprime cada ejemplo)
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..', 'src', 'codigo');
const args = process.argv.slice(2);
const mostrarSalida = args.includes('--salida');
const pedidos = args.filter((a) => !a.startsWith('--'));

// Herramientas instaladas fuera del PATH de esta sesión (se pueden sobrescribir con variables de entorno)
const JAVA_BIN = process.env.JAVA_BIN ?? 'C:/Program Files/Eclipse Adoptium/jdk-27.0.1.0-hotspot/bin';
const PHP = process.env.PHP ?? join(process.env.LOCALAPPDATA ?? '', 'Microsoft/WinGet/Packages/PHP.PHP.NTS.8.5_Microsoft.Winget.Source_8wekyb3d8bbwe/php.exe');
const CARGO_BIN = process.env.CARGO_BIN ?? join(process.env.USERPROFILE ?? '', '.cargo/bin');

const ejecutar = (cmd, argumentos, opciones = {}) =>
  execFileSync(cmd, argumentos, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32', ...opciones });

// Cómo se compila y ejecuta cada lenguaje
const LENGUAJES = {
  typescript: {
    extension: '.ts',
    compilar: (archivos) =>
      ejecutar('npx', ['-y', '-p', 'typescript@5.9.3', 'tsc', '--noEmit', '--strict', '--target', 'es2022',
        '--module', 'esnext', '--moduleResolution', 'bundler', '--lib', 'es2023,dom', '--skipLibCheck', ...archivos]),
    correr: (archivo) => ejecutar('node', ['--experimental-transform-types', '--no-warnings', archivo]),
  },
  javascript: {
    extension: '.js',
    // Sin tipos, pero tsc --checkJs detecta propiedades inexistentes, llamadas mal escritas, etc.
    compilar: (archivos) =>
      ejecutar('npx', ['-y', '-p', 'typescript@5.9.3', 'tsc', '--noEmit', '--allowJs', '--checkJs', '--target', 'es2022',
        '--module', 'esnext', '--moduleResolution', 'bundler', '--lib', 'es2023,dom', '--skipLibCheck', ...archivos]),
    correr: (archivo) => ejecutar('node', [archivo]),
  },
  python: {
    extension: '.py',
    // Pyright (verificador de tipos de Python) se descarga vía npm: no modifica la instalación de Python
    compilar: (archivos) => ejecutar('npx', ['-y', 'pyright@1.1.390', '--pythonversion', '3.12', ...archivos]),
    correr: (archivo) => ejecutar('python', ['-X', 'utf8', archivo]),
  },
  go: {
    extension: '.go',
    // gofmt: formato estándar de Go · go vet: análisis estático de errores comunes
    compilar: (archivos) => {
      const sinFormato = ejecutar('gofmt', ['-l', ...archivos]).trim();
      if (sinFormato) throw Object.assign(new Error(), { stdout: `Sin formato gofmt:\n${sinFormato}` });
      return archivos.map((a) => ejecutar('go', ['vet', a])).join('');
    },
    correr: (archivo) => ejecutar('go', ['run', archivo]),
  },
  csharp: {
    extension: '.cs',
    // .NET 10+ ejecuta archivos .cs sueltos. Las advertencias (posibles nulos, etc.) cuentan como errores.
    // La globalización invariante hace que los decimales se impriman con punto, como en los comentarios.
    correr: (archivo) => ejecutar('dotnet', ['run', '-p:TreatWarningsAsErrors=true', '--file', archivo],
      { env: { ...process.env, DOTNET_SYSTEM_GLOBALIZATION_INVARIANT: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1' } }),
  },
  java: {
    extension: '.java',
    // javac con todas las advertencias activadas y tratadas como errores; luego se ejecuta el archivo
    compilar: (archivos) => archivos.map((a) =>
      ejecutar(`"${JAVA_BIN}/javac"`, ['-Xlint:all', '-Werror', '-d', mkdtempSync(join(tmpdir(), 'javac-')), a])).join(''),
    correr: (archivo) => ejecutar(`"${JAVA_BIN}/java"`, ['-Dstdout.encoding=UTF-8', archivo]),
  },
  rust: {
    extension: '.rs',
    // rustfmt: formato oficial · clippy-driver: compilador + Clippy, con las advertencias como errores
    compilar: (archivos) => ejecutar(`"${CARGO_BIN}/rustfmt"`, ['--check', '--edition', '2024', ...archivos]),
    correr: (archivo) => {
      const exe = join(mkdtempSync(join(tmpdir(), 'rust-')), 'ejemplo.exe');
      ejecutar(`"${CARGO_BIN}/clippy-driver"`, ['--edition', '2024', '-D', 'warnings', '-o', exe, archivo]);
      return ejecutar(`"${exe}"`, []);
    },
  },
  php: {
    extension: '.php',
    // php -l: sintaxis · ejecución con E_ALL y aserciones: cualquier aviso o deprecación es un error
    compilar: (archivos) => archivos.map((a) => ejecutar(`"${PHP}"`, ['-l', a])).join(''),
    correr: (archivo) => {
      const r = spawnSync(PHP, ['-d', 'error_reporting=E_ALL', '-d', 'display_errors=stderr', '-d', 'zend.assertions=1', archivo], { encoding: 'utf8' });
      if (r.status !== 0 || r.stderr.trim()) throw Object.assign(new Error('php'), { stderr: r.stderr || r.stdout });
      return r.stdout;
    },
  },
};

const lenguajes = (pedidos.length ? pedidos : Object.keys(LENGUAJES)).filter((l) => existsSync(join(raiz, l)));
let fallos = 0;

for (const lenguaje of lenguajes) {
  const config = LENGUAJES[lenguaje];
  if (!config) { console.log(`· ${lenguaje}: sin verificador configurado`); continue; }
  const carpeta = join(raiz, lenguaje);
  const archivos = readdirSync(carpeta).filter((f) => f.endsWith(config.extension)).map((f) => join(carpeta, f));
  console.log(`\n▶ ${lenguaje} (${archivos.length} ejemplos)`);

  if (config.compilar) {
    try {
      config.compilar(archivos);
      console.log('  ✓ compila sin errores');
    } catch (e) {
      fallos++;
      console.log('  ✗ errores de compilación:\n' + (e.stdout || e.stderr || e.message));
    }
  }

  for (const archivo of archivos) {
    const nombre = archivo.split(/[\\/]/).pop();
    try {
      const salida = config.correr(archivo);
      console.log(`  ✓ ${nombre}`);
      if (mostrarSalida) console.log(salida.replace(/^/gm, '      '));
    } catch (e) {
      fallos++;
      console.log(`  ✗ ${nombre}\n${(e.stderr || e.message).slice(0, 800)}`);
    }
  }
}

console.log(fallos ? `\n${fallos} problema(s) encontrados.` : '\nTodos los ejemplos compilan y se ejecutan correctamente.');
process.exit(fallos ? 1 : 0);
