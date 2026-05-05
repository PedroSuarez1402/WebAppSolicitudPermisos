function obtenerEstadoReloj(uid) {
  var now = new Date();
  var horaActualStr = Utilities.formatDate(now, "America/Bogota", "HH:mm");
  var fechaHoy = Utilities.formatDate(now, "America/Bogota", "dd/MM/yyyy");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetCfg = ss.getSheetByName('Config_Horarios');
  if (!sheetCfg) return { exito: false, mensaje: "No existe la hoja Config_Horarios." };

  var cfgRows = sheetCfg.getDataRange().getValues();
  var etapas = obtenerEtapasUnicas_(cfgRows);

  return { exito: true, hora: horaActualStr, fecha: fechaHoy, etapas: etapas };
}

function evaluarEtapa(uid, etapa) {
  var now = new Date();
  var horaActualStr = Utilities.formatDate(now, "America/Bogota", "HH:mm");
  var fechaHoy = Utilities.formatDate(now, "America/Bogota", "dd/MM/yyyy");

  var uidStr = (uid == null) ? '' : uid.toString().trim();
  var etapaStr = (etapa == null) ? '' : etapa.toString().trim();
  if (!uidStr || !etapaStr) return { habilitado: false, mensaje: "Etapa inválida." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (yaRegistroEtapaHoy_(ss, uidStr, fechaHoy, etapaStr)) {
    return { habilitado: false, mensaje: "Ya registraste tu " + etapaStr + " hoy." };
  }

  var sheetCfg = ss.getSheetByName('Config_Horarios');
  var categoria = null;
  if (sheetCfg) {
    var cfgRows = sheetCfg.getDataRange().getValues();
    categoria = obtenerCategoriaPorEtapa_(cfgRows, etapaStr, horaActualStr);
  }

  if (!categoria) categoria = "Sin regla";
  return { habilitado: true, etapa: etapaStr, categoria: categoria, hora: horaActualStr };
}

function registrarAsistenciaManual(uid, nombreUsuario, tipoMarcacion) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Registro_Asistencia');
  if (!sheet) return { exito: false, mensaje: 'No existe la hoja "Registro_Asistencia".' };

  var now = new Date();
  var fechaHoy = Utilities.formatDate(now, "America/Bogota", "dd/MM/yyyy");
  var horaExactaStr = Utilities.formatDate(now, "America/Bogota", "HH:mm:ss");
  var horaActualStr = Utilities.formatDate(now, "America/Bogota", "HH:mm");

  var uidStr = (uid == null) ? '' : uid.toString().trim();
  var tipoStr = (tipoMarcacion == null) ? '' : tipoMarcacion.toString().trim();
  if (!uidStr || !tipoStr) return { exito: false, mensaje: "Datos inválidos." };

  if (yaRegistroEtapaHoy_(ss, uidStr, fechaHoy, tipoStr)) {
    return { exito: false, mensaje: "Ya registraste tu " + tipoStr + " hoy." };
  }

  var categoria = "Registrado";
  var sheetCfg = ss.getSheetByName('Config_Horarios');
  if (sheetCfg) {
    var cfgRows = sheetCfg.getDataRange().getValues();
    var ideal = obtenerHoraIdealPorEtapa_(cfgRows, tipoStr);
    if (ideal) categoria = (horaActualStr <= ideal) ? "A tiempo" : "Retraso";
  }

  var idRegistro = "ASIS-001";
  var ultimaFila = sheet.getLastRow();
  if (ultimaFila > 1) {
    var ultimoId = sheet.getRange(ultimaFila, 1).getValue();
    ultimoId = (ultimoId == null) ? '' : ultimoId.toString();
    var match = ultimoId.match(/ASIS-(\d+)/);
    if (match) {
      var siguienteNum = parseInt(match[1], 10) + 1;
      idRegistro = "ASIS-" + siguienteNum.toString().padStart(3, '0');
    }
  }

  sheet.appendRow([
    idRegistro,
    fechaHoy,
    horaExactaStr,
    uidStr,
    (nombreUsuario == null) ? '' : nombreUsuario.toString().trim(),
    tipoStr,
    categoria
  ]);

  return { exito: true, mensaje: "Registro exitoso: " + tipoStr + " (" + categoria + ")" };
}

function registrarMarcacion(uid, nombreUsuario, etapa, categoria) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Registro_Asistencia');
  if (!sheet) throw new Error('No existe la hoja "Registro_Asistencia".');

  var now = new Date();
  var fechaHoy = Utilities.formatDate(now, "America/Bogota", "dd/MM/yyyy");
  var horaExactaStr = Utilities.formatDate(now, "America/Bogota", "HH:mm:ss");

  var uidStr = (uid == null) ? '' : uid.toString().trim();
  var etapaStr = (etapa == null) ? '' : etapa.toString().trim();
  if (!uidStr || !etapaStr) return { exito: false, mensaje: "Datos inválidos." };
  if (yaRegistroEtapaHoy_(ss, uidStr, fechaHoy, etapaStr)) {
    return { exito: false, mensaje: "Ya registraste tu " + etapaStr + " hoy." };
  }

  var sheetCfg = ss.getSheetByName('Config_Horarios');
  var categoriaCalc = null;
  if (sheetCfg) {
    var cfgRows = sheetCfg.getDataRange().getValues();
    categoriaCalc = obtenerCategoriaPorEtapa_(cfgRows, etapaStr, Utilities.formatDate(now, "America/Bogota", "HH:mm"));
  }
  var categoriaFinal = categoriaCalc || ((categoria == null) ? '' : categoria.toString().trim()) || "Sin regla";

  var idRegistro = "ASIS-001";
  var ultimaFila = sheet.getLastRow();
  if (ultimaFila > 1) {
    var ultimoId = sheet.getRange(ultimaFila, 1).getValue();
    ultimoId = (ultimoId == null) ? '' : ultimoId.toString();
    var match = ultimoId.match(/ASIS-(\d+)/);
    if (match) {
      var siguienteNum = parseInt(match[1], 10) + 1;
      idRegistro = "ASIS-" + siguienteNum.toString().padStart(3, '0');
    }
  }

  sheet.appendRow([
    idRegistro,
    fechaHoy,
    horaExactaStr,
    uidStr,
    (nombreUsuario == null) ? '' : nombreUsuario.toString().trim(),
    etapaStr,
    categoriaFinal
  ]);

  return { exito: true, mensaje: "Registro exitoso: " + etapaStr };
}

function obtenerEtapasUnicas_(cfgRows) {
  var seen = {};
  var out = [];
  for (var i = 1; i < (cfgRows || []).length; i++) {
    var r = cfgRows[i] || [];
    var etapa = (r[1] == null) ? '' : r[1].toString().trim();
    if (!etapa || seen[etapa]) continue;
    seen[etapa] = true;
    out.push(etapa);
  }
  return out;
}

function obtenerHoraIdealPorEtapa_(cfgRows, etapa) {
  for (var i = 1; i < (cfgRows || []).length; i++) {
    var r = cfgRows[i] || [];
    var etapaRow = (r[1] == null) ? '' : r[1].toString().trim();
    if (etapaRow !== etapa) continue;
    var ideal = normalizarHoraHHmm_(r[4]);
    if (ideal) return ideal;
    return null;
  }
  return null;
}

function yaRegistroEtapaHoy_(ss, uid, fechaHoy, etapa) {
  var sheetAsis = ss.getSheetByName('Registro_Asistencia');
  if (!sheetAsis) return false;
  var rows = sheetAsis.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i] || [];
    var fecha = '';
    if (Object.prototype.toString.call(r[1]) === '[object Date]') {
      fecha = Utilities.formatDate(r[1], "America/Bogota", "dd/MM/yyyy");
    } else {
      fecha = (r[1] == null) ? '' : r[1].toString().trim();
    }
    var idUsuario = (r[3] == null) ? '' : r[3].toString().trim();
    var etapaReg = (r[5] == null) ? '' : r[5].toString().trim();
    if (fecha === fechaHoy && idUsuario === uid && etapaReg === etapa) return true;
  }
  return false;
}

function obtenerCategoriaPorEtapa_(cfgRows, etapa, horaActualStr) {
  var mejorIdeal = '';
  for (var i = 1; i < (cfgRows || []).length; i++) {
    var r = cfgRows[i] || [];
    var etapaRow = (r[1] == null) ? '' : r[1].toString().trim();
    if (etapaRow !== etapa) continue;
    var ideal = normalizarHoraHHmm_(r[4]);
    if (ideal) {
      mejorIdeal = ideal;
      break;
    }
  }
  if (!mejorIdeal) return null;
  return (horaActualStr <= mejorIdeal) ? "A tiempo" : "Retraso";
}

function normalizarHoraHHmm_(valor) {
  if (valor == null) return '';
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    if (!isNaN(valor.getTime())) return Utilities.formatDate(valor, "America/Bogota", "HH:mm");
    return '';
  }

  if (typeof valor === 'number' && isFinite(valor)) {
    var totalMin = Math.round(valor * 24 * 60);
    totalMin = ((totalMin % (24 * 60)) + (24 * 60)) % (24 * 60);
    var hhNum = Math.floor(totalMin / 60);
    var mmNum = totalMin % 60;
    return String(hhNum).padStart(2, '0') + ':' + String(mmNum).padStart(2, '0');
  }

  var s = valor.toString().trim();
  if (!s) return '';

  var asDate = new Date(s);
  if (!isNaN(asDate.getTime())) return Utilities.formatDate(asDate, "America/Bogota", "HH:mm");

  var parts = s.split(':');
  if (!parts.length) return '';
  var hh = (parts[0] || '').toString().padStart(2, '0');
  var mm = (parts[1] || '00').toString().padStart(2, '0');
  return hh + ':' + mm;
}
