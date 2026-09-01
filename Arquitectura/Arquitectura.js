/*
 * ACTIVIDAD 1.1.4 - Diseño de arquitectura del sistema
 * Proyecto Final de Carrera - Aplicación móvil de voluntariado geolocalizado
 *
 * Script de una sola ejecución para Sparx Systems Enterprise Architect.
 * Crea un paquete raíz con:
 *   01 - Vista tecnológica / Arquitectura general del sistema
 *   02 - Vista funcional / Bloques funcionales y relaciones principales
 *   03 - Decisiones arquitectónicas / DA-01 a DA-09
 *
 * Fuente: documento de la Actividad 1.1.4 y diagramas Mermaid entregados.
 * El script NO borra ni reemplaza contenido existente. Si detecta el paquete raíz,
 * se detiene para evitar duplicados.
 */

var ROOT_NAME = "Actividad 1.1.4 - Diseño de arquitectura del sistema";
var AUTHOR = "Jonas, Andrés; Mora, Nicolás";

function rgb(r, g, b) {
    return r + (g * 256) + (b * 65536);
}

var C = {
    white: rgb(255, 255, 255),
    text: rgb(31, 31, 31),
    gray: rgb(242, 242, 242),
    grayBorder: rgb(127, 127, 127),
    blue: rgb(221, 235, 247),
    blueBorder: rgb(47, 84, 150),
    green: rgb(226, 239, 218),
    greenBorder: rgb(84, 130, 53),
    purple: rgb(234, 228, 244),
    purpleBorder: rgb(112, 88, 145),
    orange: rgb(252, 228, 214),
    orangeBorder: rgb(198, 89, 17),
    yellow: rgb(255, 242, 204),
    yellowBorder: rgb(191, 143, 0)
};

function out(text) {
    Session.Output(text);
}

function findChildPackage(parentPkg, name) {
    parentPkg.Packages.Refresh();
    for (var i = 0; i < parentPkg.Packages.Count; i++) {
        var p = parentPkg.Packages.GetAt(i);
        if (p.Name == name) return p;
    }
    return null;
}

function addPackage(parentPkg, name, notes) {
    var p = parentPkg.Packages.AddNew(name, "");
    p.Notes = notes || "";
    if (!p.Update()) throw new Error("No se pudo crear el paquete: " + name + " - " + p.GetLastError());
    parentPkg.Packages.Refresh();
    try {
        p.Element.Author = AUTHOR;
        p.Element.Update();
    } catch (ignore) {}
    return p;
}

function addElement(pkg, name, type, notes) {
    var e = pkg.Elements.AddNew(name, type);
    e.Author = AUTHOR;
    e.Notes = notes || "";
    if (!e.Update()) throw new Error("No se pudo crear el elemento: " + name + " - " + e.GetLastError());
    pkg.Elements.Refresh();
    return e;
}

function addDiagram(pkg, name, notes) {
    var d = pkg.Diagrams.AddNew(name, "Component");
    d.Author = AUTHOR;
    d.Notes = notes || "";
    d.cx = 1800;
    d.cy = 1250;
    if (!d.Update()) throw new Error("No se pudo crear el diagrama: " + name + " - " + d.GetLastError());
    pkg.Diagrams.Refresh();
    return d;
}

function addObject(diagram, element, l, t, r, b, bg, border, bold, sequence) {
    var style = "l=" + l + ";r=" + r + ";t=" + t + ";b=" + b + ";";
    var o = diagram.DiagramObjects.AddNew(style, "");
    o.ElementID = element.ElementID;
    o.BackgroundColor = (bg === undefined ? C.white : bg);
    o.BorderColor = (border === undefined ? C.grayBorder : border);
    o.FontColor = C.text;
    o.FontName = "Segoe UI";
    o.FontSize = "9";
    o.FontBold = !!bold;
    o.BorderLineWidth = 1;
    o.Sequence = (sequence === undefined ? 10 : sequence);
    if (!o.Update()) throw new Error("No se pudo colocar en el diagrama: " + element.Name + " - " + o.GetLastError());
    diagram.DiagramObjects.Refresh();
    return o;
}

function addBoundary(pkg, diagram, name, l, t, r, b, bg, border, notes) {
    var e = addElement(pkg, name, "Boundary", notes || "");
    addObject(diagram, e, l, t, r, b, bg, border, true, 200);
    return e;
}

function addAssociation(diagram, source, target, name, lineStyle, lineColor) {
    var c = source.Connectors.AddNew(name || "", "Association");
    c.SupplierID = target.ElementID;
    c.Direction = "Source -> Destination";
    if (!c.Update()) throw new Error("No se pudo crear la relación " + source.Name + " -> " + target.Name + " - " + c.GetLastError());
    try {
        c.ClientEnd.Navigable = "Non-Navigable";
        c.SupplierEnd.Navigable = "Navigable";
        c.ClientEnd.Update();
        c.SupplierEnd.Update();
        c.Update();
    } catch (ignore) {}
    source.Connectors.Refresh();

    var dl = diagram.DiagramLinks.AddNew("", "");
    dl.ConnectorID = c.ConnectorID;
    dl.DiagramID = diagram.DiagramID;
    dl.LineStyle = (lineStyle === undefined ? 8 : lineStyle); // Orthogonal Square
    dl.LineWidth = 1;
    if (lineColor !== undefined) dl.LineColor = lineColor;
    dl.HiddenLabels = false;
    if (!dl.Update()) throw new Error("No se pudo dibujar la relación: " + c.GetLastError());
    diagram.DiagramLinks.Refresh();
    return c;
}

function addDependency(diagram, source, target, name, lineStyle, lineColor) {
    var c = source.Connectors.AddNew(name || "", "Dependency");
    c.SupplierID = target.ElementID;
    c.Direction = "Source -> Destination";
    if (!c.Update()) throw new Error("No se pudo crear la dependencia " + source.Name + " -> " + target.Name + " - " + c.GetLastError());
    source.Connectors.Refresh();

    var dl = diagram.DiagramLinks.AddNew("", "");
    dl.ConnectorID = c.ConnectorID;
    dl.DiagramID = diagram.DiagramID;
    dl.LineStyle = (lineStyle === undefined ? 8 : lineStyle);
    dl.LineWidth = 1;
    if (lineColor !== undefined) dl.LineColor = lineColor;
    dl.HiddenLabels = false;
    if (!dl.Update()) throw new Error("No se pudo dibujar la dependencia: " + c.GetLastError());
    diagram.DiagramLinks.Refresh();
    return c;
}

function buildTechnologyView(root) {
    var pkg = addPackage(
        root,
        "01 - Vista tecnológica",
        "Vista cliente-servidor del prototipo. Separa cliente móvil, backend monolítico modular, persistencia e integraciones externas."
    );
    var d = addDiagram(
        pkg,
        "01 - Arquitectura general del sistema",
        "Arquitectura cliente-servidor. Aplicación Android React Native + Expo; API REST Node.js + Express; PostgreSQL; almacenamiento de imágenes; Leaflet/OpenStreetMap; Firebase Cloud Messaging; Nodemailer y SMTP."
    );
    d.cx = 1800;
    d.cy = 1250;
    d.Update();

    // Actores
    var vol = addElement(pkg, "Voluntario", "Actor", "Usuario que consulta oportunidades, se inscribe, ofrece donaciones materiales y participa en la plataforma.");
    var org = addElement(pkg, "Organización social", "Actor", "Organización que publica oportunidades, gestiona inscripciones, donaciones, reputación y estadísticas.");
    var admin = addElement(pkg, "Administrador - rol ADMIN", "Actor", "Usuario con rol ADMIN que verifica organizaciones, bloquea o rehabilita cuentas y consulta estadísticas globales.");
    addObject(d, vol, 330, 40, 540, 105, C.gray, C.grayBorder, true, 5);
    addObject(d, org, 790, 40, 1040, 105, C.gray, C.grayBorder, true, 5);
    addObject(d, admin, 1260, 40, 1480, 105, C.gray, C.grayBorder, true, 5);

    // Límites visuales
    addBoundary(pkg, d, "Aplicación móvil Android - React Native + Expo", 300, 150, 1500, 560, C.blue, C.blueBorder,
        "Cliente móvil Android desarrollado con React Native y Expo.");
    addBoundary(pkg, d, "Backend - Node.js + Express", 300, 620, 1500, 1030, C.green, C.greenBorder,
        "Backend monolítico modular organizado por capas y expuesto mediante API REST.");
    addBoundary(pkg, d, "Persistencia propia", 300, 1060, 1500, 1220, C.purple, C.purpleBorder,
        "Persistencia relacional y almacenamiento separado de archivos de imagen.");
    addBoundary(pkg, d, "Servicios cartográficos externos", 25, 150, 250, 1220, C.orange, C.orangeBorder,
        "Proveedor cartográfico externo utilizado por Leaflet.");
    addBoundary(pkg, d, "Servicios de mensajería externos", 1560, 150, 1790, 1220, C.orange, C.orangeBorder,
        "Entrega externa de notificaciones push y correos electrónicos.");

    // Aplicación móvil
    var ui = addElement(pkg, "Pantallas, componentes y navegación por rol", "Component", "Capa de presentación móvil diferenciada para VOLUNTARIO, ORGANIZACION y ADMIN.");
    var state = addElement(pkg, "Estado, hooks y servicios de aplicación", "Component", "Coordinación del estado de la aplicación y casos de uso del cliente.");
    var apiClient = addElement(pkg, "Cliente HTTP de la API REST", "Component", "Consume la API mediante HTTPS, JSON o multipart/form-data e incorpora el JWT en solicitudes protegidas.");
    var token = addElement(pkg, "Almacenamiento seguro del JWT - expo-secure-store", "Component", "Persistencia cifrada del token de autenticación en el dispositivo.");
    var geo = addElement(pkg, "Geolocalización del dispositivo", "Component", "Obtención de ubicación aproximada con consentimiento del usuario.");
    var map = addElement(pkg, "Componente de mapas (WebView + Leaflet)", "Component", "Renderiza Leaflet dentro de una WebView y consume teselas de OpenStreetMap o proveedor compatible.");
    var push = addElement(pkg, "Recepción y presentación de notificaciones - expo-notifications", "Component", "Recepción, administración y presentación de notificaciones push en el dispositivo.");

    addObject(d, ui, 470, 205, 1320, 265, C.white, C.blueBorder, false, 5);
    addObject(d, state, 470, 300, 1320, 360, C.white, C.blueBorder, false, 5);
    addObject(d, apiClient, 470, 405, 830, 470, C.white, C.blueBorder, false, 5);
    addObject(d, token, 920, 405, 1320, 470, C.white, C.blueBorder, false, 5);
    addObject(d, geo, 55, 285, 220, 345, C.white, C.orangeBorder, false, 5);
    addObject(d, map, 55, 420, 220, 495, C.white, C.orangeBorder, false, 5);
    addObject(d, push, 1590, 410, 1765, 495, C.white, C.orangeBorder, false, 5);

    // Backend e integraciones propias
    var mid = addElement(pkg, "Middlewares: JWT, roles, validación y errores", "Component", "Autenticación JWT, autorización por roles, validación de entrada y tratamiento uniforme de errores.");
    var ctrl = addElement(pkg, "Rutas y controladores REST", "Component", "Exposición HTTP sin reglas de negocio ni consultas SQL directas.");
    var serv = addElement(pkg, "Servicios y reglas de negocio", "Component", "Casos de uso y reglas de acceso, recuperación de contraseña, usuarios, oportunidades, inscripciones, donaciones, recomendaciones, reputación, notificaciones y estadísticas.");
    var repo = addElement(pkg, "Repositorios y transacciones", "Component", "Consultas parametrizadas, transacciones y aislamiento de PostgreSQL.");
    var modules = addElement(pkg, "Módulos funcionales", "Component", "Acceso y recuperación; usuarios y organizaciones; oportunidades; inscripciones; donaciones; recomendaciones; reputación; notificaciones; estadísticas.");
    var fcmAdapter = addElement(pkg, "Adaptador de notificaciones", "Component", "Aísla la lógica de negocio de Firebase Cloud Messaging.");
    var mailAdapter = addElement(pkg, "Adaptador de correo - Nodemailer", "Component", "Encapsula la configuración y el envío de correos mediante Nodemailer.");
    var multer = addElement(pkg, "Carga y validación de imágenes - Multer", "Component", "Procesa multipart/form-data, valida el tipo y tamaño de la imagen y proporciona su referencia al controlador.");

    addObject(d, mid, 700, 650, 1100, 710, C.white, C.greenBorder, false, 5);
    addObject(d, ctrl, 700, 745, 1100, 805, C.white, C.greenBorder, false, 5);
    addObject(d, multer, 350, 745, 620, 815, C.white, C.greenBorder, false, 5);
    addObject(d, serv, 700, 840, 1100, 900, C.white, C.greenBorder, false, 5);
    addObject(d, modules, 350, 840, 620, 900, C.white, C.greenBorder, false, 5);
    addObject(d, fcmAdapter, 1180, 840, 1460, 900, C.white, C.greenBorder, false, 5);
    addObject(d, repo, 700, 935, 1100, 995, C.white, C.greenBorder, false, 5);
    addObject(d, mailAdapter, 1180, 935, 1460, 995, C.white, C.greenBorder, false, 5);

    // Persistencia e integraciones
    var db = addElement(pkg, "PostgreSQL", "Component", "Base de datos relacional con restricciones de integridad y soporte ACID para operaciones críticas.");
    var imageStorage = addElement(pkg, "Almacenamiento de imágenes del prototipo", "Component", "Conserva archivos de imagen fuera de PostgreSQL; la base de datos registra únicamente imagen_url.");
    var osm = addElement(pkg, "OpenStreetMap - proveedor de teselas", "Component", "Proveedor de cartografía/teselas utilizado por Leaflet o alternativa compatible.");
    var fcm = addElement(pkg, "Firebase Cloud Messaging", "Component", "Entrega de notificaciones push a dispositivos móviles.");
    var smtp = addElement(pkg, "Servidor SMTP configurable", "Component", "Canal externo utilizado exclusivamente para entregar correos con enlaces temporales de recuperación.");
    addObject(d, imageStorage, 390, 1100, 680, 1170, C.white, C.purpleBorder, false, 5);
    addObject(d, db, 760, 1100, 1040, 1170, C.white, C.purpleBorder, true, 5);
    addObject(d, osm, 45, 1080, 230, 1155, C.white, C.orangeBorder, false, 5);
    addObject(d, fcm, 1580, 830, 1770, 900, C.white, C.orangeBorder, false, 5);
    addObject(d, smtp, 1580, 935, 1770, 1005, C.white, C.orangeBorder, false, 5);

    // Relaciones
    addAssociation(d, vol, ui, "utiliza interfaz de voluntario", 8, C.grayBorder);
    addAssociation(d, org, ui, "utiliza interfaz de organización", 8, C.grayBorder);
    addAssociation(d, admin, ui, "utiliza interfaz administrativa", 8, C.grayBorder);
    addAssociation(d, ui, state, "gestiona interacción", 8, C.blueBorder);
    addAssociation(d, state, apiClient, "solicita operaciones", 8, C.blueBorder);
    addAssociation(d, token, apiClient, "proporciona JWT", 8, C.blueBorder);
    addAssociation(d, geo, state, "proporciona ubicación", 8, C.orangeBorder);
    addAssociation(d, state, map, "solicita visualización", 8, C.blueBorder);
    addAssociation(d, map, osm, "solicita teselas", 8, C.orangeBorder);

    addAssociation(d, apiClient, mid, "HTTPS · JSON/multipart · JWT", 8, C.blueBorder);
    addAssociation(d, mid, ctrl, "autoriza y valida solicitud", 8, C.greenBorder);
    addAssociation(d, ctrl, serv, "invoca caso de uso con datos validados", 8, C.greenBorder);
    addAssociation(d, serv, repo, "solicita consulta o persistencia", 8, C.greenBorder);
    addAssociation(d, repo, db, "lee y escribe datos e imagen_url", 8, C.purpleBorder);
    addDependency(d, serv, modules, "implementa módulos", 8, C.greenBorder);
    addAssociation(d, ctrl, multer, "utiliza para procesar multipart/form-data", 8, C.greenBorder);
    addAssociation(d, multer, imageStorage, "guarda imagen validada", 8, C.purpleBorder);
    addAssociation(d, serv, fcmAdapter, "genera evento de notificación", 8, C.greenBorder);
    addAssociation(d, fcmAdapter, fcm, "solicita envío de notificación push", 8, C.orangeBorder);
    addAssociation(d, fcm, push, "entrega notificación push", 8, C.orangeBorder);
    addAssociation(d, serv, mailAdapter, "solicita envío de enlace temporal", 8, C.greenBorder);
    addAssociation(d, mailAdapter, smtp, "envía correo mediante SMTP", 8, C.orangeBorder);

    d.Update();
    return d;
}

function buildFunctionalView(root) {
    var pkg = addPackage(
        root,
        "02 - Vista funcional",
        "Bloques funcionales derivados de los grupos de requerimientos de la actividad 1.1.4."
    );
    var d = addDiagram(
        pkg,
        "02 - Bloques funcionales y relaciones principales",
        "Vista funcional de alto nivel: acceso y recuperación, oportunidades/geolocalización, participación/reputación, donaciones, administración y servicios de apoyo."
    );
    d.cx = 1800;
    d.cy = 1320;
    d.Update();

    var vol = addElement(pkg, "Voluntario", "Actor", "Actor voluntario/donante.");
    var org = addElement(pkg, "Organización social", "Actor", "Actor organización.");
    var admin = addElement(pkg, "Administrador - rol ADMIN", "Actor", "Actor autorizado para verificar organizaciones, administrar cuentas y consultar estadísticas globales.");
    var app = addElement(pkg, "Aplicación móvil - React Native + Expo", "Component", "Cliente móvil Android.");
    var api = addElement(pkg, "API REST - Node.js + Express", "Component", "Punto de entrada HTTP del backend.");
    var sec = addElement(pkg, "Autenticación y autorización - JWT, roles y validación", "Component", "Acceso seguro y autorización diferenciada para VOLUNTARIO, ORGANIZACION y ADMIN.");
    var serv = addElement(pkg, "Servicios de negocio - casos de uso y reglas", "Component", "Coordina los módulos funcionales.");

    addObject(d, vol, 250, 40, 470, 105, C.gray, C.grayBorder, true, 5);
    addObject(d, org, 790, 40, 1040, 105, C.gray, C.grayBorder, true, 5);
    addObject(d, admin, 1330, 40, 1560, 105, C.gray, C.grayBorder, true, 5);
    addObject(d, app, 500, 155, 820, 225, C.blue, C.blueBorder, true, 5);
    addObject(d, api, 980, 155, 1300, 225, C.green, C.greenBorder, true, 5);
    addObject(d, sec, 690, 285, 1110, 350, C.green, C.greenBorder, false, 5);
    addObject(d, serv, 690, 410, 1110, 475, C.green, C.greenBorder, false, 5);

    addBoundary(pkg, d, "Bloques funcionales", 220, 525, 1580, 930, C.blue, C.blueBorder,
        "Módulos funcionales con reglas y servicios separados, compartiendo infraestructura técnica.");
    addBoundary(pkg, d, "Infraestructura técnica compartida", 20, 960, 1780, 1240, C.gray, C.grayBorder,
        "Servicios técnicos externos y mecanismos de persistencia utilizados por los módulos funcionales.");

    var ident = addElement(pkg, "Acceso, recuperación, perfiles y organizaciones - RF-01, RF-02, RF-03, RF-16", "Component",
        "Registro, inicio de sesión, recuperación de contraseña, roles, perfiles, CUIT, verificación y búsqueda de organizaciones.");
    var oportun = addElement(pkg, "Oportunidades y geolocalización - RF-04, RF-05, RF-06", "Component",
        "Publicación, consulta, filtros, ubicaciones y visualización cartográfica.");
    var part = addElement(pkg, "Inscripciones, seguimiento y reputación - RF-07, RF-08, RF-10", "Component",
        "Cupos, prevención de duplicados, estados de participación y calificaciones vinculadas con participaciones válidas.");
    var don = addElement(pkg, "Donaciones materiales - RF-13, RF-14, RF-15", "Component",
        "Ofrecimientos no monetarios, imagen opcional y transiciones de estado: pendiente, aceptado, rechazado, coordinado y recibido.");
    var apoyo = addElement(pkg, "Recomendaciones, notificaciones y estadísticas - RF-09, RF-11, RF-12", "Component",
        "Reglas simples de recomendación, eventos de notificación y estadísticas básicas.");

    addObject(d, ident, 300, 585, 800, 660, C.white, C.blueBorder, false, 5);
    addObject(d, oportun, 1000, 585, 1500, 660, C.white, C.blueBorder, false, 5);
    addObject(d, part, 300, 725, 800, 800, C.white, C.blueBorder, false, 5);
    addObject(d, don, 1000, 725, 1500, 800, C.white, C.blueBorder, false, 5);
    addObject(d, apoyo, 600, 840, 1200, 905, C.white, C.blueBorder, false, 5);

    var data = addElement(pkg, "Repositorios, consultas parametrizadas y transacciones", "Component", "Acceso a datos y transacciones.");
    var db = addElement(pkg, "PostgreSQL", "Component", "Persistencia relacional.");
    var maps = addElement(pkg, "Mapas - WebView + Leaflet + OSM", "Component", "Integración cartográfica y representación de ubicaciones.");
    var mail = addElement(pkg, "Servicio de correo - Nodemailer + SMTP", "Component", "Apoyo técnico para entregar enlaces temporales de recuperación de contraseña.");
    var images = addElement(pkg, "Carga y almacenamiento de imágenes - Multer", "Component", "Apoyo técnico para validar y almacenar la imagen opcional de una donación fuera de PostgreSQL.");
    var notif = addElement(pkg, "Adaptador de notificaciones", "Component", "Aísla el canal de entrega push.");
    var fcm = addElement(pkg, "Firebase Cloud Messaging", "Component", "Entrega push al dispositivo.");

    addObject(d, maps, 40, 995, 340, 1065, C.orange, C.orangeBorder, false, 5);
    addObject(d, mail, 375, 995, 690, 1065, C.orange, C.orangeBorder, false, 5);
    addObject(d, data, 730, 995, 1080, 1065, C.purple, C.purpleBorder, false, 5);
    addObject(d, images, 1120, 995, 1450, 1065, C.purple, C.purpleBorder, false, 5);
    addObject(d, notif, 1490, 995, 1770, 1065, C.orange, C.orangeBorder, false, 5);
    addObject(d, db, 780, 1130, 1030, 1200, C.purple, C.purpleBorder, true, 5);
    addObject(d, fcm, 1490, 1130, 1770, 1200, C.orange, C.orangeBorder, false, 5);

    addAssociation(d, vol, app, "utiliza la aplicación", 8, C.grayBorder);
    addAssociation(d, org, app, "utiliza la aplicación", 8, C.grayBorder);
    addAssociation(d, admin, app, "utiliza la aplicación", 8, C.grayBorder);
    addAssociation(d, app, api, "HTTPS · JSON · JWT", 8, C.blueBorder);
    addAssociation(d, api, sec, "envía solicitud", 8, C.greenBorder);
    addAssociation(d, sec, serv, "autoriza e invoca", 8, C.greenBorder);

    addAssociation(d, serv, ident, "coordina acceso y administración", 8, C.greenBorder);
    addAssociation(d, serv, oportun, "coordina oportunidades", 8, C.greenBorder);
    addAssociation(d, serv, part, "coordina participación", 8, C.greenBorder);
    addAssociation(d, serv, don, "coordina donaciones", 8, C.greenBorder);
    addAssociation(d, serv, apoyo, "coordina servicios de apoyo", 8, C.greenBorder);

    addDependency(d, part, oportun, "valida oportunidad y cupo", 8, C.blueBorder);
    addDependency(d, apoyo, oportun, "usa oportunidades y participación", 8, C.blueBorder);
    addDependency(d, apoyo, part, "usa participación", 8, C.blueBorder);
    addDependency(d, apoyo, don, "resume donaciones", 8, C.blueBorder);

    addAssociation(d, serv, data, "solicita consulta o persistencia", 8, C.purpleBorder);
    addAssociation(d, data, db, "lee y escribe datos", 8, C.purpleBorder);
    addAssociation(d, app, maps, "presenta mapas", 8, C.orangeBorder);
    addDependency(d, oportun, maps, "ubicaciones y distancias", 8, C.orangeBorder);
    addAssociation(d, ident, mail, "utiliza para recuperación de contraseña", 8, C.orangeBorder);
    addAssociation(d, don, images, "utiliza para gestionar la imagen opcional", 8, C.purpleBorder);
    addAssociation(d, apoyo, notif, "genera evento de notificación", 8, C.orangeBorder);
    addAssociation(d, notif, fcm, "solicita envío de notificación push", 8, C.orangeBorder);

    d.Update();
    return d;
}

function buildDecisionsView(root) {
    var pkg = addPackage(
        root,
        "03 - Decisiones arquitectónicas",
        "Decisiones DA-01 a DA-09 documentadas en la Actividad 1.1.4."
    );
    var d = addDiagram(
        pkg,
        "03 - Decisiones arquitectónicas adoptadas",
        "Resumen visual de las decisiones arquitectónicas adoptadas y su consecuencia principal."
    );

    var decisions = [
        ["DA-01 · Cliente-servidor", "El cliente móvil se desacopla de la persistencia y consume una API REST centralizada."],
        ["DA-02 · Monolito modular", "Permite un único despliegue y pruebas simples, manteniendo separación por módulos. No se adoptan microservicios en el prototipo."],
        ["DA-03 · Arquitectura por capas", "Reduce acoplamiento: controladores, servicios y repositorios poseen responsabilidades diferentes."],
        ["DA-04 · Patrón Repository", "Las consultas PostgreSQL quedan encapsuladas y no se distribuyen entre controladores o servicios."],
        ["DA-05 · Adapter", "Mapas, notificaciones y correo se integran mediante adaptadores que aíslan los detalles tecnológicos respecto de las reglas de negocio."],
        ["DA-06 · JWT y roles", "La API mantiene sesiones sin estado y aplica autorización diferenciada para voluntario, organización y administrador."],
        ["DA-07 · Transacciones ACID", "Inscripciones, cupos y cambios críticos se ejecutan de forma atómica para evitar estados parciales."],
        ["DA-08 · Recuperación mediante token y correo SMTP", "El backend genera tokens temporales y utiliza Nodemailer con SMTP solamente como canal de entrega, manteniendo la autenticación propia mediante JWT, bcrypt y PostgreSQL."],
        ["DA-09 · Imágenes almacenadas fuera de PostgreSQL", "Multer recibe y valida las imágenes; el backend conserva los archivos separadamente y PostgreSQL registra únicamente imagen_url."]
    ];

    var positions = [
        [90, 90, 610, 230], [640, 90, 1160, 230], [1190, 90, 1710, 230],
        [90, 310, 610, 450], [640, 310, 1160, 450], [1190, 310, 1710, 450],
        [90, 530, 610, 670], [640, 530, 1160, 670], [1190, 530, 1710, 670]
    ];

    for (var i = 0; i < decisions.length; i++) {
        var e = addElement(pkg, decisions[i][0], "Requirement", decisions[i][1]);
        addObject(d, e,
            positions[i][0], positions[i][1], positions[i][2], positions[i][3],
            C.yellow, C.yellowBorder, true, 5);
    }

    d.Update();
    return d;
}

function main() {
    out("=== Actividad 1.1.4 - Traspaso a Enterprise Architect ===");
    out("Seleccione en el Browser el paquete/modelo donde desea crear la arquitectura.");

    var parent = Repository.GetTreeSelectedPackage();
    if (parent == null) {
        out("ERROR: No se pudo obtener un paquete seleccionado en el Browser.");
        return;
    }

    if (findChildPackage(parent, ROOT_NAME) != null) {
        out("ABORTADO: ya existe un paquete llamado '" + ROOT_NAME + "' dentro de '" + parent.Name + "'.");
        out("El script no elimina ni reemplaza contenido para evitar pérdidas. Renombre o elimine manualmente el paquete anterior si desea reconstruirlo.");
        return;
    }

    Repository.EnableUIUpdates = false;
    Repository.BatchAppend = true;

    var root = null;
    var techDiagram = null;
    try {
        root = addPackage(
            parent,
            ROOT_NAME,
            "Actividad 1.1.4 del Incremento 1. Arquitectura cliente-servidor con backend monolítico modular por capas, roles VOLUNTARIO/ORGANIZACION/ADMIN, recuperación por correo SMTP y almacenamiento separado de imágenes. Documento oficial complementario: Diseño de arquitectura del sistema."
        );

        techDiagram = buildTechnologyView(root);
        buildFunctionalView(root);
        buildDecisionsView(root);

        out("Creación completada correctamente.");
        out("Paquete raíz: " + ROOT_NAME);
        out("Diagramas creados:");
        out("  1) 01 - Arquitectura general del sistema");
        out("  2) 02 - Bloques funcionales y relaciones principales");
        out("  3) 03 - Decisiones arquitectónicas adoptadas");
        out("Los archivos .mmd dejan de ser necesarios como fuente editable una vez validado el modelo en EA.");
    } catch (ex) {
        var msg = "";
        try { msg = ex.message; } catch (ignore1) {}
        if (!msg) {
            try { msg = ex.description; } catch (ignore2) {}
        }
        out("ERROR durante la creación: " + msg);
        out("No se eliminó automáticamente lo ya creado. Revise el paquete parcial antes de volver a ejecutar el script.");
    } finally {
        Repository.BatchAppend = false;
        Repository.EnableUIUpdates = true;
        Repository.RefreshModelView(parent.PackageID);
    }

    if (techDiagram != null) {
        try {
            Repository.OpenDiagram(techDiagram.DiagramID);
            Repository.ReloadDiagram(techDiagram.DiagramID);
        } catch (ignore3) {}
    }
}

main();
