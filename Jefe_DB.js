function obtenerSolicitudesPendientesJefe(uidJefe) {
  var rows = obtenerSolicitudesJefe(uidJefe) || [];
  return rows.filter(function (r) {
    var est = (r && r.estadoJefe != null) ? r.estadoJefe.toString().trim().toUpperCase() : '';
    return est === 'PENDIENTE';
  });
}

function obtenerSolicitudesJefe(uidJefe) {
  var uid = (uidJefe == null) ? '' : uidJefe.toString().trim();
  if (!uid) return [];

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Registro_Permisos');
  if (!sheet) return [];

  var rows = sheet.getDataRange().getValues();
  var out = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i] || [];

    var idSolicitud = (r[0] == null) ? '' : r[0].toString().trim();
    var marca = r[1];
    var idSolicitante = (r[2] == null) ? '' : r[2].toString().trim();
    var nombreSolicitante = (r[3] == null) ? '' : r[3].toString().trim();
    var correoSolicitante = (r[4] == null) ? '' : r[4].toString().trim();
    var cargoSolicitante = (r[5] == null) ? '' : r[5].toString().trim();
    var fechaIni = r[6];
    var fechaFin = r[7];
    var horaIni = formatearHoraColombia_(r[8]);
    var horaFin = formatearHoraColombia_(r[9]);
    var horasEstimadas = formatearHoraColombia_(r[10]);
    var motivo = (r[11] == null) ? '' : r[11].toString().trim();
    var observaciones = (r[12] == null) ? '' : r[12].toString().trim();
    var urlAdjunto = (r[13] == null) ? '' : r[13].toString().trim();
    var idAprobador = (r[14] == null) ? '' : r[14].toString().trim();
    var nombreJefe = (r[15] == null) ? '' : r[15].toString().trim();
    var correoJefe = (r[16] == null) ? '' : r[16].toString().trim();
    var estadoJefe = (r[17] == null) ? '' : r[17].toString().trim().toUpperCase();
    var estadoTH = (r[18] == null) ? '' : r[18].toString().trim().toUpperCase();

    if (!idSolicitud) continue;
    if (idAprobador !== uid) continue;

    out.push({
      idSolicitud: idSolicitud,
      marcaTemporal: formatearFechaHoraColombia_(marca),
      idSolicitante: idSolicitante,
      empleado: nombreSolicitante,
      correoEmpleado: correoSolicitante,
      cargoEmpleado: cargoSolicitante,
      fechaPermiso: formatearRangoFechasColombia_(fechaIni, fechaFin),
      fechaInicio: formatearFechaColombia_(fechaIni),
      fechaFin: formatearFechaColombia_(fechaFin),
      horaInicio: horaIni,
      horaFin: horaFin,
      horasEstimadas: horasEstimadas,
      motivo: motivo,
      observaciones: observaciones,
      urlAdjunto: urlAdjunto,
      idAprobador: idAprobador,
      nombreJefe: nombreJefe,
      correoJefe: correoJefe,
      estadoJefe: estadoJefe,
      estadoTH: estadoTH
    });
  }

  return out;
}

function responderSolicitudJefe(idSolicitud, nuevaRespuesta, uidJefe) {
  var id = (idSolicitud == null) ? '' : idSolicitud.toString().trim();
  var resp = (nuevaRespuesta == null) ? '' : nuevaRespuesta.toString().trim().toUpperCase();
  var uid = (uidJefe == null) ? '' : uidJefe.toString().trim();

  if (!id || !uid) return { exito: false, mensaje: 'Datos inválidos.' };
  if (resp !== 'APROBADO' && resp !== 'RECHAZADO') return { exito: false, mensaje: 'Respuesta inválida.' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Registro_Permisos');
  if (!sheet) return { exito: false, mensaje: 'No existe la hoja "Registro_Permisos".' };

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { exito: false, mensaje: 'No hay solicitudes.' };

  var rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i] || [];
    var rid = (r[0] == null) ? '' : r[0].toString().trim();
    if (rid !== id) continue;

    var aprobador = (r[14] == null) ? '' : r[14].toString().trim();
    if (aprobador !== uid) return { exito: false, mensaje: 'No autorizado para responder esta solicitud.' };

    var estadoActual = (r[17] == null) ? '' : r[17].toString().trim().toUpperCase();
    if (estadoActual !== 'PENDIENTE') return { exito: false, mensaje: 'Esta solicitud ya fue respondida.' };

    sheet.getRange(i + 2, 18).setValue(resp);
    return { exito: true, mensaje: 'Solicitud ' + id + ' ' + resp + '.' };
  }

  return { exito: false, mensaje: 'Solicitud no encontrada.' };
}

function formatearFechaHoraColombia_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v.getTime())) {
    return Utilities.formatDate(v, 'America/Bogota', 'dd/MM/yyyy HH:mm');
  }
  return (v == null) ? '' : v.toString().trim();
}

function formatearHoraColombia_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v.getTime())) {
    return Utilities.formatDate(v, 'America/Bogota', 'HH:mm');
  }
  return (v == null) ? '' : v.toString().trim();
}

function formatearRangoFechasColombia_(ini, fin) {
  var a = formatearFechaColombia_(ini);
  var b = formatearFechaColombia_(fin);
  if (a && b) return a + ' al ' + b;
  return a || b || '';
}

function formatearFechaColombia_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v.getTime())) {
    return Utilities.formatDate(v, 'America/Bogota', 'dd/MM/yyyy');
  }
  return (v == null) ? '' : v.toString().trim();
}
