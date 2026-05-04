function cambiarEstadoRegistroAdmin(nombreHoja, idRegistro, nuevoEstado) {
  try {
    var hoja = (nombreHoja || "").toString().trim();
    if (!hoja) return { exito: false, error: "nombreHoja vacío" };
    if (hoja === "Base_Empleados" || hoja === "Base_Jefes") hoja = "Base_Usuarios";

    var id = (idRegistro !== null && idRegistro !== undefined) ? idRegistro.toString().trim() : "";
    if (!id) return { exito: false, error: "idRegistro vacío" };

    var estado = (nuevoEstado || "").toString().trim();
    var estadoNorm = estado.toLowerCase();
    if (estadoNorm === "activo") estado = "Activo";
    else if (estadoNorm === "inactivo") estado = "Inactivo";
    else return { exito: false, error: 'nuevoEstado inválido (use "Activo" o "Inactivo")' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(hoja);
    if (!sheet) return { exito: false, error: 'No existe la hoja "' + hoja + '"' };

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { exito: false, error: "No hay registros para actualizar" };

    var lastCol = sheet.getLastColumn();
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var val = (ids[i][0] !== null && ids[i][0] !== undefined) ? ids[i][0].toString().trim() : "";
      if (val === id) {
        sheet.getRange(i + 2, lastCol).setValue(estado);
        return { exito: true, mensaje: "Actualizado" };
      }
    }

    return { exito: false, error: "No se encontró el registro con ese ID" };
  } catch (e) {
    return { exito: false, error: "cambiarEstadoRegistroAdmin: " + e.message };
  }
}

function guardarEmpleadoAdmin(datos) {
  return guardarUsuarioAdmin_(
    "1",
    function (d, id, estadoActual) {
      return [
        id,
        d.correo || "",
        d.nombre || "",
        d.identificacion || "",
        d.cargo || "",
        "1",
        d.idJefe || "",
        estadoActual || "Activo"
      ];
    },
    datos
  );
}

function guardarJefeAdmin(datos) {
  return guardarUsuarioAdmin_(
    "2",
    function (d, id, estadoActual) {
      return [
        id,
        d.correo || "",
        d.nombre || "",
        "",
        "",
        "2",
        "",
        estadoActual || "Activo"
      ];
    },
    datos
  );
}

function guardarMotivoAdmin(datos) {
  return guardarRegistroAdmin_(
    "Motivos_Solicitud",
    "MOT-",
    ["id", "descripcion"],
    function (d, id, estadoActual) {
      return [id, d.descripcion || "", estadoActual || "Activo"];
    },
    datos
  );
}

function guardarUsuarioAdmin_(rolId, buildRowFn, datos) {
  return guardarRegistroAdmin_(
    "Base_Usuarios",
    "USR-",
    ["id", "correo", "nombre", "identificacion", "cargo", "idJefe"],
    function (d, id, estadoActual) {
      return buildRowFn(d, id, estadoActual);
    },
    datos,
    function (sheet, rowIndex) {
      var rolActual = sheet.getRange(rowIndex, 6).getValue();
      return (rolActual !== null && rolActual !== undefined) ? rolActual.toString().trim() : "";
    },
    rolId
  );
}

function guardarRegistroAdmin_(nombreHoja, prefijo, camposPermitidos, buildRowFn, datos, getRolActualFn, rolIdFijo) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(nombreHoja);
    if (!sheet) return { exito: false, error: 'No existe la hoja "' + nombreHoja + '"' };

    var d = datos || {};
    var id = (d.id !== null && d.id !== undefined) ? d.id.toString().trim() : "";

    camposPermitidos.forEach(function (k) {
      if (k === "id") return;
      if (d[k] === null || d[k] === undefined) d[k] = "";
      else d[k] = d[k].toString().trim();
    });

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (!id) {
      var nuevoId = generarSiguienteId_(sheet, prefijo);
      var row = buildRowFn(d, nuevoId, "Activo");
      sheet.appendRow(row);
      return { exito: true, mensaje: "Guardado", id: nuevoId };
    }

    if (lastRow < 2) return { exito: false, error: "No hay registros para editar" };

    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var val = (ids[i][0] !== null && ids[i][0] !== undefined) ? ids[i][0].toString().trim() : "";
      if (val === id) {
        var estadoActual = sheet.getRange(i + 2, lastCol).getValue();
        estadoActual = (estadoActual !== null && estadoActual !== undefined) ? estadoActual.toString().trim() : "";
        if (rolIdFijo && getRolActualFn) {
          var rolActual = getRolActualFn(sheet, i + 2);
          if (rolActual && rolActual !== rolIdFijo) return { exito: false, error: "El registro no corresponde al rol esperado" };
        }
        var rowEdit = buildRowFn(d, id, estadoActual || "Activo");
        sheet.getRange(i + 2, 1, 1, rowEdit.length).setValues([rowEdit]);
        return { exito: true, mensaje: "Actualizado", id: id };
      }
    }

    return { exito: false, error: "No se encontró el registro con ese ID" };
  } catch (e) {
    return { exito: false, error: "guardarRegistroAdmin_: " + e.message };
  }
}

function generarSiguienteId_(sheet, prefijo) {
  var lastRow = sheet.getLastRow();
  var maxNum = 0;
  if (lastRow >= 2) {
    var vals = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < vals.length; i++) {
      var v = (vals[i][0] !== null && vals[i][0] !== undefined) ? vals[i][0].toString().trim() : "";
      if (v.indexOf(prefijo) === 0) {
        var n = parseInt(v.slice(prefijo.length), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    }
  }
  var next = maxNum + 1;
  var numStr = ('000' + next).slice(-3);
  return prefijo + numStr;
}
