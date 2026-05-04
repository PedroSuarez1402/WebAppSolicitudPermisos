/**
 * Procesa y guarda la solicitud enviada por el empleado
 */
function procesarSolicitud(datos) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetRegistro = ss.getSheetByName('Registro_Permisos');
    
    let urlAdjunto = "";

    // 1. Procesar archivo adjunto si existe (Llama a Utils.gs)
    if (datos.archivo && datos.archivo.base64) {
      const carpeta = obtenerOCrearCarpetaAdjuntos();
      const blob = Utilities.newBlob(
        Utilities.base64Decode(datos.archivo.base64.split(",")[1]), 
        datos.archivo.type, 
        "Adjunto_" + datos.identificacion + "_" + datos.archivo.name
      );
      const archivoCreado = carpeta.createFile(blob);
      urlAdjunto = archivoCreado.getUrl();
    }

    // 2. Generar ID consecutivo
    let idSolicitud = "PER-001";
    const ultimaFila = sheetRegistro.getLastRow();
    if (ultimaFila > 1) {
      const ultimoId = sheetRegistro.getRange(ultimaFila, 1).getValue().toString();
      const match = ultimoId.match(/PER-(\d+)/);
      if (match) {
        const siguienteNum = parseInt(match[1], 10) + 1;
        idSolicitud = "PER-" + siguienteNum.toString().padStart(3, '0');
      }
    }

    // 3. Preparar los datos para la fila
    const nuevaFila = [
      idSolicitud,                   // A
      new Date(),                    // B
      datos.id_empleado,             // C
      datos.nombre,                  // D
      datos.correo,                  // E
      datos.cargo,                   // F
      datos.fecha_inicio,            // G
      datos.fecha_fin,               // H
      datos.hora_inicio || "--",     // I
      datos.hora_fin || "--",        // J
      datos.horas_estimadas,         // K
      datos.motivo,                  // L
      datos.observaciones,           // M
      urlAdjunto,                    // N
      datos.id_jefe,                 // O
      datos.jefe_inmediato,          // P
      datos.correo_jefe,             // Q
      "PENDIENTE",                   // R
      "PENDIENTE"                    // S
    ];

    sheetRegistro.appendRow(nuevaFila);
    return { exito: true, mensaje: "Solicitud " + idSolicitud + " registrada correctamente." };

  } catch (error) {
    return { exito: false, mensaje: "Error en el servidor: " + error.toString() };
  }
}

/**
 * Busca un empleado por su número de identificación
 */
function buscarEmpleadoPorIdentificacion(identificacionIngresada) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUsuarios = ss.getSheetByName('Base_Usuarios');
  if (!sheetUsuarios) return { error: 'No existe la hoja "Base_Usuarios".' };

  const rows = sheetUsuarios.getDataRange().getValues();
  const identificacionLimpia = identificacionIngresada.toString().trim();

  for (var i = 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const identificacionFila = (r[3] != null) ? r[3].toString().trim() : '';
    if (identificacionFila !== identificacionLimpia) continue;

    const estado = (r[7] != null) ? r[7].toString().trim() : '';
    if (estado.toLowerCase() !== 'activo') {
      return { error: "El usuario se encuentra inactivo. Comunícate con Talento Humano." };
    }

    const idJefe = (r[6] != null) ? r[6].toString().trim() : '';
    const datosJefe = buscarDatosJefePorId(ss, idJefe);

    return {
      id_empleado: (r[0] != null) ? r[0].toString().trim() : '',
      correo: (r[1] != null) ? r[1].toString().trim() : '',
      nombre: (r[2] != null) ? r[2].toString().trim() : '',
      identificacion: identificacionFila,
      cargo: (r[4] != null) ? r[4].toString().trim() : '',
      id_jefe: idJefe || "Pendiente",
      nombre_jefe: datosJefe.nombre,
      correo_jefe: datosJefe.correo,
      estado: estado,
      error: null
    };
  }

  return { error: "Identificación no encontrada." };
}

/**
 * Función interna para traer datos de contacto del jefe
 */
function buscarDatosJefePorId(ss, idJefe){
  var id = (idJefe == null) ? '' : idJefe.toString().trim();
  if (!id || id === "Pendiente" || id === "N/A") return { nombre: "", correo: "" };

  const sheetUsuarios = ss.getSheetByName('Base_Usuarios');
  if (!sheetUsuarios) return { nombre: "", correo: "" };

  const rows = sheetUsuarios.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const idFila = (r[0] != null) ? r[0].toString().trim() : '';
    if (idFila !== id) continue;
    return {
      nombre: (r[2] != null) ? r[2].toString().trim() : "",
      correo: (r[1] != null) ? r[1].toString().trim() : ""
    };
  }
  return { nombre: "", correo: "" };
}

/**
 * Obtiene la lista de motivos activos para el select del formulario
 */
function obtenerMotivos(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Motivos_Solicitud');
  const datos = sheet.getDataRange().getValues();
  const motivos = [];

  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][2] || "").trim() === "Activo") {
      motivos.push(String(datos[i][1] || "").trim());
    }
  }
  return motivos;
}
