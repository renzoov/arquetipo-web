// Genera los 30 diagramas de clases de Arquetipo con Archify (interfaz en español)
// y los copia a public/diagrams con el estilo de ajuste al iframe (ajuste-diagramas.html).
// Requiere la skill Archify en .claude/skills/archify (no se versiona).
//
// Uso:  npm run generar:diagramas [-- slug ...]
import { writeFileSync, readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, '..');
const archify = join(raiz, '.claude', 'skills', 'archify', 'bin', 'archify.mjs');
const destino = join(raiz, 'public', 'diagrams');
const estiloAjuste = readFileSync(join(aqui, 'ajuste-diagramas.html'), 'utf8').trim();

if (!existsSync(archify)) {
  console.error(`No se encontró Archify en ${archify}. Instala la skill en .claude/skills/archify.`);
  process.exit(1);
}

// Los archivos intermedios de Archify (spec, recibos, html sin ajustar) van a una carpeta temporal
const trabajo = mkdtempSync(join(tmpdir(), 'arquetipo-diagramas-'));

// ── Ayudantes ──
const m = (name, parameters = '', returns = 'void', extra = {}) => ({ name, parameters, returns, visibility: 'public', ...extra });
const mp = (name, parameters = '', returns = 'void', extra = {}) => m(name, parameters, returns, { visibility: 'protected', ...extra });
const mpriv = (name, parameters = '', returns = 'void', extra = {}) => m(name, parameters, returns, { visibility: 'private', ...extra });
const abs = (name, parameters = '', returns = 'void', extra = {}) => m(name, parameters, returns, { abstract: true, ...extra });
const at = (name, type, visibility = 'private', extra = {}) => ({ name, type, visibility, ...extra });
const T = (id, label, kind, sublabel, row, col, { attributes, methods } = {}) => ({
  id, label, kind, sublabel, row, col, ...(attributes ? { attributes } : {}), ...(methods ? { methods } : {}),
});
let n = 0;
const R = (from, to, kind, label) => ({ id: `r${++n}`, from, to, kind, ...(label ? { label } : {}) });

const diagrama = (slug, title, subtitle, types, relationships) => ({
  slug,
  spec: {
    schema_version: 1,
    diagram_type: 'class',
    meta: { title, subtitle, locale: 'es', output: `${slug}.class.html`, quality_profile: 'standard' },
    layout: { mode: 'grid' },
    types,
    relationships,
  },
});

const DIAGRAMAS = [
  // ───────── POO ─────────
  diagrama('poo-pilares', 'Los 4 pilares de la POO', 'Abstracción, encapsulamiento, herencia y polimorfismo en las clases de los ejemplos', [
    T('almacenamiento', 'Almacenamiento', 'interface', 'Abstracción: solo lo esencial', 0, 0, { methods: [abs('subir', 'nombre, contenido', 'Promise<string>'), abs('urlDe', 'id: string', 'string')] }),
    T('gestor', 'GestorComprobantes', 'class', 'Usa la abstracción, no el proveedor', 1, 0, { attributes: [at('almacenamiento', 'Almacenamiento')], methods: [m('guardar', 'nombre, pdf', 'Promise<string>')] }),
    T('cuenta', 'CuentaBancaria', 'class', 'Encapsulamiento: estado privado', 2, 0, { attributes: [at('saldo', 'number'), at('movimientos', 'Movimiento[]')], methods: [m('retirar', 'monto: number'), m('obtenerSaldo', '', 'number')] }),
    T('notificador', 'Notificador', 'abstract', 'Herencia: clase base', 0, 1.5, { methods: [mp('formatear', 'titulo, cuerpo', 'string'), abs('enviar', 'destino, mensaje', 'Promise<void>')] }),
    T('slack', 'NotificadorSlack', 'class', 'Reutiliza y especializa', 1, 1.5, { attributes: [at('webhookUrl', 'string')], methods: [m('enviar', 'canal, texto', 'Promise<void>')] }),
    T('medio', 'MedioDePago', 'interface', 'Polimorfismo: un mensaje', 0, 3.5, { methods: [abs('cobrar', 'monto: number', 'Promise<void>')] }),
    T('tarjeta', 'PagoTarjeta', 'class', 'Su propia respuesta', 1, 3, { methods: [m('cobrar', 'monto: number', 'Promise<void>')] }),
    T('saldo', 'PagoSaldo', 'class', 'Otra respuesta distinta', 1, 4, { methods: [m('cobrar', 'monto: number', 'Promise<void>')] }),
  ], [
    R('gestor', 'almacenamiento', 'association', 'depende de'),
    R('slack', 'notificador', 'inheritance'),
    R('tarjeta', 'medio', 'realization'),
    R('saldo', 'medio', 'realization'),
  ]),

  diagrama('poo-relaciones', 'Las 4 relaciones entre clases', 'De menor a mayor acoplamiento: dependencia, asociación, agregación y composición', [
    T('generador', 'GeneradorFactura', 'class', 'Dependencia', 0, 0, { methods: [m('emitir', 'items, pais, calculadora', 'Factura')] }),
    T('calculadora', 'CalculadoraImpuestos', 'class', 'Solo se usa en emitir()', 1, 0, { methods: [m('tasaPara', 'pais: string', 'number')] }),
    T('cuentaUsuario', 'CuentaUsuario', 'class', 'Asociación', 0, 1, { attributes: [at('perfil', 'PerfilPublico')], methods: [m('actualizarBiografia', 'texto: string')] }),
    T('perfil', 'PerfilPublico', 'class', 'Vive por separado', 1, 1, { methods: [m('cambiarBiografia', 'texto: string')] }),
    T('equipo', 'EquipoDesarrollo', 'class', 'Agregación', 0, 2, { attributes: [at('integrantes', 'Ingeniero[]')], methods: [m('habilidades', '', 'string[]')] }),
    T('ingeniero', 'Ingeniero', 'class', 'Existe sin el equipo', 1, 2, { attributes: [at('habilidades', 'string[]', 'public')] }),
    T('orden', 'OrdenCompra', 'class', 'Composición', 0, 3, { attributes: [at('lineas', 'LineaOrden[]')], methods: [m('agregarProducto', 'id, cantidad, precio')] }),
    T('linea', 'LineaOrden', 'record', 'No existe sin su orden', 1, 3, { attributes: [at('productoId', 'string', 'public'), at('cantidad', 'number', 'public'), at('precio', 'number', 'public')] }),
  ], [
    R('generador', 'calculadora', 'dependency', 'usa'),
    R('cuentaUsuario', 'perfil', 'association', 'conoce'),
    R('equipo', 'ingeniero', 'aggregation', 'agrupa'),
    R('orden', 'linea', 'composition', 'es dueña de'),
  ]),

  // ───────── SOLID ─────────
  diagrama('solid-srp', 'Responsabilidad Única (SRP)', 'El servicio coordina el registro; validar, guardar y avisar cambian en sus propias clases', [
    T('servicio', 'UsuarioServicio', 'class', 'Motivo para cambiar: el flujo de registro', 0, 1, { methods: [m('registrar', 'datos: DatosUsuario', 'Promise<void>')] }),
    T('validador', 'ValidadorUsuario', 'class', 'Cambia si cambian las reglas', 1, 0, { methods: [m('validar', 'datos: DatosUsuario')] }),
    T('repo', 'RepositorioUsuarios', 'interface', 'Cambia si cambia la persistencia', 1, 1, { methods: [abs('guardar', 'datos: DatosUsuario', 'Promise<Usuario>')] }),
    T('aviso', 'NotificadorBienvenida', 'class', 'Cambia si cambia el correo', 1, 2, { methods: [m('enviar', 'usuario: Usuario', 'Promise<void>')] }),
  ], [
    R('servicio', 'validador', 'association', 'valida con'),
    R('servicio', 'repo', 'association', 'guarda con'),
    R('servicio', 'aviso', 'association', 'avisa con'),
  ]),

  diagrama('solid-ocp', 'Abierto / Cerrado (OCP)', 'Un medio de pago nuevo es una clase nueva que se registra; el procesador no se modifica', [
    T('procesador', 'ProcesadorPagos', 'class', 'Cerrado a modificaciones', 0, 0, { attributes: [at('medios', 'Map<string, MedioPago>')], methods: [m('registrar', 'nombre, medio'), m('cobrar', 'nombre, monto', 'Promise<void>')] }),
    T('medio', 'MedioPago', 'interface', 'Abierto a extensiones', 0, 2, { methods: [abs('cobrar', 'monto: number', 'Promise<void>')] }),
    T('tarjeta', 'PagoTarjeta', 'class', 'Medio existente', 1, 1, { methods: [m('cobrar', 'monto: number', 'Promise<void>')] }),
    T('billetera', 'PagoBilletera', 'class', 'Medio nuevo: solo se añade', 1, 2, { methods: [m('cobrar', 'monto: number', 'Promise<void>')] }),
    T('transferencia', 'PagoTransferencia', 'class', 'Medio existente', 1, 3, { methods: [m('cobrar', 'monto: number', 'Promise<void>')] }),
  ], [
    R('procesador', 'medio', 'aggregation', 'registra'),
    R('tarjeta', 'medio', 'realization'),
    R('billetera', 'medio', 'realization'),
    R('transferencia', 'medio', 'realization'),
  ]),

  diagrama('solid-lsp', 'Sustitución de Liskov (LSP)', 'Cada tipo promete solo lo que puede cumplir: el plazo fijo no promete retiros', [
    T('cuenta', 'Cuenta', 'interface', 'Lo que toda cuenta cumple', 0, 1, { methods: [abs('saldo', '', 'number')] }),
    T('conRetiros', 'CuentaConRetiros', 'interface', 'Promete retiros', 1, 0, { methods: [abs('retirar', 'monto: number')] }),
    T('plazoFijo', 'CuentaPlazoFijo', 'class', 'Solo consulta de saldo', 1, 2, { methods: [m('saldo', '', 'number')] }),
    T('ahorro', 'CuentaAhorro', 'class', 'Cumple ambos contratos', 2, 0, { methods: [m('saldo', '', 'number'), m('retirar', 'monto: number')] }),
    T('pago', 'PagoConCuenta', 'class', 'Solo acepta cuentas con retiros', 2, 1.5, { methods: [m('pagar', 'cuenta: CuentaConRetiros, monto')] }),
  ], [
    R('conRetiros', 'cuenta', 'inheritance'),
    R('plazoFijo', 'cuenta', 'realization'),
    R('ahorro', 'conRetiros', 'realization'),
    R('pago', 'conRetiros', 'dependency', 'usa'),
  ]),

  diagrama('solid-isp', 'Segregación de Interfaces (ISP)', 'Interfaces por rol: cada cliente depende solo de lo que usa', [
    T('lector', 'LectorDocumentos', 'interface', 'Rol: leer', 0, 0.5, { methods: [abs('leer', 'id: string', 'Promise<Documento>')] }),
    T('escritor', 'EscritorDocumentos', 'interface', 'Rol: escribir', 0, 2.5, { methods: [abs('guardar', 'doc: Documento', 'Promise<void>'), abs('eliminar', 'id: string', 'Promise<void>')] }),
    T('historico', 'ArchivoHistorico', 'class', 'Solo lectura: sin métodos forzados', 1, 0, { methods: [m('leer', 'id: string', 'Promise<Documento>')] }),
    T('nube', 'AlmacenNube', 'class', 'Implementa los dos roles', 1, 1.5, { methods: [m('leer', 'id', 'Promise<Documento>'), m('guardar', 'doc', 'Promise<void>'), m('eliminar', 'id', 'Promise<void>')] }),
    T('visor', 'VisorDocumentos', 'class', 'Solo necesita leer', 2, 0.5, { attributes: [at('lector', 'LectorDocumentos')] }),
    T('editor', 'EditorDocumentos', 'class', 'Solo necesita escribir', 2, 2.5, { attributes: [at('escritor', 'EscritorDocumentos')] }),
  ], [
    R('historico', 'lector', 'realization'),
    R('nube', 'lector', 'realization'),
    R('nube', 'escritor', 'realization'),
    R('visor', 'lector', 'association', 'lee con'),
    R('editor', 'escritor', 'association', 'escribe con'),
  ]),

  diagrama('solid-dip', 'Inversión de Dependencias (DIP)', 'El negocio define la abstracción; la base de datos y las pruebas la implementan', [
    T('caso', 'EmitirFactura', 'class', 'Alto nivel: regla de negocio', 0, 0, { attributes: [at('repositorio', 'RepositorioFacturas')], methods: [m('ejecutar', 'factura: Factura', 'Promise<void>')] }),
    T('puerto', 'RepositorioFacturas', 'interface', 'Abstracción definida por el negocio', 0, 2, { methods: [abs('guardar', 'factura: Factura', 'Promise<void>')] }),
    T('mysql', 'RepositorioFacturasMySQL', 'class', 'Bajo nivel: infraestructura', 1, 1, { methods: [m('guardar', 'factura: Factura', 'Promise<void>')] }),
    T('memoria', 'RepositorioFacturasEnMemoria', 'class', 'Para pruebas', 1, 3, { methods: [m('guardar', 'factura: Factura', 'Promise<void>')] }),
  ], [
    R('caso', 'puerto', 'association', 'depende de'),
    R('mysql', 'puerto', 'realization'),
    R('memoria', 'puerto', 'realization'),
  ]),

  // ───────── CREACIONALES ─────────
  diagrama('factory-method', 'Factory Method', 'Conciliación bancaria: cada subclase decide qué lector de extractos crear', [
    T('conciliador', 'Conciliador', 'abstract', 'Proceso común de conciliación', 0, 0.5, { methods: [m('conciliar', 'archivo: string', 'Diferencia[]'), mp('crearLector', '', 'LectorExtracto', { abstract: true })] }),
    T('andino', 'ConciliadorBancoAndino', 'class', 'Creador concreto', 1, 0, { methods: [mp('crearLector', '', 'LectorExtracto')] }),
    T('pacifico', 'ConciliadorBancoPacifico', 'class', 'Creador concreto', 1, 1, { methods: [mp('crearLector', '', 'LectorExtracto')] }),
    T('lector', 'LectorExtracto', 'interface', 'Producto', 0, 2.5, { methods: [abs('leer', 'archivo: string', 'Movimiento[]')] }),
    T('csv', 'LectorCsvAndino', 'class', 'Producto concreto: CSV', 1, 2, { methods: [m('leer', 'archivo: string', 'Movimiento[]')] }),
    T('txt', 'LectorTxtPacifico', 'class', 'Producto concreto: TXT', 1, 3, { methods: [m('leer', 'archivo: string', 'Movimiento[]')] }),
  ], [
    R('andino', 'conciliador', 'inheritance'),
    R('pacifico', 'conciliador', 'inheritance'),
    R('csv', 'lector', 'realization'),
    R('txt', 'lector', 'realization'),
    R('conciliador', 'lector', 'dependency', 'usa'),
    R('andino', 'csv', 'dependency', 'crea'),
    R('pacifico', 'txt', 'dependency', 'crea'),
  ]),

  diagrama('abstract-factory', 'Abstract Factory', 'Infraestructura nube u on-premise: cada fábrica crea una familia compatible (los secretos se omiten)', [
    T('app', 'Aplicacion', 'class', 'Elige una fábrica al arrancar', 0, 0, { attributes: [at('infra', 'Infraestructura')] }),
    T('fabrica', 'Infraestructura', 'interface', 'Fábrica abstracta', 0, 1.5, { methods: [abs('crearAlmacenamiento', '', 'Almacenamiento'), abs('crearCola', '', 'Cola'), abs('crearSecretos', '', 'Secretos')] }),
    T('nube', 'InfraNube', 'class', 'Familia: nube', 1, 0.5, { methods: [m('crearAlmacenamiento', '', 'Almacenamiento'), m('crearCola', '', 'Cola')] }),
    T('onprem', 'InfraOnPremise', 'class', 'Familia: centro de datos', 1, 2.5, { methods: [m('crearAlmacenamiento', '', 'Almacenamiento'), m('crearCola', '', 'Cola')] }),
    T('alm', 'Almacenamiento', 'interface', 'Producto A', 2, 1, { methods: [abs('subir', 'archivo', 'Promise<string>')] }),
    T('cola', 'Cola', 'interface', 'Producto B', 2, 2, { methods: [abs('publicar', 'mensaje', 'Promise<void>')] }),
    T('almNube', 'AlmacenamientoNube', 'class', 'A · nube', 3, 0, {}),
    T('disco', 'DiscoEnRed', 'class', 'A · on-premise', 3, 1, {}),
    T('colaNube', 'ColaGestionada', 'class', 'B · nube', 3, 2, {}),
    T('rabbit', 'ColaRabbit', 'class', 'B · on-premise', 3, 3, {}),
  ], [
    R('app', 'fabrica', 'association', 'usa'),
    R('nube', 'fabrica', 'realization'),
    R('onprem', 'fabrica', 'realization'),
    R('almNube', 'alm', 'realization'),
    R('disco', 'alm', 'realization'),
    R('colaNube', 'cola', 'realization'),
    R('rabbit', 'cola', 'realization'),
  ]),

  diagrama('builder', 'Builder', 'Buscador de un marketplace: el builder arma y valida; las recetas actúan como Director', [
    T('controlador', 'ControladorBusqueda', 'class', 'Cliente', 0, 0, { methods: [m('buscar', 'query: QueryString', 'Resultado')] }),
    T('builder', 'BusquedaBuilder', 'class', 'Construye paso a paso', 0, 1.5, { attributes: [at('filtros', 'Partial<FiltrosBusqueda>')], methods: [m('texto', 't: string', 'this'), m('precioEntre', 'min, max', 'this'), m('soloConStock', '', 'this'), m('ordenarPor', 'campo: Orden', 'this'), m('build', '', 'Busqueda')] }),
    T('busqueda', 'Busqueda', 'record', 'Producto inmutable y válido', 0, 3, { attributes: [at('texto', 'string', 'public'), at('precio', 'Rango', 'public'), at('soloConStock', 'boolean', 'public'), at('orden', 'Orden', 'public'), at('pagina', 'number', 'public')] }),
    T('recetas', 'RecetasBusqueda', 'class', 'Director: pasos predefinidos', 1, 1.5, { methods: [m('ofertasDelDia', 'b: BusquedaBuilder', 'Busqueda'), m('novedades', 'b: BusquedaBuilder', 'Busqueda')] }),
  ], [
    R('controlador', 'builder', 'dependency', 'usa'),
    R('builder', 'busqueda', 'dependency', 'crea'),
    R('recetas', 'builder', 'dependency', 'dirige'),
  ]),

  diagrama('prototype', 'Prototype', 'Pólizas de seguro: se clonan plantillas configuradas copiando en profundidad lo mutable', [
    T('servicio', 'ServicioCotizacion', 'class', 'Cliente', 0, 0, { methods: [m('cotizar', 'plantilla: string, cliente', 'Poliza')] }),
    T('registro', 'RegistroPlantillas', 'class', 'Registro de prototipos', 0, 2, { attributes: [at('plantillas', 'Map<string, Poliza>')], methods: [m('obtener', 'clave: string', 'Poliza')] }),
    T('poliza', 'Poliza', 'class', 'Prototipo: sabe clonarse', 1, 2, { attributes: [at('producto', 'string', 'public'), at('coberturas', 'Cobertura[]'), at('clausulas', 'readonly string[]')], methods: [m('clonar', '', 'Poliza'), m('agregarCobertura', 'c: Cobertura')] }),
    T('cobertura', 'Cobertura', 'record', 'Se copia en cada clon', 2, 2, { attributes: [at('nombre', 'string', 'public'), at('sumaAsegurada', 'number', 'public'), at('deducible', 'number', 'public')] }),
  ], [
    R('servicio', 'registro', 'dependency', 'pide un clon'),
    R('registro', 'poliza', 'aggregation', 'guarda plantillas'),
    R('poliza', 'cobertura', 'composition', 'contiene'),
  ]),

  diagrama('singleton', 'Singleton', 'Configuración y feature flags: una sola instancia compartida por todo el proceso', [
    T('config', 'Configuracion', 'class', 'Instancia única', 0, 1, { attributes: [at('instancia', 'Configuracion', 'private', { static: true }), at('flags', 'Map<string, boolean>')], methods: [mpriv('constructor'), m('obtener', '', 'Configuracion', { static: true }), m('estaActiva', 'flag: string', 'boolean')] }),
    T('pagos', 'ServicioPagos', 'class', 'Usa la misma instancia', 1, 0, {}),
    T('envios', 'ServicioEnvios', 'class', 'Usa la misma instancia', 1, 2, {}),
  ], [
    R('pagos', 'config', 'dependency', 'obtener()'),
    R('envios', 'config', 'dependency', 'obtener()'),
  ]),

  // ───────── ESTRUCTURALES ─────────
  diagrama('adapter', 'Adapter', 'Pasarela de pagos: el adaptador traduce entre tu interfaz y el SDK del proveedor', [
    T('checkout', 'Checkout', 'class', 'Cliente', 0, 0, { methods: [m('confirmar', 'pedido: Pedido', 'Promise<void>')] }),
    T('pasarela', 'PasarelaPago', 'interface', 'La interfaz que espera tu código', 0, 1.5, { methods: [abs('cobrar', 'monto, tarjeta', 'Promise<ResultadoPago>')] }),
    T('actual', 'PasarelaActual', 'class', 'Proveedor anterior', 1, 0.5, { methods: [m('cobrar', 'monto, tarjeta', 'Promise<ResultadoPago>')] }),
    T('adaptador', 'AdaptadorPagoLocal', 'class', 'Adaptador: traduce', 1, 2, { attributes: [at('sdk', 'SdkPagoLocal')], methods: [m('cobrar', 'monto, tarjeta', 'Promise<ResultadoPago>')] }),
    T('sdk', 'SdkPagoLocal', 'class', 'Clase del tercero (no se puede cambiar)', 2, 2, { methods: [m('tokenizar', 'tarjeta', 'Promise<Token>'), m('crearTransaccion', 'datos', 'Promise<Respuesta>')] }),
  ], [
    R('checkout', 'pasarela', 'association', 'cobra con'),
    R('actual', 'pasarela', 'realization'),
    R('adaptador', 'pasarela', 'realization'),
    R('adaptador', 'sdk', 'association', 'traduce a'),
  ]),

  diagrama('bridge', 'Bridge', 'Reportes × formatos: dos jerarquías independientes unidas por una referencia', [
    T('reporte', 'Reporte', 'abstract', 'Abstracción', 0, 0.5, { attributes: [at('salida', 'Renderizador', 'protected')], methods: [abs('exportar', '', 'Buffer')] }),
    T('ventas', 'ReporteVentas', 'class', 'Abstracción refinada', 1, 0, { methods: [m('exportar', '', 'Buffer')] }),
    T('inventario', 'ReporteInventario', 'class', 'Abstracción refinada', 1, 1, { methods: [m('exportar', '', 'Buffer')] }),
    T('renderizador', 'Renderizador', 'interface', 'Implementación', 0, 2.5, { methods: [abs('titulo', 'texto: string'), abs('tabla', 'filas: Fila[]'), abs('generar', '', 'Buffer')] }),
    T('pdf', 'RenderizadorPdf', 'class', 'Implementación concreta', 1, 2, {}),
    T('excel', 'RenderizadorExcel', 'class', 'Implementación concreta', 1, 3, {}),
  ], [
    R('ventas', 'reporte', 'inheritance'),
    R('inventario', 'reporte', 'inheritance'),
    R('pdf', 'renderizador', 'realization'),
    R('excel', 'renderizador', 'realization'),
    R('reporte', 'renderizador', 'aggregation', 'puente'),
  ]),

  diagrama('composite', 'Composite', 'Organigrama: un área suma el costo de sus miembros, sean personas u otras áreas', [
    T('reporte', 'ReporteRRHH', 'class', 'Cliente', 0, 0, { methods: [m('costoDe', 'm: MiembroOrganizacion', 'number')] }),
    T('miembro', 'MiembroOrganizacion', 'interface', 'Componente', 0, 1.5, { methods: [abs('costoMensual', '', 'number')] }),
    T('empleado', 'Empleado', 'class', 'Hoja', 1, 0.5, { attributes: [at('nombre', 'string', 'public'), at('sueldo', 'number')], methods: [m('costoMensual', '', 'number')] }),
    T('area', 'Area', 'class', 'Compuesto', 1, 2.5, { attributes: [at('nombre', 'string', 'public'), at('miembros', 'MiembroOrganizacion[]')], methods: [m('agregar', 'm: MiembroOrganizacion', 'Area'), m('costoMensual', '', 'number')] }),
  ], [
    R('reporte', 'miembro', 'dependency', 'usa'),
    R('empleado', 'miembro', 'realization'),
    R('area', 'miembro', 'realization'),
    R('area', 'miembro', 'aggregation', 'contiene 0..*'),
  ]),

  diagrama('decorator', 'Decorator', 'Cliente de tipos de cambio: cada capacidad envuelve a otra con la misma interfaz', [
    T('servicio', 'ServicioCotizaciones', 'class', 'Cliente', 0, 0, { attributes: [at('fuente', 'FuenteTiposCambio')] }),
    T('fuente', 'FuenteTiposCambio', 'interface', 'Componente', 0, 1.5, { methods: [abs('obtener', 'moneda: string', 'Promise<number>')] }),
    T('api', 'ApiTiposCambio', 'class', 'Componente real', 1, 0, { methods: [m('obtener', 'moneda', 'Promise<number>')] }),
    T('reintentos', 'ConReintentos', 'class', 'Decorador', 1, 1, { attributes: [at('interno', 'FuenteTiposCambio')], methods: [m('obtener', 'moneda', 'Promise<number>')] }),
    T('cache', 'ConCache', 'class', 'Decorador', 1, 2, { attributes: [at('interno', 'FuenteTiposCambio'), at('cache', 'Map<string, number>')], methods: [m('obtener', 'moneda', 'Promise<number>')] }),
    T('log', 'ConLog', 'class', 'Decorador', 1, 3, { attributes: [at('interno', 'FuenteTiposCambio')], methods: [m('obtener', 'moneda', 'Promise<number>')] }),
  ], [
    R('servicio', 'fuente', 'association', 'usa'),
    R('api', 'fuente', 'realization'),
    R('reintentos', 'fuente', 'realization'),
    R('cache', 'fuente', 'realization'),
    R('log', 'fuente', 'realization'),
  ]),

  diagrama('facade', 'Facade', 'Facturación electrónica: una operación simple delante de un subsistema de seis pasos', [
    T('checkout', 'ControladorCheckout', 'class', 'Cliente', 0, 1, {}),
    T('recurrente', 'FacturacionRecurrente', 'class', 'Cliente', 0, 3, {}),
    T('fachada', 'FacturacionElectronica', 'class', 'Fachada', 1, 2, { methods: [m('emitir', 'venta: Venta', 'Promise<Comprobante>')] }),
    T('validador', 'ValidadorFiscal', 'class', 'Subsistema', 2, 0, { methods: [m('validar', 'numeroFiscal')] }),
    T('generador', 'GeneradorXml', 'class', 'Subsistema', 2, 1, { methods: [m('crear', 'venta', 'Xml')] }),
    T('firmador', 'FirmadorDigital', 'class', 'Subsistema', 2, 2, { methods: [m('firmar', 'xml', 'XmlFirmado')] }),
    T('autoridad', 'ClienteAutoridadTributaria', 'class', 'Subsistema', 2, 3, { methods: [m('enviar', 'xml', 'Promise<Constancia>')] }),
    T('almacen', 'AlmacenComprobantes', 'class', 'Subsistema', 2, 4, { methods: [m('guardar', 'venta, constancia', 'Comprobante')] }),
  ], [
    R('checkout', 'fachada', 'dependency', 'emitir()'),
    R('recurrente', 'fachada', 'dependency', 'emitir()'),
    R('fachada', 'validador', 'association'),
    R('fachada', 'generador', 'association'),
    R('fachada', 'firmador', 'association'),
    R('fachada', 'autoridad', 'association'),
    R('fachada', 'almacen', 'association'),
  ]),

  diagrama('flyweight', 'Flyweight', 'Hoja de cálculo: millones de celdas comparten unas pocas decenas de formatos inmutables', [
    T('hoja', 'HojaCalculo', 'class', 'Cliente', 0, 0, { attributes: [at('celdas', 'Celda[]')], methods: [m('aplicarFormato', 'rango, estilo')] }),
    T('celda', 'Celda', 'class', 'Estado extrínseco (propio)', 1, 0, { attributes: [at('fila', 'number', 'public'), at('columna', 'number', 'public'), at('valor', 'string', 'public'), at('formato', 'Formato', 'public')] }),
    T('fabrica', 'FabricaFormatos', 'class', 'Crea o reutiliza', 0, 2, { attributes: [at('cache', 'Map<string, Formato>')], methods: [m('obtener', 'fuente, tamano, color, formatoNumero', 'Formato')] }),
    T('formato', 'Formato', 'record', 'Flyweight: intrínseco y compartido', 1, 2, { attributes: [at('fuente', 'string', 'public'), at('tamano', 'number', 'public'), at('color', 'string', 'public'), at('formatoNumero', 'string', 'public')] }),
  ], [
    R('hoja', 'celda', 'composition', 'contiene'),
    R('hoja', 'fabrica', 'dependency', 'pide formatos'),
    R('fabrica', 'formato', 'aggregation', 'reutiliza'),
    R('celda', 'formato', 'association', 'comparte'),
  ]),

  diagrama('proxy', 'Proxy', 'Historias clínicas: el proxy verifica permisos y carga las imágenes solo cuando se piden', [
    T('controlador', 'ControladorPacientes', 'class', 'Cliente', 0, 0, {}),
    T('historia', 'HistoriaClinica', 'interface', 'Interfaz común', 0, 1.5, { methods: [abs('diagnosticos', '', 'Diagnostico[]'), abs('imagenes', '', 'Promise<Imagen[]>')] }),
    T('real', 'HistoriaClinicaReal', 'class', 'Objeto real (costoso)', 1, 0.5, { attributes: [at('pacienteId', 'string', 'public')], methods: [m('diagnosticos', '', 'Diagnostico[]'), m('imagenes', '', 'Promise<Imagen[]>')] }),
    T('proxy', 'ProxyHistoriaClinica', 'class', 'Protección + carga perezosa', 1, 2.5, { attributes: [at('real', 'HistoriaClinicaReal'), at('usuario', 'Usuario'), at('cache', 'Imagen[]')], methods: [m('diagnosticos', '', 'Diagnostico[]'), m('imagenes', '', 'Promise<Imagen[]>'), mpriv('verificarAcceso')] }),
  ], [
    R('controlador', 'historia', 'association', 'usa'),
    R('real', 'historia', 'realization'),
    R('proxy', 'historia', 'realization'),
    R('proxy', 'real', 'association', 'delega en'),
  ]),

  // ───────── COMPORTAMIENTO ─────────
  diagrama('chain-of-responsibility', 'Chain of Responsibility', 'Antifraude: cada control puede rechazar el pago o pasarlo al siguiente', [
    T('pagos', 'ServicioPagos', 'class', 'Cliente', 0, 0, { methods: [m('aprobar', 'pago: Pago', 'Promise<Resultado>')] }),
    T('control', 'ControlFraude', 'abstract', 'Manejador base', 0, 1.5, { attributes: [at('siguiente', 'ControlFraude')], methods: [m('enlazar', 'c: ControlFraude', 'ControlFraude'), m('revisar', 'pago: Pago', 'Promise<Resultado>'), mp('detectar', 'pago: Pago', 'Promise<string | null>', { abstract: true })] }),
    T('bloqueo', 'ControlListaBloqueo', 'class', 'Eslabón 1', 1, 0, { methods: [mp('detectar', 'pago', 'Promise<string | null>')] }),
    T('limite', 'ControlLimiteDiario', 'class', 'Eslabón 2', 1, 1, { methods: [mp('detectar', 'pago', 'Promise<string | null>')] }),
    T('pais', 'ControlPais', 'class', 'Eslabón 3', 1, 2, { methods: [mp('detectar', 'pago', 'Promise<string | null>')] }),
    T('riesgo', 'ControlRiesgo', 'class', 'Eslabón 4', 1, 3, { methods: [mp('detectar', 'pago', 'Promise<string | null>')] }),
  ], [
    R('pagos', 'control', 'dependency', 'revisar()'),
    R('bloqueo', 'control', 'inheritance'),
    R('limite', 'control', 'inheritance'),
    R('pais', 'control', 'inheritance'),
    R('riesgo', 'control', 'inheritance'),
  ]),

  diagrama('command', 'Command', 'Panel de administración: cada acción masiva es un objeto que se ejecuta, se registra y se puede deshacer', [
    T('panel', 'PanelAdmin', 'class', 'Cliente: crea los comandos', 0, 0, {}),
    T('invocador', 'Invocador', 'class', 'Ejecuta y guarda historial', 0, 1.5, { attributes: [at('historial', 'Comando[]')], methods: [m('ejecutar', 'c: Comando, usuario', 'Promise<void>'), m('deshacerUltimo', '', 'Promise<void>')] }),
    T('comando', 'Comando', 'interface', 'Comando', 0, 3, { methods: [abs('ejecutar', '', 'Promise<void>'), abs('deshacer', '', 'Promise<void>')] }),
    T('ajustar', 'AjustarPrecios', 'class', 'Comando concreto', 1, 2, { attributes: [at('anteriores', 'Map<string, number>'), at('factor', 'number')], methods: [m('ejecutar', '', 'Promise<void>'), m('deshacer', '', 'Promise<void>')] }),
    T('desactivar', 'DesactivarProductos', 'class', 'Comando concreto', 1, 4, { methods: [m('ejecutar', '', 'Promise<void>'), m('deshacer', '', 'Promise<void>')] }),
    T('repo', 'RepoProductos', 'class', 'Receptor: hace el trabajo real', 2, 3, { methods: [m('deCategoria', 'categoria', 'Promise<Producto[]>'), m('cambiarPrecio', 'id, precio', 'Promise<void>')] }),
  ], [
    R('panel', 'invocador', 'dependency', 'ejecutar()'),
    R('invocador', 'comando', 'aggregation', 'historial'),
    R('ajustar', 'comando', 'realization'),
    R('desactivar', 'comando', 'realization'),
    R('ajustar', 'repo', 'association', 'modifica'),
    R('desactivar', 'repo', 'association', 'modifica'),
  ]),

  diagrama('interpreter', 'Interpreter', 'Reglas de promoción: la regla es un árbol de expresiones que se evalúa contra el carrito', [
    T('motor', 'MotorPromociones', 'class', 'Cliente', 0, 0, { methods: [m('aplica', 'regla: Expresion, carrito', 'boolean')] }),
    T('expresion', 'Expresion', 'interface', 'Expresión abstracta', 0, 1.5, { methods: [abs('interpretar', 'carrito: Carrito', 'boolean')] }),
    T('total', 'TotalMayorQue', 'class', 'Terminal', 1, 0, { attributes: [at('limite', 'number')], methods: [m('interpretar', 'c', 'boolean')] }),
    T('frecuente', 'EsClienteFrecuente', 'class', 'Terminal', 1, 1, { methods: [m('interpretar', 'c', 'boolean')] }),
    T('y', 'Y', 'class', 'No terminal', 1, 2, { attributes: [at('izquierda', 'Expresion'), at('derecha', 'Expresion')], methods: [m('interpretar', 'c', 'boolean')] }),
    T('o', 'O', 'class', 'No terminal', 1, 3, { attributes: [at('izquierda', 'Expresion'), at('derecha', 'Expresion')], methods: [m('interpretar', 'c', 'boolean')] }),
  ], [
    R('motor', 'expresion', 'dependency', 'evalúa'),
    R('total', 'expresion', 'realization'),
    R('frecuente', 'expresion', 'realization'),
    R('y', 'expresion', 'realization'),
    R('o', 'expresion', 'realization'),
  ]),

  diagrama('iterator', 'Iterator', 'Clientes de un CRM paginado: el iterador oculta páginas y cursores', [
    T('proceso', 'ProcesoSincronizacion', 'class', 'Cliente: solo recorre', 0, 0, { methods: [m('ejecutar', '', 'Promise<void>')] }),
    T('iterable', 'AsyncIterable<Cliente>', 'interface', 'Contrato de recorrido', 0, 2, { methods: [abs('asyncIterator', '', 'AsyncIterator<Cliente>')] }),
    T('clientes', 'ClientesCrm', 'class', 'Colección iterable', 1, 2, { attributes: [at('crm', 'ApiCrm')], methods: [m('asyncIterator', '', 'AsyncIterator<Cliente>')] }),
    T('api', 'ApiCrm', 'class', 'Fuente paginada', 2, 2, { methods: [m('listarClientes', 'limite, cursor', 'Promise<Pagina>')] }),
    T('pagina', 'Pagina', 'record', 'Detalle oculto al cliente', 2, 4, { attributes: [at('datos', 'Cliente[]', 'public'), at('siguienteCursor', 'string', 'public')] }),
  ], [
    R('proceso', 'iterable', 'dependency', 'for await'),
    R('clientes', 'iterable', 'realization'),
    R('clientes', 'api', 'association', 'pide páginas'),
    R('api', 'pagina', 'dependency', 'devuelve'),
  ]),

  diagrama('mediator', 'Mediator', 'Panel de filtros: los componentes avisan al mediador y él coordina al resto', [
    T('mediador', 'Mediador', 'interface', 'Mediador', 0, 0.5, { methods: [abs('notificar', 'origen: Componente, evento: string')] }),
    T('panel', 'PanelFiltros', 'class', 'Mediador concreto', 1, 0.5, { methods: [m('notificar', 'origen, evento')] }),
    T('componente', 'Componente', 'abstract', 'Colega base', 0, 2.5, { attributes: [at('mediador', 'Mediador', 'protected')], methods: [m('reiniciar')] }),
    T('categoria', 'SelectorCategoria', 'class', 'Colega', 2, 0, {}),
    T('marca', 'SelectorMarca', 'class', 'Colega', 2, 1, {}),
    T('precio', 'RangoPrecio', 'class', 'Colega', 2, 2, {}),
    T('contador', 'ContadorResultados', 'class', 'Colega', 2, 3, {}),
  ], [
    R('panel', 'mediador', 'realization'),
    R('componente', 'mediador', 'association', 'avisa a'),
    R('panel', 'componente', 'association', 'coordina'),
    R('categoria', 'componente', 'inheritance'),
    R('marca', 'componente', 'inheritance'),
    R('precio', 'componente', 'inheritance'),
    R('contador', 'componente', 'inheritance'),
  ]),

  diagrama('memento', 'Memento', 'Configurador de autos: guarda y restaura versiones sin exponer su estado', [
    T('configurador', 'Configurador', 'class', 'Originador', 0, 0, { attributes: [at('estado', 'EstadoConfig')], methods: [m('elegirMotor', 'motor: Motor'), m('guardar', '', 'Memento'), m('restaurar', 'm: Memento')] }),
    T('memento', 'Memento', 'record', 'Instantánea opaca', 0, 2, { attributes: [at('estado', 'Readonly<EstadoConfig>', 'public'), at('fecha', 'Date', 'public')] }),
    T('historial', 'Historial', 'class', 'Cuidador: guarda sin interpretar', 1, 1, { attributes: [at('pila', 'Memento[]')], methods: [m('guardar'), m('deshacer')] }),
  ], [
    R('configurador', 'memento', 'dependency', 'crea y lee'),
    R('historial', 'memento', 'aggregation', 'guarda'),
    R('historial', 'configurador', 'association', 'pide guardar / restaurar'),
  ]),

  diagrama('observer', 'Observer', 'Pedido pagado: el servicio de pagos notifica a todos los suscriptores', [
    T('pagos', 'ServicioPagos', 'class', 'Sujeto', 0, 0, { attributes: [at('suscriptores', 'SuscriptorPagos[]')], methods: [m('suscribir', 's: SuscriptorPagos'), m('desuscribir', 's: SuscriptorPagos'), m('pagar', 'pedido: Pedido')] }),
    T('suscriptor', 'SuscriptorPagos', 'interface', 'Observador', 0, 2, { methods: [abs('pedidoPagado', 'pedido: Pedido')] }),
    T('confirmacion', 'EnviarConfirmacion', 'class', 'Suscriptor', 1, 1, { methods: [m('pedidoPagado', 'pedido')] }),
    T('stock', 'ReservarStock', 'class', 'Suscriptor', 1, 2, { methods: [m('pedidoPagado', 'pedido')] }),
    T('factura', 'EmitirFactura', 'class', 'Suscriptor', 1, 3, { methods: [m('pedidoPagado', 'pedido')] }),
  ], [
    R('pagos', 'suscriptor', 'aggregation', 'notifica a'),
    R('confirmacion', 'suscriptor', 'realization'),
    R('stock', 'suscriptor', 'realization'),
    R('factura', 'suscriptor', 'realization'),
  ]),

  diagrama('state', 'State', 'Pedido: cada estado decide qué hacer y a qué estado pasar', [
    T('pedido', 'Pedido', 'class', 'Contexto', 0, 0.5, { attributes: [at('estado', 'EstadoPedido')], methods: [m('cambiarEstado', 'e: EstadoPedido'), m('pagar'), m('cancelar')] }),
    T('estado', 'EstadoPedido', 'interface', 'Estado', 0, 2.5, { methods: [abs('pagar', 'p: Pedido'), abs('cancelar', 'p: Pedido')] }),
    T('pendiente', 'Pendiente', 'class', 'Estado concreto', 1, 1, { methods: [m('pagar', 'p'), m('cancelar', 'p')] }),
    T('pagado', 'Pagado', 'class', 'Estado concreto', 1, 2, { methods: [m('pagar', 'p'), m('cancelar', 'p')] }),
    T('enviado', 'Enviado', 'class', 'Estado concreto', 1, 3, { methods: [m('pagar', 'p'), m('cancelar', 'p')] }),
    T('cancelado', 'Cancelado', 'class', 'Estado final', 1, 4, {}),
  ], [
    R('pedido', 'estado', 'association', 'delega en'),
    R('pendiente', 'estado', 'realization'),
    R('pagado', 'estado', 'realization'),
    R('enviado', 'estado', 'realization'),
    R('cancelado', 'estado', 'realization'),
  ]),

  diagrama('strategy', 'Strategy', 'Costo de envío: el checkout delega el cálculo en la estrategia elegida', [
    T('checkout', 'Checkout', 'class', 'Contexto', 0, 0.5, { attributes: [at('envio', 'CalculoEnvio')], methods: [m('total', 'p: Pedido', 'number')] }),
    T('calculo', 'CalculoEnvio', 'interface', 'Estrategia', 0, 2, { methods: [abs('calcular', 'p: Pedido', 'number')] }),
    T('plana', 'TarifaPlana', 'class', 'Estrategia concreta', 1, 1, { attributes: [at('monto', 'number')], methods: [m('calcular', 'p', 'number')] }),
    T('peso', 'PorPeso', 'class', 'Estrategia concreta', 1, 2, { attributes: [at('precioPorKg', 'number')], methods: [m('calcular', 'p', 'number')] }),
    T('tabla', 'TablaOperador', 'class', 'Estrategia concreta', 1, 3, { methods: [m('calcular', 'p', 'number')] }),
  ], [
    R('checkout', 'calculo', 'association', 'delega en'),
    R('plana', 'calculo', 'realization'),
    R('peso', 'calculo', 'realization'),
    R('tabla', 'calculo', 'realization'),
  ]),

  diagrama('template-method', 'Template Method', 'Nómina: la clase base fija los pasos; cada contrato completa los que varían', [
    T('proceso', 'ProcesoNominaMensual', 'class', 'Cliente', 0, 0, { methods: [m('ejecutar', 'empleados', 'Boleta[]')] }),
    T('base', 'CalculoNomina', 'abstract', 'Define el método plantilla', 0, 2, { methods: [m('calcularNomina', 'e: Empleado', 'Boleta'), mp('ingresoBruto', 'e: Empleado', 'number', { abstract: true }), mp('bonificaciones', 'e: Empleado', 'number'), mpriv('descuentosDeLey', 'bruto: number', 'number')] }),
    T('planilla', 'NominaPlanilla', 'class', 'Bruto fijo + bonificación', 1, 1, { methods: [mp('ingresoBruto', 'e', 'number'), mp('bonificaciones', 'e', 'number')] }),
    T('practicante', 'NominaPracticante', 'class', 'Subvención fija', 1, 2, { methods: [mp('ingresoBruto', 'e', 'number')] }),
    T('horas', 'NominaPorHoras', 'class', 'Horas × tarifa', 1, 3, { methods: [mp('ingresoBruto', 'e', 'number')] }),
  ], [
    R('proceso', 'base', 'dependency', 'calcularNomina()'),
    R('planilla', 'base', 'inheritance'),
    R('practicante', 'base', 'inheritance'),
    R('horas', 'base', 'inheritance'),
  ]),

  diagrama('visitor', 'Visitor', 'Carrito con productos de distintos tipos: cada operación es un visitante', [
    T('producto', 'Producto', 'interface', 'Elemento', 0, 1, { methods: [abs('aceptar', 'v: VisitanteProducto', 'R')] }),
    T('fisico', 'ProductoFisico', 'class', 'Elemento concreto', 1, 0, { attributes: [at('precio', 'number', 'public'), at('pesoKg', 'number', 'public')], methods: [m('aceptar', 'v', 'R')] }),
    T('digital', 'ProductoDigital', 'class', 'Elemento concreto', 1, 1, { methods: [m('aceptar', 'v', 'R')] }),
    T('suscripcion', 'Suscripcion', 'class', 'Elemento concreto', 1, 2, { methods: [m('aceptar', 'v', 'R')] }),
    T('visitante', 'VisitanteProducto', 'interface', 'Visitante', 0, 3.5, { methods: [abs('visitarFisico', 'p: ProductoFisico', 'R'), abs('visitarDigital', 'p: ProductoDigital', 'R'), abs('visitarSuscripcion', 'p: Suscripcion', 'R')] }),
    T('envio', 'CostoEnvio', 'class', 'Operación: envío', 1, 3, {}),
    T('impuestos', 'CalculoImpuestos', 'class', 'Operación: impuestos', 1, 4, {}),
  ], [
    R('fisico', 'producto', 'realization'),
    R('digital', 'producto', 'realization'),
    R('suscripcion', 'producto', 'realization'),
    R('envio', 'visitante', 'realization'),
    R('impuestos', 'visitante', 'realization'),
    R('producto', 'visitante', 'dependency', 'aceptar(v)'),
  ]),
];

// ── Generación ──
const filtro = process.argv.slice(2);
const lista = filtro.length ? DIAGRAMAS.filter((d) => filtro.includes(d.slug)) : DIAGRAMAS;
const fallos = [];

for (const { slug, spec } of lista) {
  writeFileSync(join(trabajo, `${slug}.class.json`), JSON.stringify(spec, null, 2));
  let recibo;
  try {
    const salida = execFileSync('node', [archify, 'finalize', 'class', `${slug}.class.json`, `${slug}.class.html`, '--quality', 'standard', '--json'], { cwd: trabajo, encoding: 'utf8' });
    recibo = JSON.parse(salida);
  } catch (e) {
    try { recibo = JSON.parse(e.stdout); } catch { recibo = { status: 'error', diagnostics: [{ message: String(e.stderr || e.message).slice(0, 500) }] }; }
  }
  if (recibo.status !== 'pass') {
    fallos.push(slug);
    console.log(`✗ ${slug}: ${JSON.stringify(recibo.gates)} ${JSON.stringify((recibo.diagnostics || []).slice(0, 3).map((d) => d.code + ': ' + d.message))}`);
    continue;
  }
  // Copia al proyecto con el estilo de ajuste al iframe
  const html = readFileSync(join(trabajo, `${slug}.class.html`), 'utf8').replace('</head>', `${estiloAjuste}\n</head>`);
  writeFileSync(join(destino, `${slug}.class.html`), html);
  console.log(`✓ ${slug}`);
}

rmSync(trabajo, { recursive: true, force: true });
console.log(`\n${lista.length - fallos.length}/${lista.length} diagramas generados.` + (fallos.length ? ` Fallaron: ${fallos.join(', ')}` : ''));
if (fallos.length) process.exit(1);
