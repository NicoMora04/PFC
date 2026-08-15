/*
 * ACTIVIDAD 1.1.4 - Diseño de arquitectura del sistema
 * Proyecto Final de Carrera - Aplicación móvil de voluntariado geolocalizado
 *
 * Script de una sola ejecución para Sparx Systems Enterprise Architect.
 * Crea un paquete raíz con:
 *   01 - Vista tecnológica / Arquitectura general del sistema
 *   02 - Vista funcional / Bloques funcionales y relaciones principales
 *   03 - Decisiones arquitectónicas / DA-01 a DA-07
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
        "Arquitectura cliente-servidor. Aplicación Android React Native + Expo; API REST Node.js + Express; PostgreSQL; Leaflet/OpenStreetMap; Firebase Cloud Messaging."
    );

    // Actores
    var vol = addElement(pkg, "Voluntario", "Actor", "Usuario que consulta oportunidades, se inscribe, ofrece donaciones materiales y participa en la plataforma.");
    var org = addElement(pkg, "Organización social", "Actor", "Organización que publica oportunidades, gestiona inscripciones, donaciones, reputación y estadísticas.");
    addObject(d, vol, 420, 40, 650, 105, C.gray, C.grayBorder, true, 5);
    addObject(d, org, 1050, 40, 1300, 105, C.gray, C.grayBorder, true, 5);

    // Límites visuales
    addBoundary(pkg, d, "Aplicación móvil Android - React Native + Expo", 300, 150, 1500, 560, C.blue, C.blueBorder,
        "Cliente móvil Android desarrollado con React Native y Expo.");
    addBoundary(pkg, d, "Backend - Node.js + Express", 300, 620, 1500, 905, C.green, C.greenBorder,
        "Backend monolítico modular organizado por capas y expuesto mediante API REST.");
    addBoundary(pkg, d, "Persistencia", 650, 945, 1130, 1065, C.purple, C.purpleBorder,
        "Persistencia relacional y transacciones ACID.");
    addBoundary(pkg, d, "Servicios externos", 25, 150, 250, 1065, C.orange, C.orangeBorder,
        "Integraciones externas encapsuladas mediante adaptadores.");
    addBoundary(pkg, d, "Entrega push", 1560, 150, 1790, 1065, C.orange, C.orangeBorder,
        "Canal externo de entrega y recepción de notificaciones push.");

    // Aplicación móvil
    var ui = addElement(pkg, "Pantallas, componentes y navegación por rol", "Component", "Capa de presentación móvil.");
    var state = addElement(pkg, "Estado, hooks y servicios de aplicación", "Component", "Coordinación del estado de la aplicación y casos de uso del cliente.");
    var apiClient = addElement(pkg, "Cliente HTTP de la API REST", "Component", "Consume la API mediante HTTPS y JSON e incorpora el JWT en solicitudes protegidas.");
    var token = addElement(pkg, "Almacenamiento seguro del JWT", "Component", "Persistencia segura del token de autenticación en el dispositivo.");
    var geo = addElement(pkg, "Geolocalización del dispositivo", "Component", "Obtención de ubicación aproximada con consentimiento del usuario.");
    var map = addElement(pkg, "Componente de mapas (WebView + Leaflet)", "Component", "Renderiza Leaflet dentro de una WebView y consume teselas de OpenStreetMap o proveedor compatible.");
    var push = addElement(pkg, "Recepción y presentación de notificaciones push", "Component", "Recepción y presentación de notificaciones en el dispositivo.");

    addObject(d, ui, 470, 205, 1320, 265, C.white, C.blueBorder, false, 5);
    addObject(d, state, 470, 300, 1320, 360, C.white, C.blueBorder, false, 5);
    addObject(d, apiClient, 470, 405, 830, 470, C.white, C.blueBorder, false, 5);
    addObject(d, token, 920, 405, 1320, 470, C.white, C.blueBorder, false, 5);
    addObject(d, geo, 55, 285, 220, 345, C.white, C.orangeBorder, false, 5);
    addObject(d, map, 55, 420, 220, 495, C.white, C.orangeBorder, false, 5);
    addObject(d, push, 1590, 410, 1765, 495, C.white, C.orangeBorder, false, 5);

    // Backend
    var mid = addElement(pkg, "Middlewares: JWT, roles, validación y errores", "Component", "Autenticación JWT, autorización por roles, validación de entrada y tratamiento uniforme de errores.");
    var ctrl = addElement(pkg, "Rutas y controladores REST", "Component", "Exposición HTTP sin reglas de negocio ni consultas SQL directas.");
    var serv = addElement(pkg, "Servicios y reglas de negocio", "Component", "Casos de uso y reglas de usuarios, oportunidades, inscripciones, donaciones, recomendaciones, reputación, notificaciones y estadísticas.");
    var repo = addElement(pkg, "Repositorios y transacciones", "Component", "Consultas parametrizadas, transacciones y aislamiento de PostgreSQL.");
    var modules = addElement(pkg, "Módulos funcionales", "Component", "Usuarios y organizaciones; oportunidades; inscripciones; donaciones; recomendaciones; reputación; notificaciones; estadísticas.");
    var fcmAdapter = addElement(pkg, "Adaptador de notificaciones", "Component", "Aísla la lógica de negocio de Firebase Cloud Messaging.");

    addObject(d, mid, 385, 670, 690, 735, C.white, C.greenBorder, false, 5);
    addObject(d, ctrl, 775, 670, 1080, 735, C.white, C.greenBorder, false, 5);
    addObject(d, modules, 1160, 670, 1440, 735, C.white, C.greenBorder, false, 5);
    addObject(d, serv, 385, 805, 690, 870, C.white, C.greenBorder, false, 5);
    addObject(d, repo, 775, 805, 1080, 870, C.white, C.greenBorder, false, 5);
    addObject(d, fcmAdapter, 1160, 805, 1440, 870, C.white, C.greenBorder, false, 5);

    // Persistencia e integraciones
    var db = addElement(pkg, "PostgreSQL", "Component", "Base de datos relacional con restricciones de integridad y soporte ACID para operaciones críticas.");
    var osm = addElement(pkg, "OpenStreetMap - proveedor de teselas", "Component", "Proveedor de cartografía/teselas utilizado por Leaflet o alternativa compatible.");
    var fcm = addElement(pkg, "Firebase Cloud Messaging", "Component", "Entrega de notificaciones push a dispositivos móviles.");
    addObject(d, db, 760, 980, 1020, 1040, C.white, C.purpleBorder, true, 5);
    addObject(d, osm, 45, 900, 230, 975, C.white, C.orangeBorder, false, 5);
    addObject(d, fcm, 1580, 900, 1770, 975, C.white, C.orangeBorder, false, 5);

    // Relaciones
    addAssociation(d, vol, ui, "", 8, C.grayBorder);
    addAssociation(d, org, ui, "", 8, C.grayBorder);
    addAssociation(d, ui, state, "", 8, C.blueBorder);
    addAssociation(d, state, apiClient, "", 8, C.blueBorder);
    addAssociation(d, token, apiClient, "", 8, C.blueBorder);
    addAssociation(d, geo, state, "", 8, C.orangeBorder);
    addAssociation(d, state, map, "", 8, C.blueBorder);
    addAssociation(d, map, osm, "", 8, C.orangeBorder);

    addAssociation(d, apiClient, mid, "HTTPS · JSON · JWT", 8, C.blueBorder);
    addAssociation(d, mid, ctrl, "", 8, C.greenBorder);
    addAssociation(d, ctrl, serv, "", 8, C.greenBorder);
    addAssociation(d, serv, repo, "", 8, C.greenBorder);
    addAssociation(d, repo, db, "", 8, C.purpleBorder);
    addDependency(d, serv, modules, "implementa módulos", 8, C.greenBorder);
    addAssociation(d, serv, fcmAdapter, "evento a notificar", 8, C.greenBorder);
    addAssociation(d, fcmAdapter, fcm, "", 8, C.orangeBorder);
    addAssociation(d, fcm, push, "", 8, C.orangeBorder);

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
        "Vista funcional de alto nivel: acceso, oportunidades/geolocalización, participación/reputación, donaciones y servicios de apoyo."
    );

    var vol = addElement(pkg, "Voluntario", "Actor", "Actor voluntario/donante.");
    var org = addElement(pkg, "Organización social", "Actor", "Actor organización.");
    var app = addElement(pkg, "Aplicación móvil - React Native + Expo", "Component", "Cliente móvil Android.");
    var api = addElement(pkg, "API REST - Node.js + Express", "Component", "Punto de entrada HTTP del backend.");
    var sec = addElement(pkg, "Autenticación y autorización - JWT, roles y validación", "Component", "Acceso seguro y validación de solicitudes.");
    var serv = addElement(pkg, "Servicios de negocio - casos de uso y reglas", "Component", "Coordina los módulos funcionales.");

    addObject(d, vol, 250, 40, 500, 105, C.gray, C.grayBorder, true, 5);
    addObject(d, org, 1300, 40, 1550, 105, C.gray, C.grayBorder, true, 5);
    addObject(d, app, 500, 155, 820, 225, C.blue, C.blueBorder, true, 5);
    addObject(d, api, 980, 155, 1300, 225, C.green, C.greenBorder, true, 5);
    addObject(d, sec, 690, 285, 1110, 350, C.green, C.greenBorder, false, 5);
    addObject(d, serv, 690, 410, 1110, 475, C.green, C.greenBorder, false, 5);

    addBoundary(pkg, d, "Bloques funcionales", 220, 525, 1580, 930, C.blue, C.blueBorder,
        "Módulos funcionales con reglas y servicios separados, compartiendo infraestructura técnica.");

    var ident = addElement(pkg, "Acceso, perfiles y organizaciones - RF-01, RF-02, RF-03, RF-16", "Component",
        "Registro, inicio de sesión, roles, perfil de organización, CUIT, verificación y búsqueda de organizaciones.");
    var oportun = addElement(pkg, "Oportunidades y geolocalización - RF-04, RF-05, RF-06", "Component",
        "Publicación, consulta, filtros, ubicaciones y visualización cartográfica.");
    var part = addElement(pkg, "Inscripciones, seguimiento y reputación - RF-07, RF-08, RF-10", "Component",
        "Cupos, prevención de duplicados, estados de participación y calificaciones vinculadas con participaciones válidas.");
    var don = addElement(pkg, "Donaciones materiales - RF-13, RF-14, RF-15", "Component",
        "Ofrecimientos no monetarios y transiciones de estado: pendiente, aceptado, rechazado, coordinado y recibido.");
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
    var notif = addElement(pkg, "Adaptador de notificaciones", "Component", "Aísla el canal de entrega push.");
    var fcm = addElement(pkg, "Firebase Cloud Messaging", "Component", "Entrega push al dispositivo.");

    addObject(d, maps, 80, 995, 410, 1065, C.orange, C.orangeBorder, false, 5);
    addObject(d, data, 550, 995, 940, 1065, C.purple, C.purpleBorder, false, 5);
    addObject(d, db, 1030, 995, 1280, 1065, C.purple, C.purpleBorder, true, 5);
    addObject(d, notif, 1390, 985, 1690, 1055, C.orange, C.orangeBorder, false, 5);
    addObject(d, fcm, 1390, 1110, 1690, 1180, C.orange, C.orangeBorder, false, 5);

    addAssociation(d, vol, app, "", 8, C.grayBorder);
    addAssociation(d, org, app, "", 8, C.grayBorder);
    addAssociation(d, app, api, "HTTPS · JSON · JWT", 8, C.blueBorder);
    addAssociation(d, api, sec, "", 8, C.greenBorder);
    addAssociation(d, sec, serv, "", 8, C.greenBorder);

    addAssociation(d, serv, ident, "", 8, C.greenBorder);
    addAssociation(d, serv, oportun, "", 8, C.greenBorder);
    addAssociation(d, serv, part, "", 8, C.greenBorder);
    addAssociation(d, serv, don, "", 8, C.greenBorder);
    addAssociation(d, serv, apoyo, "", 8, C.greenBorder);

    addDependency(d, part, oportun, "valida oportunidad y cupo", 8, C.blueBorder);
    addDependency(d, apoyo, oportun, "usa oportunidades y participación", 8, C.blueBorder);
    addDependency(d, apoyo, part, "usa participación", 8, C.blueBorder);
    addDependency(d, apoyo, don, "resume donaciones", 8, C.blueBorder);

    addAssociation(d, serv, data, "", 8, C.purpleBorder);
    addAssociation(d, data, db, "", 8, C.purpleBorder);
    addAssociation(d, app, maps, "", 8, C.orangeBorder);
    addDependency(d, oportun, maps, "ubicaciones y distancias", 8, C.orangeBorder);
    addAssociation(d, apoyo, notif, "envía notificación", 8, C.orangeBorder);
    addAssociation(d, notif, fcm, "", 8, C.orangeBorder);

    d.Update();
    return d;
}

function buildDecisionsView(root) {
    var pkg = addPackage(
        root,
        "03 - Decisiones arquitectónicas",
        "Decisiones DA-01 a DA-07 documentadas en la Actividad 1.1.4."
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
        ["DA-05 · Adapter", "Leaflet/OSM y FCM se integran mediante componentes sustituibles que aíslan dependencias externas."],
        ["DA-06 · JWT y roles", "La API mantiene sesiones sin estado y aplica autorización diferenciada para voluntario y organización."],
        ["DA-07 · Transacciones ACID", "Inscripciones, cupos y cambios críticos se ejecutan de forma atómica para evitar estados parciales."]
    ];

    var positions = [
        [180, 90, 820, 210], [980, 90, 1620, 210],
        [180, 280, 820, 400], [980, 280, 1620, 400],
        [180, 470, 820, 590], [980, 470, 1620, 590],
        [580, 680, 1220, 800]
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
            "Actividad 1.1.4 del Incremento 1. Arquitectura cliente-servidor con backend monolítico modular por capas. Documento oficial complementario: Diseño de arquitectura del sistema."
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
