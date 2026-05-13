// =============================================================================
//  BUSCADOR INTELIGENTE — Backend Google Apps Script
//  Sistema SaaS con gestión de suscripciones, vencimiento y API de administración
// =============================================================================

// ---------------------------------------------------------------------------
// CONFIGURACIÓN GLOBAL
// ---------------------------------------------------------------------------
var CONFIG = {
  SHEET_NAME   : "Reglamento",
  COL_CAPITULO : 1,   // A
  COL_ARTICULO : 2,   // B
  COL_TITULO   : 3,   // C
  COL_CONTENIDO: 4,   // D
  COL_POPULAR  : 5,   // E — Popularidad (se crea automáticamente)

  KEYS_SHEET   : "API_Keys",

  // Columnas de la hoja API_Keys
  KC_NUMERO    : 1,   // A — N°
  KC_CLAVE     : 2,   // B — API Key
  KC_NOMBRE    : 3,   // C — Nombre del cliente
  KC_EMAIL     : 4,   // D — Email
  KC_ESTADO    : 5,   // E — Activa / Inactiva / Disponible
  KC_ALTA      : 6,   // F — Fecha de alta
  KC_VENCE     : 7,   // G — Fecha de vencimiento
  KC_MESES     : 8,   // H — Meses contratados

  // Pesos del algoritmo de relevancia
  PESO_TITULO_EXACTO  : 100,
  PESO_TITULO_PARCIAL :  50,
  PESO_CONTENIDO      :  10,
  PESO_POPULARIDAD    :   2,

  MAX_RESULTADOS  : 20,
  MIN_CHARS_QUERY :  3,
};

// ---------------------------------------------------------------------------
// STOP WORDS
// ---------------------------------------------------------------------------
var STOP_WORDS = new Set([
  "de","del","la","las","el","los","un","una","unos","unas",
  "en","con","por","para","que","se","es","al","su","sus",
  "a","y","o","pero","si","no","lo","le","les","me","mi",
  "ser","esta","este","estos","estas","como","más","ya","hay",
]);


// =============================================================================
//  PUNTO DE ENTRADA HTTP — doGet
//  Tu página web llama a esta URL con los parámetros correspondientes.
//
//  ACCIONES PÚBLICAS (requieren apiKey válida):
//    ?accion=buscar&apiKey=XXX&q=saque
//    ?accion=interaccion&apiKey=XXX&articuloId=15
//    ?accion=verificar&apiKey=XXX
//
//  ACCIONES DE ADMINISTRACIÓN (requieren adminSecret):
//    ?accion=activarClave&adminSecret=XXX&clave=REG-xxx&nombre=Juan&email=j@mail.com&meses=1
//    ?accion=desactivarClave&adminSecret=XXX&clave=REG-xxx
//    ?accion=consultarClave&adminSecret=XXX&clave=REG-xxx
//    ?accion=listarClaves&adminSecret=XXX
// =============================================================================
function doGet(e) {
  var accion = e.parameter.accion || "";

  // ── Sin acción → siempre sirve la interfaz visual ─────────────────────────
  // El usuario abre el link y ve la pantalla de login. La validación de clave
  // ocurre dentro del navegador vía google.script.run, nunca aquí.
  if (!accion) {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("Buscador de Reglamento")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }

  // ── Acciones de administración — llamadas desde tu web o panel admin ───────
  if (["activarClave","desactivarClave","consultarClave","listarClaves","claveDisponible"].indexOf(accion) !== -1) {
    if (!validarAdminSecret(e.parameter.adminSecret)) {
      return jsonResponse({ error: "Acceso de administración denegado." });
    }
    if (accion === "activarClave")    return jsonResponse(activarClave(e.parameter));
    if (accion === "desactivarClave") return jsonResponse(desactivarClave(e.parameter.clave));
    if (accion === "consultarClave")  return jsonResponse(consultarClave(e.parameter.clave));
    if (accion === "listarClaves")    return jsonResponse(listarClaves());
    if (accion === "claveDisponible") return jsonResponse(obtenerClaveDisponible());
  }

  // ── Verificar acceso — llamado interno desde google.script.run ────────────
  if (accion === "verificar") {
    return jsonResponse(verificarAcceso(e.parameter.apiKey));
  }

  // ── Acciones del buscador — requieren API Key válida y vigente ─────────────
  var validacion = verificarAcceso(e.parameter.apiKey);
  if (!validacion.valido) {
    return jsonResponse({ error: validacion.mensaje });
  }

  if (accion === "buscar")      return jsonResponse(buscarEnReglamento(e.parameter.q || ""));
  if (accion === "interaccion") return jsonResponse(registrarInteraccion(e.parameter.articuloId || ""));

  return jsonResponse({ error: "Acción no reconocida." });
}


// =============================================================================
//  SEGURIDAD — Validación de Admin Secret
//  Guardalo en: Apps Script → Configuración → Propiedades de secuencia de comandos
//  Clave: ADMIN_SECRET   Valor: (una frase larga y secreta, solo vos la sabés)
// =============================================================================
function validarAdminSecret(secret) {
  if (!secret) return false;
  var stored = PropertiesService.getScriptProperties().getProperty("ADMIN_SECRET") || "";
  return stored.trim() === secret.trim();
}


// =============================================================================
//  VERIFICAR ACCESO — Llamado desde la pantalla de login del cliente
//  Retorna: { valido, nombre, email, diasRestantes, mensaje }
// =============================================================================
function verificarAcceso(apiKey) {
  if (!apiKey) return { valido: false, mensaje: "Ingresá tu clave de acceso." };

  var hoja  = obtenerHojaKeys();
  var datos = hoja.getDataRange().getValues();
  var hoy   = new Date();
  hoy.setHours(0, 0, 0, 0);

  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    if (String(fila[CONFIG.KC_CLAVE - 1]).trim() !== apiKey.trim()) continue;

    var estado = String(fila[CONFIG.KC_ESTADO - 1]);
    var vence  = fila[CONFIG.KC_VENCE - 1];

    if (estado === "Disponible") {
      return { valido: false, mensaje: "Esta clave aún no fue activada." };
    }
    if (estado === "Inactiva") {
      return { valido: false, mensaje: "Tu suscripción está inactiva. Renovála para continuar." };
    }

    // Verificar vencimiento
    var fechaVence = new Date(vence);
    fechaVence.setHours(0, 0, 0, 0);
    var diff = Math.ceil((fechaVence - hoy) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      // Marcar automáticamente como vencida
      hoja.getRange(i + 1, CONFIG.KC_ESTADO).setValue("Inactiva");
      return { valido: false, mensaje: "Tu acceso venció el " + fechaVence.toLocaleDateString("es-AR") + ". Renovalo para continuar." };
    }

    return {
      valido       : true,
      nombre       : String(fila[CONFIG.KC_NOMBRE - 1]),
      email        : String(fila[CONFIG.KC_EMAIL  - 1]),
      diasRestantes: diff,
      mensaje      : "Acceso válido",
    };
  }

  return { valido: false, mensaje: "Clave no encontrada. Verificá que la escribiste correctamente." };
}


// =============================================================================
//  ACTIVAR CLAVE — Tu web llama esto cuando el cliente paga
//  Parámetros: clave, nombre, email, meses (1, 3, 6, 12)
//
//  Si la clave ya estaba asignada a ese cliente → extiende el vencimiento.
//  Si es nueva → la activa y registra los datos.
// =============================================================================
function activarClave(params) {
  var clave  = String(params.clave  || "").trim();
  var nombre = String(params.nombre || "").trim();
  var email  = String(params.email  || "").trim();
  var meses  = parseInt(params.meses || "1", 10);

  if (!clave)  return { ok: false, error: "Falta el parámetro 'clave'." };
  if (!email)  return { ok: false, error: "Falta el parámetro 'email'." };
  if (isNaN(meses) || meses < 1) meses = 1;

  var hoja  = obtenerHojaKeys();
  var datos = hoja.getDataRange().getValues();
  var hoy   = new Date();

  for (var i = 1; i < datos.length; i++) {
    var filaDatos = datos[i];
    if (String(filaDatos[CONFIG.KC_CLAVE - 1]).trim() !== clave) continue;

    // Calcular nueva fecha de vencimiento
    // Si ya tenía una fecha vigente → extender desde ahí; si no → desde hoy
    var base        = new Date();
    var estadoActual = String(filaDatos[CONFIG.KC_ESTADO - 1]);
    if (estadoActual === "Activa" && filaDatos[CONFIG.KC_VENCE - 1]) {
      var venceActual = new Date(filaDatos[CONFIG.KC_VENCE - 1]);
      if (venceActual > hoy) base = venceActual;  // extiende desde el vencimiento actual
    }

    var nuevaFechaVence = new Date(base);
    nuevaFechaVence.setMonth(nuevaFechaVence.getMonth() + meses);

    var filaSheet = i + 1;
    hoja.getRange(filaSheet, CONFIG.KC_NOMBRE ).setValue(nombre || filaDatos[CONFIG.KC_NOMBRE - 1]);
    hoja.getRange(filaSheet, CONFIG.KC_EMAIL  ).setValue(email);
    hoja.getRange(filaSheet, CONFIG.KC_ESTADO ).setValue("Activa");
    hoja.getRange(filaSheet, CONFIG.KC_ALTA   ).setValue(Utilities.formatDate(hoy, "America/Argentina/Buenos_Aires", "dd/MM/yyyy"));
    hoja.getRange(filaSheet, CONFIG.KC_VENCE  ).setValue(Utilities.formatDate(nuevaFechaVence, "America/Argentina/Buenos_Aires", "dd/MM/yyyy"));
    hoja.getRange(filaSheet, CONFIG.KC_MESES  ).setValue(meses);

    // Colorear fila en verde
    hoja.getRange(filaSheet, 1, 1, CONFIG.KC_MESES).setBackground("#dcfce7");
    hoja.getRange(filaSheet, CONFIG.KC_ESTADO).setFontColor("#15803d").setFontWeight("bold");

    // Enviar email de bienvenida al cliente
    enviarEmailActivacion(email, nombre || "cliente", clave, nuevaFechaVence, meses);

    return {
      ok           : true,
      clave        : clave,
      nombre       : nombre,
      email        : email,
      vencimiento  : Utilities.formatDate(nuevaFechaVence, "America/Argentina/Buenos_Aires", "dd/MM/yyyy"),
      diasOtorgados: meses * 30,
    };
  }

  return { ok: false, error: "Clave no encontrada en el sistema: " + clave };
}


// =============================================================================
//  DESACTIVAR CLAVE — Tu web llama esto cuando el cliente no renueva
// =============================================================================
function desactivarClave(clave) {
  if (!clave) return { ok: false, error: "Falta el parámetro 'clave'." };

  var hoja  = obtenerHojaKeys();
  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][CONFIG.KC_CLAVE - 1]).trim() !== clave.trim()) continue;

    var filaSheet = i + 1;
    hoja.getRange(filaSheet, CONFIG.KC_ESTADO).setValue("Inactiva");
    hoja.getRange(filaSheet, CONFIG.KC_ESTADO).setFontColor("#dc2626").setFontWeight("bold");
    hoja.getRange(filaSheet, 1, 1, CONFIG.KC_MESES).setBackground("#fee2e2");

    Logger.log("🚫 Clave desactivada: " + clave);
    return { ok: true, clave: clave, mensaje: "Clave desactivada correctamente." };
  }

  return { ok: false, error: "Clave no encontrada: " + clave };
}


// =============================================================================
//  CONSULTAR CLAVE — Tu panel admin puede llamar esto para ver el estado
// =============================================================================
function consultarClave(clave) {
  if (!clave) return { ok: false, error: "Falta el parámetro 'clave'." };

  var hoja  = obtenerHojaKeys();
  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    var f = datos[i];
    if (String(f[CONFIG.KC_CLAVE - 1]).trim() !== clave.trim()) continue;

    return {
      ok     : true,
      numero : f[CONFIG.KC_NUMERO - 1],
      clave  : f[CONFIG.KC_CLAVE  - 1],
      nombre : f[CONFIG.KC_NOMBRE - 1],
      email  : f[CONFIG.KC_EMAIL  - 1],
      estado : f[CONFIG.KC_ESTADO - 1],
      alta   : f[CONFIG.KC_ALTA   - 1],
      vence  : f[CONFIG.KC_VENCE  - 1],
      meses  : f[CONFIG.KC_MESES  - 1],
    };
  }

  return { ok: false, error: "Clave no encontrada." };
}


// =============================================================================
//  LISTAR CLAVES — Resumen para tu panel admin
// =============================================================================
function listarClaves() {
  var hoja  = obtenerHojaKeys();
  var datos = hoja.getDataRange().getValues();
  var lista = [];

  for (var i = 1; i < datos.length; i++) {
    var f = datos[i];
    if (!f[CONFIG.KC_CLAVE - 1]) continue;
    lista.push({
      clave : f[CONFIG.KC_CLAVE  - 1],
      nombre: f[CONFIG.KC_NOMBRE - 1],
      email : f[CONFIG.KC_EMAIL  - 1],
      estado: f[CONFIG.KC_ESTADO - 1],
      vence : f[CONFIG.KC_VENCE  - 1],
    });
  }

  var activas     = lista.filter(function(k) { return k.estado === "Activa";      }).length;
  var inactivas   = lista.filter(function(k) { return k.estado === "Inactiva";    }).length;
  var disponibles = lista.filter(function(k) { return k.estado === "Disponible";  }).length;

  return { ok: true, total: lista.length, activas: activas, inactivas: inactivas, disponibles: disponibles, claves: lista };
}


// =============================================================================
//  EMAIL DE ACTIVACIÓN — Se envía automáticamente al activar una clave
//  Personalizá el asunto, remitente y cuerpo según tu marca.
// =============================================================================
function enviarEmailActivacion(email, nombre, clave, fechaVence, meses) {
  try {
    var webAppUrl = PropertiesService.getScriptProperties().getProperty("WEB_APP_URL") || "[URL de tu buscador]";
    var fechaStr  = Utilities.formatDate(fechaVence, "America/Argentina/Buenos_Aires", "dd/MM/yyyy");

    var asunto = "✅ Tu acceso al Reglamento está activo";
    var cuerpo  =
      "Hola " + nombre + ",\n\n" +
      "Tu suscripción fue activada correctamente. Estos son tus datos de acceso:\n\n" +
      "  🔑 Clave de acceso: " + clave + "\n" +
      "  📅 Válida hasta:    " + fechaStr + " (" + meses + " mes" + (meses > 1 ? "es" : "") + ")\n" +
      "  🔗 Acceder aquí:    " + webAppUrl + "\n\n" +
      "Para ingresar, abrí el link y pegá tu clave cuando te la pida.\n\n" +
      "Si tenés alguna duda respondé este mensaje.\n\n" +
      "¡Gracias por tu suscripción!";

    GmailApp.sendEmail(email, asunto, cuerpo);
  } catch(err) {
    Logger.log("⚠️ No se pudo enviar el email a " + email + ": " + err.message);
  }
}


// =============================================================================
//  OBTENER CLAVE DISPONIBLE — El panel admin llama esto para saber qué clave
//  asignar al próximo cliente que pague. Devuelve la primera con estado "Disponible".
// =============================================================================
function obtenerClaveDisponible() {
  var hoja  = obtenerHojaKeys();
  var datos = hoja.getDataRange().getValues();

  for (var i = 1; i < datos.length; i++) {
    var estado = String(datos[i][CONFIG.KC_ESTADO - 1]);
    var clave  = String(datos[i][CONFIG.KC_CLAVE  - 1]);
    if (estado === "Disponible" && clave) {
      return { ok: true, clave: clave, fila: i + 1 };
    }
  }

  return { ok: false, error: "No quedan claves disponibles. Generá más con generarApiKeys()." };
}

// =============================================================================
//  MOTOR DE BÚSQUEDA CON RELEVANCIA PRO
// =============================================================================
function buscarEnReglamento(query) {
  query = String(query || "").trim();
  if (query.length < CONFIG.MIN_CHARS_QUERY) return [];

  var palabras = tokenizar(query);
  if (palabras.length === 0) return [];

  var hoja  = obtenerHoja();
  var datos = hoja.getDataRange().getValues();
  var resultados = [];

  for (var i = 1; i < datos.length; i++) {
    var fila      = datos[i];
    var capitulo  = String(fila[CONFIG.COL_CAPITULO  - 1] || "");
    var articulo  = String(fila[CONFIG.COL_ARTICULO  - 1] || "");
    var titulo    = String(fila[CONFIG.COL_TITULO    - 1] || "");
    var contenido = String(fila[CONFIG.COL_CONTENIDO - 1] || "");
    var popular   = Number(fila[CONFIG.COL_POPULAR   - 1]) || 0;

    var score = calcularScore(query, palabras, titulo, contenido, popular);
    if (score <= 0) continue;

    resultados.push({ fila: i + 1, articulo: articulo, titulo: titulo,
                      capitulo: capitulo, contenido: contenido,
                      score: score, popularidad: popular });
  }

  resultados.sort(function(a, b) { return b.score - a.score; });

  return resultados.slice(0, CONFIG.MAX_RESULTADOS).map(function(r) {
    return { fila: r.fila, articulo: r.articulo, titulo: r.titulo,
             capitulo: r.capitulo, contenido: r.contenido, popularidad: r.popularidad };
  });
}

function calcularScore(queryOriginal, palabras, titulo, contenido, popular) {
  var score      = 0;
  var tituloL    = titulo.toLowerCase();
  var contenidoL = contenido.toLowerCase();
  var queryL     = queryOriginal.toLowerCase();

  if (tituloL.indexOf(queryL) !== -1)    score += CONFIG.PESO_TITULO_EXACTO;
  palabras.forEach(function(p) {
    if (tituloL.indexOf(p)    !== -1)    score += CONFIG.PESO_TITULO_PARCIAL;
    if (contenidoL.indexOf(p) !== -1)    score += CONFIG.PESO_CONTENIDO;
  });
  score += popular * CONFIG.PESO_POPULARIDAD;
  return score;
}

function tokenizar(query) {
  return query.toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/gi, " ")
    .split(/\s+/)
    .filter(function(p) { return p.length >= 2 && !STOP_WORDS.has(p); })
    .filter(function(p, i, arr) { return arr.indexOf(p) === i; });
}


// =============================================================================
//  MOTOR DE APRENDIZAJE — registrarInteraccion
// =============================================================================
function registrarInteraccion(articuloId) {
  var fila = parseInt(articuloId, 10);
  if (isNaN(fila) || fila < 2) return { ok: false, error: "ID inválido." };

  var hoja   = obtenerHoja();
  var celda  = hoja.getRange(fila, CONFIG.COL_POPULAR);
  var actual = Number(celda.getValue()) || 0;
  celda.setValue(actual + 1);
  return { ok: true, fila: fila, popularidad: actual + 1 };
}


// =============================================================================
//  GENERADOR DE API KEYS — Ejecutar UNA sola vez
// =============================================================================
function generarApiKeys() {
  var CANTIDAD = 400;
  var PREFIJO  = "REG";
  var CHARS    = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  var LONGITUD = 12;

  var claves = [];
  var usadas = new Set();
  while (claves.length < CANTIDAD) {
    var clave = PREFIJO + "-";
    for (var i = 0; i < LONGITUD; i++) {
      clave += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    if (!usadas.has(clave)) { usadas.add(clave); claves.push(clave); }
  }

  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(CONFIG.KEYS_SHEET);
  if (!hoja) hoja = ss.insertSheet(CONFIG.KEYS_SHEET);
  else       hoja.clearContents();

  var encabezados = [["N°","API Key","Nombre","Email","Estado","Fecha Alta","Fecha Vencimiento","Meses"]];
  hoja.getRange(1, 1, 1, 8).setValues(encabezados)
      .setFontWeight("bold").setBackground("#1e40af").setFontColor("#ffffff");

  var filas = claves.map(function(k, i) { return [i+1, k, "","","Disponible","","",""]; });
  hoja.getRange(2, 1, filas.length, 8).setValues(filas);

  [50,220,180,200,100,110,150,80].forEach(function(w, c) { hoja.setColumnWidth(c+1, w); });

  Logger.log("✅ " + claves.length + " claves generadas. Revisá la hoja '" + CONFIG.KEYS_SHEET + "'.");
}


// =============================================================================
//  CLAVE DE PRUEBA — Ejecutar desde el editor para testear el sistema
//  Editor → seleccioná "crearClaveDePrueba" en el menú → ▶ Ejecutar
//  Luego copiás la clave del log (Ver → Registros) y la pegás en el login.
// =============================================================================
function crearClaveDePrueba() {
  var EMAIL  = "prueba@test.com";   // ← podés cambiar esto por tu email real
  var NOMBRE = "Administrador";
  var MESES  = 1;

  // Tomar la primera clave disponible
  var disponible = obtenerClaveDisponible();
  if (!disponible.ok) {
    Logger.log("❌ " + disponible.error);
    return;
  }

  // Activarla
  var resultado = activarClave({
    clave : disponible.clave,
    nombre: NOMBRE,
    email : EMAIL,
    meses : String(MESES),
  });

  if (resultado.ok) {
    Logger.log("══════════════════════════════════════");
    Logger.log("✅ CLAVE DE PRUEBA ACTIVADA");
    Logger.log("══════════════════════════════════════");
    Logger.log("🔑 Clave:       " + disponible.clave);
    Logger.log("📅 Vence:       " + resultado.vencimiento);
    Logger.log("👤 Nombre:      " + NOMBRE);
    Logger.log("══════════════════════════════════════");
    Logger.log("👆 Copiá esa clave y pegala en el login.");
  } else {
    Logger.log("❌ Error: " + resultado.error);
  }
}


// =============================================================================
//  TRIGGER DIARIO — Verificar vencimientos automáticamente
//  Para activarlo: Apps Script → Triggers → Agregar → verificarVencimientos
//  → Basado en tiempo → Diariamente
// =============================================================================
function verificarVencimientos() {
  var hoja  = obtenerHojaKeys();
  var datos = hoja.getDataRange().getValues();
  var hoy   = new Date();
  hoy.setHours(0, 0, 0, 0);
  var vencidas = 0;

  for (var i = 1; i < datos.length; i++) {
    var estado = String(datos[i][CONFIG.KC_ESTADO - 1]);
    var vence  = datos[i][CONFIG.KC_VENCE  - 1];
    if (estado !== "Activa" || !vence) continue;

    var fechaVence = new Date(vence);
    fechaVence.setHours(0, 0, 0, 0);
    if (fechaVence < hoy) {
      hoja.getRange(i+1, CONFIG.KC_ESTADO).setValue("Inactiva")
          .setFontColor("#dc2626").setFontWeight("bold");
      hoja.getRange(i+1, 1, 1, CONFIG.KC_MESES).setBackground("#fee2e2");
      vencidas++;
    }
  }

  Logger.log("🔄 Verificación diaria: " + vencidas + " clave(s) vencida(s) desactivadas.");
}


// =============================================================================
//  UTILIDADES
// =============================================================================
function obtenerHoja() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!hoja) throw new Error("No se encontró la hoja: " + CONFIG.SHEET_NAME);
  if (!hoja.getRange(1, CONFIG.COL_POPULAR).getValue()) {
    hoja.getRange(1, CONFIG.COL_POPULAR).setValue("Popularidad");
  }
  return hoja;
}

function obtenerHojaKeys() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(CONFIG.KEYS_SHEET);
  if (!hoja) throw new Error("No se encontró la hoja: " + CONFIG.KEYS_SHEET + ". Ejecutá primero generarApiKeys().");
  return hoja;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


// =============================================================================
//  FUNCIONES PARA HtmlService (google.script.run desde Index.html)
// =============================================================================
function verificarDesdeUI(apiKey) {
  return verificarAcceso(apiKey);
}

function buscarDesdeUI(query, apiKey) {
  var v = verificarAcceso(apiKey);
  if (!v.valido) return { error: v.mensaje };
  return buscarEnReglamento(query);
}

function registrarDesdeUI(articuloId, apiKey) {
  var v = verificarAcceso(apiKey);
  if (!v.valido) return { error: v.mensaje };
  return registrarInteraccion(articuloId);
}

function responderConGeminiDesdeUI(query, apiKey) {
  var v = verificarAcceso(apiKey);
  if (!v.valido) return { error: v.mensaje };
  return responderConGemini(query);
}


// =============================================================================
//  INTEGRACIÓN GEMINI — Respuesta inteligente sobre el Reglamento de Newcom
//
//  CONFIGURACIÓN (una sola vez):
//    Apps Script → Configuración (engranaje) → Propiedades de secuencia de comandos
//    → Agregar propiedad:  GEMINI_API_KEY  =  tu clave AIza...
// =============================================================================
function responderConGemini(query) {
  query = String(query || "").trim();
  if (query.length < 3) return { error: "La consulta es muy corta." };

  // 1. Buscar artículos relevantes con el motor existente
  var articulos = buscarEnReglamento(query);

  if (!articulos || articulos.length === 0) {
    return {
      respuesta : "No encontré artículos del reglamento relacionados con tu consulta. Probá con otras palabras.",
      articulos : [],
    };
  }

  // 2. Construir el contexto con los 6 artículos más relevantes
  var contexto = articulos.slice(0, 6).map(function(a) {
    return (a.articulo ? a.articulo + ". " : "") +
           (a.titulo   ? a.titulo + "\n"  : "") +
           (a.contenido || "");
  }).join("\n\n---\n\n");

  // 3. Armar el prompt
  var prompt =
    "Sos un asistente experto en el Reglamento Oficial de Newcom. " +
    "Respondé la pregunta del usuario basándote ÚNICAMENTE en los artículos del reglamento que te doy a continuación. " +
    "Si la respuesta no está en los artículos, decilo claramente. " +
    "Respondé en español rioplatense, de forma clara, directa y sin inventar nada.\n\n" +
    "═══ ARTÍCULOS DEL REGLAMENTO ═══\n\n" + contexto +
    "\n\n═══ PREGUNTA DEL USUARIO ═══\n\n" + query;

  // 4. Llamar a la API de Gemini
  var resultado = llamarGeminiAPI(prompt);

  if (resultado.error) {
    Logger.log("⚠️ Error Gemini en responderConGemini: " + resultado.error);
  }

  return {
    respuesta : resultado.texto || ("⚠️ " + (resultado.error || "No pude generar una respuesta.")),
    articulos : articulos.slice(0, 6),
  };
}


// =============================================================================
//  LLAMADA A LA API DE GEMINI (via UrlFetchApp)
// =============================================================================
function llamarGeminiAPI(prompt) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey) {
    Logger.log("❌ GEMINI_API_KEY no configurada en las propiedades del script.");
    return { texto: null, error: "API Key no configurada. Guardala en Propiedades del script." };
  }

  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;

  var payload = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature    : 0.2,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH",        threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",  threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT",  threshold: "BLOCK_NONE" },
    ],
  };

  var options = {
    method           : "POST",
    contentType      : "application/json",
    payload          : JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var codigo   = response.getResponseCode();
    var cuerpo   = response.getContentText();
    var json     = JSON.parse(cuerpo);

    if (codigo !== 200) {
      Logger.log("❌ Gemini HTTP " + codigo + ": " + cuerpo);
      var msg = (json.error && json.error.message) ? json.error.message : "Error HTTP " + codigo;
      return { texto: null, error: msg };
    }

    if (json.candidates && json.candidates[0] &&
        json.candidates[0].content && json.candidates[0].content.parts) {
      return { texto: json.candidates[0].content.parts[0].text, error: null };
    }

    Logger.log("⚠️ Respuesta inesperada de Gemini: " + cuerpo);
    return { texto: null, error: "Respuesta inesperada de la API." };
  } catch (err) {
    Logger.log("❌ Error llamando a Gemini: " + err.message);
    return { texto: null, error: err.message };
  }
}


// =============================================================================
//  LISTAR MODELOS DISPONIBLES — Ejecutar para ver qué modelos tenés disponibles
//  Editor → seleccioná "listarModelosGemini" → ▶ Ejecutar → Ver → Registros
// =============================================================================
function listarModelosGemini() {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  var url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var json = JSON.parse(response.getContentText());

  Logger.log("══════════════════════════════════════");
  Logger.log("📋 MODELOS DISPONIBLES PARA TU API KEY");
  Logger.log("══════════════════════════════════════");

  if (json.models) {
    json.models.forEach(function(m) {
      // Solo mostrar los que soportan generateContent
      if (m.supportedGenerationMethods &&
          m.supportedGenerationMethods.indexOf("generateContent") !== -1) {
        Logger.log("✅ " + m.name + " → " + (m.displayName || ""));
      }
    });
  } else {
    Logger.log("❌ Error: " + response.getContentText());
  }
  Logger.log("══════════════════════════════════════");
}


// =============================================================================
//  TEST DE GEMINI — Ejecutar desde el editor para verificar la conexión
//  Editor → seleccioná "testGemini" → ▶ Ejecutar → Ver → Registros
// =============================================================================
function testGemini() {
  Logger.log("══════════════════════════════════════");
  Logger.log("🧪 TEST DE CONEXIÓN CON GEMINI");
  Logger.log("══════════════════════════════════════");

  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey) {
    Logger.log("❌ GEMINI_API_KEY no está guardada.");
    Logger.log("→ Andá a: Configuración ⚙️ → Propiedades → Agregar: GEMINI_API_KEY");
    return;
  }
  Logger.log("✅ API Key encontrada: " + apiKey.substring(0, 8) + "...");

  var resultado = llamarGeminiAPI("Respondé solo: 'Conexión exitosa con Gemini ✅'");

  if (resultado.error) {
    Logger.log("❌ Error de Gemini: " + resultado.error);
  } else {
    Logger.log("✅ Respuesta de Gemini: " + resultado.texto);
    Logger.log("══════════════════════════════════════");
    Logger.log("¡Todo funciona correctamente!");
  }
}

// =============================================================================
//  ACTIVAR CLAVE ESPECÍFICA — Ejecutar una vez para activar tu clave de prueba
//  1. Cambiá TU_EMAIL_AQUI por tu email real
//  2. Seleccioná "activarClavePrueba" en el menú → ▶ Ejecutar
//  3. Ver → Registros para confirmar
// =============================================================================
function activarClavePrueba() {
  var resultado = activarClave({
    clave : "REG-sbKYWd4Fc7Gh",
    nombre: "Administrador",
    email : "TU_EMAIL_AQUI",
    meses : "1",
  });
  Logger.log("══════════════════════════════");
  if (resultado.ok) {
    Logger.log("✅ Clave activada correctamente");
    Logger.log("🔑 Clave:      REG-sbKYWd4Fc7Gh");
    Logger.log("📅 Vence:      " + resultado.vencimiento);
    Logger.log("══════════════════════════════");
    Logger.log("Ahora podés ingresar con esa clave en el buscador.");
  } else {
    Logger.log("❌ Error: " + resultado.error);
  }
}
