/**
 * Obtiene y limpia todas las solicitudes para el Dashboard (Llama a Utils.gs)
 */
function obtenerSolicitudesAdmin() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Registro_Permisos");
    var datos = leerDatosDesdeFila2_(sheet);
    if (!datos.length) return [];

    for (var i = 0; i < datos.length; i++) {
      for (var j = 0; j < datos[i].length; j++) {
        var celda = datos[i][j];
        if (Object.prototype.toString.call(celda) === '[object Date]') {
          if (j === 1 || j === 6 || j === 7) {
            datos[i][j] = formatearFechaDDMMYYYY_(celda);
          } else if (j === 8 || j === 9) {
            datos[i][j] = Utilities.formatDate(celda, Session.getScriptTimeZone(), "HH:mm");
          } else {
            datos[i][j] = celda.toString();
          }
        } else {
          datos[i][j] = (celda !== null && celda !== undefined) ? celda.toString().trim() : "";
        }
      }
    }
    return datos;
  } catch (e) {
    throw new Error("obtenerSolicitudesAdmin: " + e.message);
  }
}

function obtenerEmpleadosAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Base_Usuarios");
  var rows = leerDatosDesdeFila2_(sheet);
  return (rows || [])
    .filter(function (r) {
      var rol = (r && r[5] != null) ? r[5].toString().trim() : "";
      return rol !== "2";
    })
    .map(function (r) {
      return [
        (r && r[0] != null) ? r[0].toString().trim() : "",
        (r && r[1] != null) ? r[1].toString().trim() : "",
        (r && r[2] != null) ? r[2].toString().trim() : "",
        (r && r[3] != null) ? r[3].toString().trim() : "",
        (r && r[4] != null) ? r[4].toString().trim() : "",
        (r && r[6] != null) ? r[6].toString().trim() : "",
        (r && r[7] != null) ? r[7].toString().trim() : ""
      ];
    });
}

function obtenerJefesAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Base_Usuarios");
  var rows = leerDatosDesdeFila2_(sheet);
  return (rows || [])
    .filter(function (r) {
      var rol = (r && r[5] != null) ? r[5].toString().trim() : "";
      return rol === "2";
    })
    .map(function (r) {
      return [
        (r && r[0] != null) ? r[0].toString().trim() : "",
        (r && r[2] != null) ? r[2].toString().trim() : "",
        (r && r[1] != null) ? r[1].toString().trim() : "",
        (r && r[7] != null) ? r[7].toString().trim() : ""
      ];
    });
}

function obtenerUsuariosAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Base_Usuarios");
  return leerDatosDesdeFila2_(sheet);
}

function obtenerMotivosAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Motivos_Solicitud");
  return leerDatosDesdeFila2_(sheet);
}

function actualizarEstadoSolicitudAdmin(idSolicitud, nuevoEstado) {
  try {
    var id = (idSolicitud !== null && idSolicitud !== undefined) ? idSolicitud.toString().trim() : "";
    if (!id) return { exito: false, error: "idSolicitud vacío" };

    var estado = (nuevoEstado !== null && nuevoEstado !== undefined) ? nuevoEstado.toString().trim().toUpperCase() : "";
    if (estado !== "APROBADO" && estado !== "RECHAZADO") {
      return { exito: false, error: "nuevoEstado inválido (use APROBADO o RECHAZADO)" };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Registro_Permisos");
    if (!sheet) return { exito: false, error: 'No existe la hoja "Registro_Permisos"' };

    var lastRow = sheet.getLastRow();
    if (lastRow < 1) return { exito: false, error: "La hoja no tiene datos" };

    if (lastRow >= 2) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if ((ids[i][0] !== null && ids[i][0] !== undefined ? ids[i][0].toString().trim() : "") === id) {
          sheet.getRange(i + 2, 19).setValue(estado);
          return { exito: true, mensaje: "Actualizado" };
        }
      }
    }

    var idFila1 = sheet.getRange(1, 1).getValue();
    if ((idFila1 !== null && idFila1 !== undefined ? idFila1.toString().trim() : "") === id) {
      sheet.getRange(1, 19).setValue(estado);
      return { exito: true, mensaje: "Actualizado" };
    }

    return { exito: false, error: "No se encontró la solicitud con ese idSolicitud" };
  } catch (e) {
    return { exito: false, error: "actualizarEstadoSolicitudAdmin: " + e.message };
  }
}
