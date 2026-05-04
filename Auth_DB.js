function validarAccesoUsuario(correoInput) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Base_Usuarios');
  if (!sheet) return { exito: false, mensaje: "Usuario no encontrado o inactivo." };

  var correoBuscado = (correoInput == null) ? '' : correoInput.toString().trim().toLowerCase();
  if (!correoBuscado) return { exito: false, mensaje: "Usuario no encontrado o inactivo." };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i] || [];
    var correo = (r[1] == null) ? '' : r[1].toString().trim().toLowerCase();
    if (correo !== correoBuscado) continue;

    var estado = (r[7] == null) ? '' : r[7].toString().trim();
    if (estado !== 'Activo' && estado !== 'activo') return { exito: false, mensaje: "Usuario no encontrado o inactivo." };

    return {
      exito: true,
      usuario: {
        id: r[0],
        correo: r[1],
        nombre: r[2],
        identificacion: r[3],
        cargo: r[4],
        rol_id: r[5],
        id_jefe: r[6]
      }
    };
  }

  return { exito: false, mensaje: "Usuario no encontrado o inactivo." };
}
