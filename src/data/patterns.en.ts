// English text for the 23 patterns. The Spanish original lives in patterns.ts; the code examples are
// shared, and only their comments are translated (see src/i18n/comentarios).
import type { PatternData } from './patterns.ts';

export type TextosPatron = Pick<
  PatternData,
  'aka' | 'purpose' | 'problema' | 'historiaReal' | 'dolorIngenuo' | 'solucionPatron' | 'nota' | 'principiosClave' | 'cuandoUsarlo' | 'cuandoNoUsarlo' | 'relaciones'
>;

export const PATRONES_EN: Record<string, TextosPatron> = {
  // ───────────────────────────── CREATIONAL ─────────────────────────────
  'factory-method': {
    aka: 'Virtual constructor',
    purpose: 'Defines a method for creating an object, but lets subclasses decide which concrete class to instantiate.',
    problema: 'I have a switch that decides which class to create, and it grows with every new type.',
    historiaReal: 'Your fintech reconciles its customers\' bank transactions with their sales. Each bank delivers its statement in its own format: one sends a semicolon-separated CSV, another a fixed-width TXT and another exposes a JSON API. The reconciliation process (read the transactions, match them against sales and flag differences) is always the same; the only thing that changes is how the statement is read.',
    dolorIngenuo: 'The reconciliation service has a switch(banco) that creates the right reader, and that same switch shows up in the nightly job, in the manual file upload and in the tests. Adding a bank means changing all of those places, and it is easy to miss one.',
    solucionPatron: 'The base class Conciliador defines the process and delegates creating the reader to an abstract factory method, crearLector(). Each subclass (ConciliadorBancoAndino, ConciliadorBancoPacifico) decides which concrete reader to create. Adding a bank means adding a subclass, without touching the process.',
    nota: 'In modern code it is very common to replace inheritance with injection: you pass the constructor a factory or a function that creates the reader. The idea is the same: the process does not decide which concrete class gets instantiated. Also, the factory method does not have to create a new object every time: it can return one that already exists (from a cache or a pool), and the caller does not notice the difference.',
    principiosClave: [
      'Open/Closed: a new bank is a new subclass, not one more case.',
      'Dependency inversion: the process depends on the LectorExtracto interface, not on the concrete readers.',
    ],
    cuandoUsarlo: [
      'A class has a stable process, but the concrete object it works with varies from case to case.',
      'You want whoever extends your code (subclasses, plugins) to decide which object gets created.',
      'You want to reuse expensive objects (already configured readers, connections) instead of creating them every time: the factory method can return an existing one.',
    ],
    cuandoNoUsarlo: [
      'There is only one concrete type and no other is expected: a plain new is clearer.',
      'If the variation does not justify a class hierarchy, injecting the object or a function that creates it is enough.',
      'Every new product also requires a new creator: with many products, the hierarchy grows more than it helps.',
    ],
    relaciones: [
      'Abstract Factory: usually implemented with several factory methods, one per product.',
      'Template Method: the factory method is often one of the steps the subclass fills in.',
      'Prototype: an alternative that creates objects by cloning instead of using subclasses.',
    ],
  },
  'abstract-factory': {
    aka: 'Kit',
    purpose: 'Provides an interface for creating families of related objects without specifying their concrete classes.',
    problema: 'I need to create several objects that must match each other (same family).',
    historiaReal: 'Your SaaS product runs in the cloud and is also installed in the customer\'s own data center (on-premise). In the cloud you use object storage, a managed queue and a secrets manager; on-premise you use a network drive, RabbitMQ and Vault. The critical part is that the three services of one environment go together: mixing the cloud queue with local storage breaks permissions and networking.',
    dolorIngenuo: 'Every module creates its services with if (entorno === "nube"). All it takes is for someone to forget one if, and pieces from different environments end up living together in production; the error only shows up at the customer\'s installation.',
    solucionPatron: 'An abstract factory, Infraestructura, declares crearAlmacenamiento(), crearCola() and crearSecretos(). There is one concrete factory per environment. A single factory is chosen at startup, and everything it creates belongs, by construction, to the same family.',
    principiosClave: [
      'Dependency inversion: modules use interfaces (Cola, Almacenamiento), never a provider\'s classes.',
      'Consistency: the factory guarantees that the products of one family are used together.',
    ],
    cuandoUsarlo: [
      'You need to create several objects that have to be compatible with each other.',
      'Your product comes in variants (provider, platform, visual theme) that change several pieces at once.',
    ],
    cuandoNoUsarlo: [
      'You only create one kind of object: a Factory Method or simple injection is enough.',
      'The families change their products often: adding a product forces you to change the interface and every factory.',
      'There is only one family: the extra interfaces and classes are not justified.',
    ],
    relaciones: [
      'Factory Method: each method of the abstract factory is usually a factory method.',
      'Singleton: there is normally a single active concrete factory in the whole application.',
      'Facade: a facade can use an abstract factory to hide how the subsystem\'s objects are created.',
      'Bridge: when certain abstractions only work with certain implementations, an abstract factory can create the right pairs and hide that rule.',
    ],
  },
  builder: {
    aka: 'Step-by-step construction',
    purpose: 'Separates the construction of a complex object from its representation, so it can be built step by step and validated before it is handed over.',
    problema: 'My constructor has too many optional parameters and nobody knows what order they go in.',
    historiaReal: 'Your marketplace search accepts text, category, price range, brands, "in stock only", sort order and pagination. Almost everything is optional, but there are rules: the minimum price cannot exceed the maximum and pages start at 1. On top of that, marketing wants predefined searches such as "Deals of the day" or "New arrivals".',
    dolorIngenuo: 'new Busqueda("zapatillas", null, null, 100, null, true, "precio", 2, 20): nobody remembers what each argument is, values can be swapped without the compiler noticing and the validations end up scattered across the controllers.',
    solucionPatron: 'A BusquedaBuilder receives the data step by step, through methods with names. At the end, build() checks every rule and returns an immutable Busqueda object. The predefined searches are written as recipes (the Director) that always run the same steps.',
    nota: 'There are two variants. The original GoF Builder separates a Director, which defines the order of the steps, from several concrete builders that produce different representations (for example, the same document as HTML or as PDF). The "fluent" builder, with chained methods, became popular later as a way to avoid constructors with too many parameters. The example combines both: a fluent builder and recipes that act as the Director.',
    principiosClave: [
      'Single responsibility: assembling and validating the object is the builder\'s job, not the controllers\'.',
      'Immutability: the final object is born complete and valid.',
    ],
    cuandoUsarlo: [
      'An object has many optional parameters or combinations to validate.',
      'You want to build the object in stages (for example, as the filters are read from the URL).',
      'The same construction process must produce different representations.',
    ],
    cuandoNoUsarlo: [
      'The object has few fields: a constructor or a named options object (new Busqueda({ texto, orden })) is enough.',
      'There are no rules to check and no steps to order: the builder only adds code.',
    ],
    relaciones: [
      'Abstract Factory: returns finished objects in a single call; Builder assembles them step by step.',
      'Composite: builders are very handy for building complex trees.',
      'Bridge: the Director can act as the abstraction and each concrete builder as the implementation.',
      'Singleton: a shared Director or builder can be a single instance.',
    ],
  },
  prototype: {
    aka: 'Clone',
    purpose: 'Creates new objects by copying an existing one, without the code depending on its concrete class or exposing its internal state.',
    problema: 'Building the object from scratch is expensive; I would rather copy one that is already set up.',
    historiaReal: 'An insurance company sells policies based on templates such as "Basic Auto", "Full Auto" or "Premium Home". Each template comes with coverages, deductibles and clauses that the underwriting team configures with rules stored in the database. The sales agent starts from a template and only adjusts what is specific to the customer: the vehicle, the insured amount or a discount.',
    dolorIngenuo: 'To create the policy, the code copies field by field from the template. Every time underwriting adds a field, someone forgets to copy it. Worse: the list of coverages is copied by reference, so changing one customer\'s policy also changes the template for everyone.',
    solucionPatron: 'Every policy knows how to clone itself with clonar(). Since the object itself has access to its private fields, it decides what to deep-copy (the coverages, which are mutable) and what can be shared (immutable data). A prototype registry keeps the templates ready to be cloned.',
    nota: 'The key to the pattern is deciding what gets deep-copied. A shallow copy ({ ...obj } or Object.assign) only copies the first level: internal lists and objects are still shared. JavaScript has structuredClone(), but it does not keep the object\'s methods or class; that is why objects usually implement their own clonar().',
    principiosClave: [
      'Encapsulation: the object copies itself without exposing its fields.',
      'Independence from concrete classes: the client clones without knowing which policy subclass it has.',
    ],
    cuandoUsarlo: [
      'You create objects from configurations that are expensive to put together (rules, queries, calculations).',
      'You have many preconfigured variants and would rather copy them than create a subclass for each one.',
    ],
    cuandoNoUsarlo: [
      'The object is simple to build: cloning adds nothing.',
      'The object has circular references or external resources (connections, open files) that make no sense to copy.',
    ],
    relaciones: [
      'Abstract Factory: can store prototypes and clone them instead of instantiating classes.',
      'Memento: for simple objects, a clone can serve as a snapshot of the state.',
      'Composite and Decorator: cloning complex structures is often easier than rebuilding them.',
    ],
  },
  singleton: {
    aka: 'Single instance',
    purpose: 'Ensures a class has only one instance and provides a point of access to it.',
    problema: 'There must be a single shared instance (configuration, process-wide cache).',
    historiaReal: 'At startup, your API loads its configuration and feature flags (which features are enabled in each country) from a file and a remote service. Loading takes half a second and must happen only once: if every module has its own copy, some will see a feature as enabled and others will not.',
    dolorIngenuo: 'Every service calls new Configuracion() and reads the file and calls the remote service again. On top of that, when the flags are refreshed, some copies get updated and others do not, and the API\'s behavior depends on which copy each request happened to use.',
    solucionPatron: 'The Configuracion class has a private constructor and a static method that creates the instance the first time and then always returns the same one. Today it is common to hand that guarantee to the dependency injection container, registering the class with a singleton lifetime.',
    nota: 'Singleton solves two things at once (a single instance and global access), and that is why it is often considered an anti-pattern: global access hides dependencies and makes testing harder. In frameworks such as ASP.NET Core, Spring or NestJS you register the service as a singleton in the container: the instance is still unique, but it is injected and can be replaced in tests. In multi-threaded environments, lazy creation must be synchronized.',
    principiosClave: [
      'Controlled single instance: every part sees the same state.',
      'Lazy initialization: the cost is paid only the first time it is used.',
    ],
    cuandoUsarlo: [
      'A resource must exist only once per process: configuration, in-memory cache, metrics registry.',
      'Creating the instance is expensive and its state has to be consistent for everyone.',
    ],
    cuandoNoUsarlo: [
      'You use it as a global variable to avoid passing dependencies around: it hides the coupling and makes testing harder.',
      'You need separate instances per test, per user or per request.',
      'For database connections: what can be unique is the access point that manages a connection pool, not one connection shared by the whole system.',
    ],
    relaciones: [
      'Abstract Factory, Builder and Prototype: their factories or registries are often single instances.',
      'Facade: a single facade is often enough.',
      'Flyweight: both share instances, but a Singleton is a single instance whose state can change, while flyweights are many instances and always immutable.',
    ],
  },

  // ───────────────────────────── STRUCTURAL ─────────────────────────────
  adapter: {
    aka: 'Wrapper',
    purpose: 'Converts the interface of a class into another interface the client expects, so classes with incompatible interfaces can work together.',
    problema: 'An external library does not fit the interface my code uses.',
    historiaReal: 'Your e-commerce site charges through its own interface, PasarelaPago, with a cobrar(monto, tarjeta) method. The business signs up with a local payment processor that has better fees, but its SDK works differently: it uses cents, takes a token instead of the card and answers with numeric codes instead of throwing errors. You cannot change the SDK because it belongs to a third party.',
    dolorIngenuo: 'The conversions (switching to cents, knowing that code "05" means declined and "91" means retry) are copied into checkout, subscriptions and refunds. When the provider changes a code, you have to hunt for it across the whole project.',
    solucionPatron: 'An AdaptadorPagoLocal implements PasarelaPago and wraps the SDK. It translates the call (amount to cents, card to token) and the response (codes to results). The rest of the system keeps using PasarelaPago without knowing there is a new provider.',
    principiosClave: [
      'Single responsibility: the translation between interfaces lives in one place.',
      'Open/Closed: you integrate a new provider without changing the code that charges.',
    ],
    cuandoUsarlo: [
      'You want to use an existing class (SDK, library, legacy system) whose interface does not match the one your code expects.',
      'You want to isolate your domain from an external provider so you can replace it in the future.',
      'Several existing subclasses need the same capability, which you cannot add to their base class: instead of repeating it in each one, you put it in an adapter that wraps them.',
    ],
    cuandoNoUsarlo: [
      'You control both interfaces and can align them directly.',
      'The adapter starts piling up business logic: its only job is to translate.',
    ],
    relaciones: [
      'Bridge: designed up front to separate two hierarchies; Adapter is applied afterwards to make existing things fit.',
      'Decorator: keeps the interface and adds behavior; Adapter changes the interface.',
      'Facade: creates a new, simpler interface for a whole subsystem; Adapter adapts an existing interface.',
      'Proxy: offers the same interface as the real object; Adapter offers a different one.',
    ],
  },
  bridge: {
    aka: 'Handle/Body',
    purpose: 'Decouples an abstraction from its implementation so the two can vary independently.',
    problema: 'I have two axes of variation and the subclasses keep multiplying (M × N).',
    historiaReal: 'Your management system produces Sales, Inventory and Collections reports, and each one can be exported to PDF, to Excel or sent as HTML by email. Two things change separately: which report it is (its content) and the format it is drawn in.',
    dolorIngenuo: 'With inheritance you end up with ReporteVentasPdf, ReporteVentasExcel, ReporteInventarioPdf... 3 reports × 3 formats = 9 classes. A new format (CSV) forces 3 more classes, and a new report another 3. The number of classes grows multiplicatively (M × N).',
    solucionPatron: 'Two hierarchies are separated: the abstraction (Reporte and its variants) and the implementation (Renderizador: PDF, Excel, HTML). Each report holds a reference to a renderer and delegates to it how titles and tables are drawn. Now there are 3 + 3 classes, and each axis grows on its own.',
    nota: 'In Bridge, "implementation" does not mean "the class that implements an interface". It refers to the low-level hierarchy that does the platform-dependent work (here, drawing in PDF or Excel). The "abstraction" is the high-level layer the client uses (the report).',
    principiosClave: [
      'Composition over inheritance: the report has a renderer instead of inheriting from one.',
      'Open/Closed: you add a report or a format without touching the other axis.',
    ],
    cuandoUsarlo: [
      'A class varies along two or more independent dimensions and inheritance multiplies the subclasses.',
      'You want to switch the implementation at runtime (for example, the format the user picks).',
    ],
    cuandoNoUsarlo: [
      'There is only one dimension of variation: an interface and its implementations are enough.',
      'The two hierarchies always change together: separating them adds nothing.',
    ],
    relaciones: [
      'Adapter: makes existing classes compatible; Bridge is designed in advance.',
      'Strategy: similar structure; Bridge separates two whole hierarchies, Strategy swaps one algorithm.',
      'Abstract Factory: can create the right combinations of abstraction and implementation.',
    ],
  },
  composite: {
    aka: 'Object tree',
    purpose: 'Composes objects into tree structures to represent part-whole hierarchies, and lets you treat individual elements and groups the same way.',
    problema: 'I work with trees and want to treat a leaf and a group the same way.',
    historiaReal: 'HR needs the monthly payroll cost of any part of the company: a team, a division or the whole company. A division contains departments, departments contain teams, and there can be direct employees at any level.',
    dolorIngenuo: 'The function that calculates the cost asks at every level whether the element is an employee or a department and walks the tree recursively with if/instanceof. The same traversal is repeated to count people, list emails or calculate bonuses.',
    solucionPatron: 'Empleado (leaf) and Area (composite) implement the same interface, MiembroOrganizacion, with costoMensual(). The employee returns their salary; the department adds up the cost of its members, whether they are people or other departments. Whoever asks for the cost does not need to know what they are looking at.',
    principiosClave: [
      'Polymorphism: the leaf and the composite answer the same message.',
      'Open/Closed: a new node type (for example, a contractor) does not change the client code.',
    ],
    cuandoUsarlo: [
      'Your data forms a part-whole tree: org charts, menus, categories, folders, product bundles.',
      'You want the client to treat a single element and a group the same way.',
    ],
    cuandoNoUsarlo: [
      'The structure is not hierarchical.',
      'Leaves and composites have very different operations: forcing a common interface means methods that do not apply.',
    ],
    relaciones: [
      'Iterator: lets you walk the tree without exposing its structure.',
      'Visitor: lets you add new operations over the whole tree.',
      'Decorator: also wraps objects behind the same interface, but it has a single child and adds behavior.',
      'Chain of Responsibility: a request can travel up from a leaf to its parents.',
    ],
  },
  decorator: {
    aka: 'Wrapper',
    purpose: 'Adds responsibilities to an object dynamically by wrapping it in other objects that share the same interface.',
    problema: 'I want to add behavior (logging, retries, caching) without touching the class.',
    historiaReal: 'Your service calls an exchange-rate provider\'s API. Over time you are asked to log every call, retry when the provider fails and cache the responses. Not every use needs all of that: the nightly reports do not want caching, and the tests do not want retries.',
    dolorIngenuo: 'Logging, retries and caching end up inside ClienteTiposCambio, controlled by flags (usarCache, reintentar, log). The class grows, every combination is tested by hand and, for another API, everything has to be copied.',
    solucionPatron: 'Each capability is a decorator that implements the same interface as the client and wraps another object: ConCache(ConReintentos(ApiTiposCambio)). Each decorator does its part and delegates to the one it wraps. The combinations are put together when the application is configured.',
    principiosClave: [
      'Single responsibility: each decorator does just one thing.',
      'Open/Closed: you add behavior without changing the original class.',
      'Composition over inheritance: combinations are assembled at runtime, not with subclasses.',
    ],
    cuandoUsarlo: [
      'You want to add cross-cutting responsibilities (logging, caching, retries, metrics, permissions) without changing the object.',
      'You need to combine those capabilities in different ways depending on the context.',
    ],
    cuandoNoUsarlo: [
      'The order of the decorators matters and is hard to control: ConCache(ConReintentos(x)) does not behave like ConReintentos(ConCache(x)).',
      'You need to remove or inspect one specific decorator in the middle of the stack: the pattern does not make that easy.',
      'There is only one possible combination: a simple class is clearer.',
    ],
    relaciones: [
      'Adapter: changes the interface; Decorator keeps it and adds behavior.',
      'Proxy: same structure, but it controls access to the object; decorators are chosen and combined by the client.',
      'Chain of Responsibility: similar, but in a chain any link can stop the flow; a decorator normally always delegates.',
      'Composite: also wraps objects, but it groups several children instead of one.',
    ],
  },
  facade: {
    aka: 'Front door',
    purpose: 'Provides a simple, unified interface to a set of classes in a complex subsystem.',
    problema: 'Using a subsystem means knowing ten classes and the right order to call them.',
    historiaReal: 'Issuing an electronic invoice means validating the customer\'s tax ID, calculating taxes, generating the XML in the official format, signing it with the digital certificate, sending it to the tax authority, waiting for the receipt and storing the PDF. Checkout, the sales dashboard and the recurring billing job all do it.',
    dolorIngenuo: 'Those three places know the subsystem\'s six classes and the exact order of the calls. When the tax authority changes the XML format, three nearly identical flows have to be fixed.',
    solucionPatron: 'A FacturacionElectronica class (the facade) exposes a single operation, emitir(venta), that orchestrates the subsystem internally. Clients depend only on the facade; the inner classes are still available to anyone who needs something advanced.',
    principiosClave: [
      'Loose coupling: clients depend on one class instead of six.',
      'Information hiding: the subsystem\'s details stay in one place.',
    ],
    cuandoUsarlo: [
      'A complex subsystem is always used the same way from several places.',
      'You want to split your application into layers and offer a clear entry point to each one.',
    ],
    cuandoNoUsarlo: [
      'The facade starts piling up business logic from the whole system and turns into a God class.',
      'Clients almost always need fine-grained control of the subsystem: the facade just gets in the way.',
    ],
    relaciones: [
      'Adapter: makes an existing interface fit another one; Facade creates a new, simpler interface.',
      'Mediator: also centralizes, but the coordinated objects know about the mediator; the subsystem does not know the facade exists.',
      'Abstract Factory: can be used together with a facade to create the subsystem\'s objects.',
      'Singleton: a single facade is often enough.',
    ],
  },
  flyweight: {
    aka: 'Shared state',
    purpose: 'Lets you handle a large number of objects efficiently by sharing the part of their state that is common and immutable.',
    problema: 'I have thousands of nearly identical objects and the memory is not enough.',
    historiaReal: 'You are building a spreadsheet that runs in the browser. A typical finance file has 2 million cells, and each cell has formatting: font, size, color, border, alignment and number format. Yet across the whole file there are only about 40 different format combinations.',
    dolorIngenuo: 'If every cell stores its own format object (about 200 bytes), the formats alone take up close to 400 MB. The browser tab slows down and eventually crashes.',
    solucionPatron: 'The intrinsic state, shared and immutable (the format), is separated from the extrinsic state that belongs to each cell (row, column and value). A format factory always returns the same object for the same combination, and the cells only keep a reference: 40 format objects instead of 2 million.',
    principiosClave: [
      'Immutability: the shared state cannot change, because it would affect everyone using it.',
      'Separating the intrinsic state (shared) from the extrinsic state (specific to each object).',
    ],
    cuandoUsarlo: [
      'The application creates a huge number of objects and memory is a measured problem, not an assumed one.',
      'Much of those objects\' state is repeated and can be extracted as immutable.',
    ],
    cuandoNoUsarlo: [
      'Memory is not a bottleneck: the pattern adds complexity with no benefit.',
      'The repeated state changes often in each object: it cannot be shared.',
      'Sharing has a cost: each object\'s own state has to be passed in or recalculated on every call, so you trade memory for CPU time and the code becomes harder to understand.',
    ],
    relaciones: [
      'Composite: the shared leaves of a tree can be implemented as flyweights.',
      'Singleton: Singleton is one instance; Flyweight is many shared immutable instances.',
      'Factory Method: the flyweight factory decides whether to create a new object or reuse an existing one.',
    ],
  },
  proxy: {
    aka: 'Surrogate · Stand-in',
    purpose: 'Provides a stand-in for another object to control access to it: lazy loading, permissions, caching or remote access.',
    problema: 'I need to control access to an object: lazy loading, permissions or caching.',
    historiaReal: 'A clinic network\'s system shows each patient\'s medical record: personal data, diagnoses and imaging studies that weigh hundreds of megabytes in external storage. There are two rules: only the treating doctor can see the record, and the images must not be downloaded until someone opens them.',
    dolorIngenuo: 'The repository downloads everything when the patient is loaded, even if the doctor only looks at the general data. And the permission check is copied into every controller: all it takes is one new endpoint forgetting it to expose sensitive data.',
    solucionPatron: 'A ProxyHistoriaClinica implements the same interface as the real record. It checks permissions before every access (protection proxy) and does not download the images until they are requested (virtual proxy). The rest of the system cannot tell the proxy from the real object.',
    principiosClave: [
      'Single responsibility: access control and lazy loading are moved out of the real object.',
      'Open/Closed: you add controls without changing the real class or its clients.',
    ],
    cuandoUsarlo: [
      'Virtual proxy: the object is expensive to create or load and is not always used.',
      'Protection proxy: access depends on the permissions of whoever asks.',
      'Remote, caching or logging proxy: the object lives in another service, its responses can be reused or you want a record of every call.',
      'Smart reference: release an expensive object once nobody is using it anymore.',
    ],
    cuandoNoUsarlo: [
      'The object is cheap and needs no control: the proxy only adds a layer.',
      'Latency is critical and every extra hop counts.',
    ],
    relaciones: [
      'Decorator: same shape, but the decorator adds behavior chosen by the client, while the proxy controls access.',
      'Adapter: offers a different interface; Proxy offers the same one.',
      'Facade: also sits in front of something, but to simplify a whole subsystem.',
    ],
  },

  // ───────────────────────────── BEHAVIORAL ─────────────────────────────
  'chain-of-responsibility': {
    aka: 'Chain of handlers',
    purpose: 'Passes a request along a chain of handlers; each one decides whether to process it, reject it or pass it on to the next.',
    problema: 'A request goes through several filters and any of them can stop it.',
    historiaReal: 'Before approving a card payment, your fintech runs anti-fraud checks in order: a list of blocked cards, the customer\'s daily limit, the country of the connection versus the country of the card, and a risk score calculated by an external model. Any check can reject the payment and skip the rest. The risk team changes the order and adds checks every few weeks.',
    dolorIngenuo: 'A 200-line validarPago() method has every check in chained ifs. Changing the order, or turning off a check for one country, means changing and retesting the whole method.',
    solucionPatron: 'Each check is a handler with the same interface and a reference to the next one. If it spots a problem, it rejects the payment; otherwise it passes it to the next link. The chain is assembled when the application is configured and can be different in each country.',
    nota: 'Always define what happens if the request reaches the end without anyone handling it: in this example it is approved; in other cases a default handler works better. The middleware in Express, ASP.NET Core or Laravel is a variant of this pattern.',
    principiosClave: [
      'Single responsibility: each check lives in its own class.',
      'Open/Closed: you add, remove or reorder checks without changing the existing ones.',
    ],
    cuandoUsarlo: [
      'A request must go through several validation or processing steps and any of them can stop it.',
      'The order or the set of steps changes depending on the configuration or the context.',
    ],
    cuandoNoUsarlo: [
      'There are only a few fixed steps: a sequence of calls is easier to read.',
      'The chain is long and you do not record which link made the decision: debugging a rejection becomes hard.',
    ],
    relaciones: [
      'Decorator: similar structure, but the decorator always delegates; in a chain any link can stop.',
      'Command: the requests that travel along the chain can be represented as commands.',
      'Composite: an event can travel up from a component to its container as if it were a chain.',
    ],
  },
  command: {
    aka: 'Action · Transaction',
    purpose: 'Turns a request into an object with all the information it needs, so it can be queued, logged, scheduled or undone.',
    problema: 'I want to queue, log or undo user actions.',
    historiaReal: 'In a store\'s admin dashboard, the sales team applies bulk changes: raising the prices of a category by 10%, moving products to another category or deactivating them. They need to undo the last change, keep an audit trail of who did what and schedule some changes for the midnight when a campaign starts.',
    dolorIngenuo: 'Every button in the dashboard changes the database directly. The previous values are not recorded, so undoing is impossible, and scheduling a change means duplicating the logic in a separate job.',
    solucionPatron: 'Each action becomes a command object with ejecutar() and deshacer(), which stores the data it needs and, when it runs, the previous values so it can revert. An invoker runs the commands, pushes them onto a history and logs them; a scheduler can store the same command to run it later.',
    nota: 'Since a command is an object with all its data, it can also be serialized: stored in the database to run later, retried if it fails or sent to another service to run there.',
    principiosClave: [
      'Single responsibility: whoever triggers the action (button, job, API) does not know how it is carried out.',
      'Open/Closed: a new action is a new class.',
    ],
    cuandoUsarlo: [
      'You need undo and redo, auditing, queuing or scheduling of actions.',
      'The same action is triggered from several places (button, keyboard shortcut, API, scheduled job).',
      'You want to treat operations as data: store them, retry them or send them to a queue.',
      'You want to group several simple commands into a composite one (a "macro") that runs and is undone as a single action.',
    ],
    cuandoNoUsarlo: [
      'The action is simple, is triggered from a single place and needs no history: a function is enough.',
    ],
    relaciones: [
      'Memento: a command can keep a memento of the previous state so it can undo.',
      'Chain of Responsibility: commands can travel through a chain of handlers.',
      'Strategy: both turn behavior into objects; a command represents a specific operation with its data, a strategy a way of doing something.',
    ],
  },
  interpreter: {
    aka: 'Expression tree',
    purpose: 'Defines how to represent the grammar of a simple language as objects and how to evaluate sentences in that language.',
    problema: 'My users write rules in a mini-language that I have to evaluate.',
    historiaReal: 'Your e-commerce site lets the marketing team write their own promotion rules without asking for a deployment, for example: total > 100 Y cliente_frecuente O cupon = "VERANO". Each rule must be evaluated against every cart during checkout.',
    dolorIngenuo: 'The rule is evaluated with regular expressions and string comparisons or, worse, with eval(), which allows arbitrary code to run. Every new operator makes the code more complicated, and the errors show up in production.',
    solucionPatron: 'There is one class for each element of the grammar: terminal expressions (a comparison, a condition) and non-terminal ones (Y, O, NO, that is, AND, OR, NOT). The rule is represented as a tree of those objects, and evaluating it means asking the root to interpret itself with the cart\'s data.',
    nota: 'Interpreter does not include parsing the text. The pattern assumes you already have the expression tree; turning "total > 100 Y ..." into that tree is the job of a parser, which is built separately.',
    principiosClave: [
      'Composition: complex expressions are formed by combining simple expressions.',
      'Open/Closed: a new operator is a new class.',
    ],
    cuandoUsarlo: [
      'You have a small, stable language (business rules, filters, formulas) that is evaluated many times.',
      'You want non-technical people to define rules without touching the code.',
    ],
    cuandoNoUsarlo: [
      'The grammar is large or changes a lot: use a parser generator (ANTLR, Tree-sitter) or an existing rules engine.',
      'Performance is critical: interpreting a tree of objects is slower than compiling the rule.',
    ],
    relaciones: [
      'Composite: the expression tree is a Composite.',
      'Visitor: lets you add operations to the tree (validate, print, optimize) without changing the expressions.',
      'Flyweight: repeated terminal expressions can be shared.',
    ],
  },
  iterator: {
    aka: 'Cursor',
    purpose: 'Lets you walk through the elements of a collection one by one without exposing how it is organized internally.',
    problema: 'I want to walk through a collection without exposing how it is stored.',
    historiaReal: 'Your system syncs every customer from an external CRM. The CRM\'s API returns customers 100 at a time and, to ask for the next page, you have to send the cursor that came in the previous response. Several processes need to walk through all the customers: the sync, an export and a monthly report.',
    dolorIngenuo: 'Every process repeats the same pagination loop: request a page, read the cursor and detect the end. If the CRM changes how it paginates, every loop has to be fixed.',
    solucionPatron: 'An iterator encapsulates the traversal: whoever uses it just asks for "the next customer" until there are none left. How the pages are requested and the cursor is handled stays hidden. In TypeScript it is naturally implemented with an async generator.',
    nota: 'Most modern languages have the pattern built in: Symbol.iterator and generators in JavaScript and TypeScript, IEnumerable and yield return in C#, Iterator in Java and generators in Python. You rarely need to write hasNext() and next() by hand.',
    principiosClave: [
      'Single responsibility: the traversal is separated from the collection and from whoever uses it.',
      'Information hiding: the client does not know the internal structure (pages, tree, graph).',
    ],
    cuandoUsarlo: [
      'The collection has a complex internal structure (pages, tree, graph) that you do not want to expose.',
      'You need several ways of walking through the same collection, or a lazy traversal that loads as it goes.',
      'You need several traversals over the same collection at once, or to pause one and resume it later: each iterator keeps its own position.',
    ],
    cuandoNoUsarlo: [
      'It is a simple list or array: the language\'s loops already use iterators.',
      'You need random access by position more than a sequential traversal.',
      'In very specialized collections, a generic iterator can be slower than accessing their elements directly.',
    ],
    relaciones: [
      'Composite: iterators let you walk a tree without knowing its structure.',
      'Factory Method: a collection can return the right iterator through a factory method.',
      'Memento: you can save the position of a traversal to continue it later.',
    ],
  },
  mediator: {
    aka: 'Intermediary · Controller',
    purpose: 'Reduces the dependencies between objects by making them communicate through a mediator object instead of directly.',
    problema: 'All my components call each other and it is already a tangled web.',
    historiaReal: 'A marketplace\'s filter panel has category, brand, price range, free shipping, a result counter and a "Clear" button. Picking a category changes the available brands; picking a brand adjusts the price range; any change updates the counter; "Clear" resets everything.',
    dolorIngenuo: 'Every component knows and calls the others directly. With six components there are dozens of cross connections, and reusing the brand selector on another screen is impossible because it drags all the others along.',
    solucionPatron: 'The components do not talk to each other: they notify the mediator (PanelFiltros) when something changes. The mediator knows them all and decides what to update. Each component depends only on the mediator and can be reused in another panel.',
    nota: 'Libraries such as MediatR (.NET) borrow the name, but they work more like an in-process message dispatcher (each request goes to its handler) than like the classic Mediator, which coordinates objects that work together.',
    principiosClave: [
      'Loose coupling: components depend on the mediator, not on each other.',
      'Single responsibility: the coordination lives in one place.',
    ],
    cuandoUsarlo: [
      'Many objects communicate in complex ways and changing one forces you to touch several.',
      'You want to reuse components that are currently tied to others.',
    ],
    cuandoNoUsarlo: [
      'There are only two or three objects with simple relationships.',
      'The mediator grows until it knows everything: keep an eye on it so it does not become a God class.',
    ],
    relaciones: [
      'Observer: components often notify the mediator through events; Observer broadcasts notifications, Mediator coordinates.',
      'Facade: also centralizes, but the subsystem does not know about the facade; here the components do know the mediator.',
      'Chain of Responsibility and Command: other ways of connecting senders and receivers.',
    ],
  },
  memento: {
    aka: 'Snapshot · Token',
    purpose: 'Captures an object\'s internal state so it can be restored later, without breaking its encapsulation.',
    problema: 'I need to save and restore an object\'s state without exposing its internal data.',
    historiaReal: 'A car dealership has a web car configurator: model, color, engine, trim package and accessories. Every choice changes the price and disables incompatible options. Customers want to undo changes and compare two saved configurations before asking for a quote.',
    dolorIngenuo: 'To save a version, the history copies the configurator\'s fields from outside, which forces them to be public. That way any part of the code can leave the configurator in an invalid state, like an electric engine with a manual gearbox.',
    solucionPatron: 'The Configurador itself (the originator) creates a Memento with a snapshot of its state and knows how to restore itself from it. The Historial (the caretaker) stores the mementos without interpreting them. The configurator\'s state stays private.',
    nota: 'In languages with private nested classes (Java, C#), the memento can be an inner class of the originator, and nobody else can read its contents. In TypeScript this is approximated by marking the state as read-only and not using it outside the originator.',
    principiosClave: [
      'Encapsulation: the state is saved and restored without exposing it.',
      'Single responsibility: the history manages the versions; the configurator, its rules.',
    ],
    cuandoUsarlo: [
      'You need to undo changes, keep versions or restore points of an object.',
      'You want to go back to the previous state if a multi-step operation fails halfway through.',
      'Copying the state from outside would force you to expose private fields.',
    ],
    cuandoNoUsarlo: [
      'The state is large and saved very often: memory grows quickly (consider storing only the changes).',
      'The state includes resources that cannot be copied, such as connections or open files.',
      'Nobody takes care of discarding mementos that are no longer useful: the caretaker must control how many it keeps and when it deletes them, or the history will grow without limit.',
    ],
    relaciones: [
      'Command: a command can save a memento before running so it can undo.',
      'Prototype: for simple objects, a clone can work as a memento.',
      'Iterator: a memento can store the position of a traversal.',
    ],
  },
  observer: {
    aka: 'Publish-subscribe · Listener',
    purpose: 'Defines a one-to-many relationship: when an object changes or emits an event, all its subscribers get notified.',
    problema: 'When something happens, several parts of the system need to find out.',
    historiaReal: 'When an order is paid on your e-commerce site, several things must happen: send the confirmation email, reserve the stock, generate the invoice and tell the warehouse to prepare the shipment. Every quarter, marketing or logistics ask to react to that same event in some new way.',
    dolorIngenuo: 'The payment service calls email, inventory, billing and the warehouse directly. Every new requirement forces you to change it, and it ends up knowing half the system.',
    solucionPatron: 'The payment service (the subject) keeps a list of subscribers and, when an order is paid, notifies them of the event. Each service subscribes on its own. To add a new reaction you create a new subscriber; the payment service does not change.',
    nota: 'In its basic form the notification is synchronous: if a subscriber throws an exception, it can interrupt the others and even the payment. To isolate failures, catch each subscriber\'s error or publish the event to a queue (RabbitMQ, Kafka, SQS) so each service processes it separately.',
    principiosClave: [
      'Open/Closed: you add new reactions without changing the subject.',
      'Loose coupling: the subject only knows a subscriber interface.',
    ],
    cuandoUsarlo: [
      'A change in one object must trigger reactions in others, and you do not know in advance how many or which ones.',
      'You want to separate the core of the business from its side effects (emails, metrics, integrations).',
    ],
    cuandoNoUsarlo: [
      'The reactions must run in a guaranteed order: with Observer the order should not matter.',
      'The flow becomes hard to follow: reading pagar() you no longer see everything that happens.',
      'Subscribers never unsubscribe: references pile up and memory leaks appear.',
    ],
    relaciones: [
      'Mediator: often uses Observer to receive notifications; Observer broadcasts, Mediator coordinates.',
      'Chain of Responsibility: one handler takes the request; in Observer everyone receives it.',
      'Command: events can be queued as commands to be processed later.',
    ],
  },
  state: {
    aka: 'State machine',
    purpose: 'Lets an object change its behavior when its internal state changes, as if it changed its class.',
    problema: 'The object behaves differently depending on its state and everything is one giant if.',
    historiaReal: 'An order goes through Pending payment, Paid, Shipped, Delivered and Cancelled. The same actions behave differently depending on the state: cancelling a pending order just voids it; cancelling a paid one voids it and refunds the money; a shipped one can no longer be cancelled.',
    dolorIngenuo: 'Every method of the order (pay, ship, cancel, deliver) is a switch on this.estado. Adding an "Out for delivery" state forces you to review every switch, and forgetting just one allows an invalid transition.',
    solucionPatron: 'Each state is a class that implements the same interface with the order\'s actions. The order delegates to its current state, and the state decides what to do and which state comes next.',
    nota: 'In languages with discriminated unions or enums with data (Rust, Kotlin, TypeScript), it is also common to model the state machine with one type per state and an exhaustive switch or match: the compiler warns you if you forget a state.',
    principiosClave: [
      'Single responsibility: each state\'s behavior lives in its own class.',
      'Open/Closed: a new state is a new class, without reviewing every switch.',
    ],
    cuandoUsarlo: [
      'An object changes its behavior depending on its state and has many states or transitions.',
      'Conditionals on the state are repeated in many methods.',
    ],
    cuandoNoUsarlo: [
      'There are two or three states with little logic: an enum and a switch are clearer.',
      'There are few transitions and they almost never change.',
    ],
    relaciones: [
      'Strategy: almost identical structure; in State the states know each other and trigger transitions, while strategies are independent and chosen by the client.',
      'Flyweight and Singleton: if the states hold no data of their own, they can be shared as single instances.',
    ],
  },
  strategy: {
    aka: 'Policy',
    purpose: 'Defines a family of interchangeable algorithms, puts each one in its own class and lets you choose which one to use at runtime.',
    problema: 'I have several ways of doing the same thing and want to pick one at runtime.',
    historiaReal: 'Your store calculates shipping differently depending on the method: a flat rate within the city, by weight for the rest of the country, with the carrier\'s table for international shipments and free during campaigns. The customer picks the method at checkout, and the business adds new ones every season.',
    dolorIngenuo: 'calcularEnvio() is a switch with every algorithm mixed together, each with its own calls to the carriers\' APIs. Testing one means preparing data for all of them, and every new method changes the same function.',
    solucionPatron: 'Each way of calculating is a strategy that implements the CalculoEnvio interface. Checkout receives the chosen strategy and delegates the calculation to it, without knowing which one it is.',
    principiosClave: [
      'Open/Closed: a new shipping method is a new strategy.',
      'Composition over inheritance: checkout has a strategy; it does not inherit from one.',
    ],
    cuandoUsarlo: [
      'There are several ways of doing the same thing and one is chosen at runtime.',
      'You want to isolate algorithms with their own details (APIs, tables, rules) from the code that uses them and test them separately.',
    ],
    cuandoNoUsarlo: [
      'There are only one or two simple algorithms that almost never change.',
      'In languages with first-class functions, passing a function is often enough instead of creating an interface and several classes.',
      'Whoever chooses cannot tell the options apart: the client has to understand the differences between strategies to pick the right one.',
    ],
    relaciones: [
      'State: same structure, but states change by themselves; the strategy is chosen by the client.',
      'Template Method: varies parts of an algorithm through inheritance; Strategy swaps the whole algorithm through composition.',
      'Decorator: adds behavior around the object; Strategy changes how it does its work inside.',
    ],
  },
  'template-method': {
    aka: 'Algorithm skeleton',
    purpose: 'Defines the skeleton of an algorithm in a base class and lets subclasses redefine some steps without changing its structure.',
    problema: 'Several processes follow the same steps and only one or two change.',
    historiaReal: 'Your HR system calculates the monthly payroll for salaried employees, interns and hourly workers. The process is always the same: calculate gross income, apply the statutory deductions, add bonuses, get the net amount and issue the payslip. What changes with the contract is how the gross amount is calculated and which bonuses apply.',
    dolorIngenuo: 'There are three almost identical 80-line functions, one per contract type. When the percentage of a statutory deduction changes, it has to be fixed in all three, and one of them always falls behind.',
    solucionPatron: 'A base class defines the template method calcularNomina() with the steps in a fixed order. The common steps are implemented only once; the ones that vary are abstract methods (the gross amount) or hooks with a default value (the bonuses) that each subclass fills in.',
    principiosClave: [
      'Hollywood principle ("don\'t call us, we\'ll call you"): the base class calls the subclasses.',
      'Don\'t repeat yourself: the common steps are written only once.',
    ],
    cuandoUsarlo: [
      'Several processes follow the same steps and only some of them change.',
      'You want to lock the order of a process and allow extending only specific points.',
    ],
    cuandoNoUsarlo: [
      'The steps vary so much that the template fills up with hooks.',
      'You need to combine variants at runtime: inheritance is rigid and Strategy fits better.',
      'A subclass needs to "switch off" a step the base takes for granted: overriding it can break what the base promises and violate the Liskov substitution principle.',
      'The template has many steps: the more there are, the harder it is to understand and maintain.',
    ],
    relaciones: [
      'Strategy: swaps the whole algorithm through composition; Template Method swaps parts through inheritance.',
      'Factory Method: it is often one of the steps of a template method.',
    ],
  },
  visitor: {
    aka: 'Double dispatch',
    purpose: 'Lets you add new operations to a class hierarchy without changing it, by separating the operations from the objects they act on.',
    problema: 'I want to add new operations to a hierarchy without changing its classes.',
    historiaReal: 'Your store sells physical products, digital ones (ebooks and courses) and subscriptions. On the cart you need several operations that treat each type differently: calculate taxes, calculate the shipping cost (digital products pay no shipping) and export the sale to accounting. Accounting and the tax team ask for new operations every few months.',
    dolorIngenuo: 'Every new operation adds a method to the three product classes: calcularImpuesto(), costoEnvio(), exportarContable()... The entities fill up with logic that does not belong to them, or the operation is written with if (producto instanceof ...) repeated all over the code.',
    solucionPatron: 'Each operation is a visitor with one method per product type (visitarFisico, visitarDigital, visitarSuscripcion). The products only implement aceptar(visitante), which calls the right method (double dispatch). A new operation is a new visitor, and the products do not change.',
    nota: 'In languages with discriminated unions and exhaustive pattern matching (TypeScript, Rust, Kotlin, modern C#), Visitor is often replaced by a switch on the product type: the compiler warns you if a case is missing, and double dispatch is not needed.',
    principiosClave: [
      'Single responsibility: each operation lives in its visitor, not in the entities.',
      'Open/Closed for operations: you add operations without touching the products.',
    ],
    cuandoUsarlo: [
      'The class hierarchy is stable, but the operations on it change often.',
      'You walk through structures with elements of different types (syntax trees, documents, carts) applying different logic to each one.',
      'You want to calculate something while walking a structure (totals, statistics): the visitor can accumulate results in its own state.',
    ],
    cuandoNoUsarlo: [
      'You add new types often: every type forces you to change every visitor.',
      'The visitors need the classes\' private data: you would have to expose it.',
    ],
    relaciones: [
      'Composite: Visitor lets you run an operation over a whole Composite tree.',
      'Iterator: they are combined to walk a structure and visit each element.',
      'Interpreter: visitors are a common way of adding operations to an expression tree.',
    ],
  },
};

export const CATEGORIAS_EN: Record<string, { label: string; desc: string; categoryLabel: string }> = {
  creacionales: { label: 'Creational', desc: 'How objects are created', categoryLabel: 'Creational patterns' },
  estructurales: { label: 'Structural', desc: 'How classes and objects are combined', categoryLabel: 'Structural patterns' },
  comportamiento: { label: 'Behavioral', desc: 'How responsibilities are divided and objects communicate', categoryLabel: 'Behavioral patterns' },
};
