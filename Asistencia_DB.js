function obtenerEstadoReloj(uid) {
  var now = new Date();
  var horaActualStr = Utilities.formatDate(now, "America/Bogota", "HH:mm");
  var fechaHoy = Utilities.formatDate(now, "America/Bogota", "dd/MM/yyyy");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetCfg = ss.getSheetByName('Config_Horarios');
  if (!sheetCfg) return { habilitado: false, mensaje: "Fuera de horario de registro (" + horaActualStr + ")" };

  var cfgRows = sheetCfg.getDataRange().getValues();

  var etapa = '';
  var horaIdeal = '';
  for (var i = 1; i < cfgRows.length; i++) {
    var r = cfgRows[i] || [];
    var etapaRow = (r[1] == null) ? '' : r[1].toString().trim();
    var inicio = normalizarHoraHHmm_(r[2]);
    var fin = normalizarHoraHHmm_(r[3]);
    var ideal = normalizarHoraHHmm_(r[4]);
    if (!etapaRow || !inicio || !fin) continue;

    if (horaActualStr >= inicio && horaActualStr <= fin) {
      etapa = etapaRow;
      horaIdeal = ideal;
      break;
    }
  }

  if (!etapa) {
    return { habilitado: false, mensaje: "Fuera de horario de registro (" + horaActualStr + ")" };
  }

  var sheetAsis = ss.getSheetByName('Registro_Asistencia');
  if (sheetAsis) {
    var asisRows = sheetAsis.getDataRange().getValues();
    var uidStr = (uid == null) ? '' : uid.toString().trim();
    for (var j = 1; j < asisRows.length; j++) {
      var a = asisRows[j] || [];
      var fecha = (a[1] == null) ? '' : a[1].toString().trim();
      var idUsuario = (a[3] == null) ? '' : a[3].toString().trim();
      var etapaReg = (a[5] == null) ? '' : a[5].toString().trim();
      if (fecha === fechaHoy && idUsuario === uidStr && etapaReg === etapa) {
        return { habilitado: false, mensaje: "Ya registraste tu " + etapa + " hoy." };
      }
    }
  }

  var categoria = (!horaIdeal || horaActualStr <= horaIdeal) ? "A tiempo" : "Retraso";
  return { habilitado: true, etapa: etapa, categoria: categoria, hora: horaActualStr };
}

function registrarMarcacion(uid, nombreUsuario, etapa, categoria) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Registro_Asistencia');
  if (!sheet) throw new Error('No existe la hoja "Registro_Asistencia".');

  var now = new Date();
  var fechaHoy = Utilities.formatDate(now, "America/Bogota", "dd/MM/yyyy");
  var horaExactaStr = Utilities.formatDate(now, "America/Bogota", "HH:mm:ss");

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
    (uid == null) ? '' : uid.toString().trim(),
    (nombreUsuario == null) ? '' : nombreUsuario.toString().trim(),
    (etapa == null) ? '' : etapa.toString().trim(),
    (categoria == null) ? '' : categoria.toString().trim()
  ]);

  return { exito: true, mensaje: "Registro exitoso: " + ((etapa == null) ? '' : etapa.toString().trim()) };
}

function normalizarHoraHHmm_(valor) {
  if (valor == null) return '';
  var s = valor.toString().trim();
  if (!s) return '';
  var parts = s.split(':');
  if (!parts.length) return '';
  var hh = (parts[0] || '').toString().padStart(2, '0');
  var mm = (parts[1] || '00').toString().padStart(2, '0');
  return hh + ':' + mm;
}
