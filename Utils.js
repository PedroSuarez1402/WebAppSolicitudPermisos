/**
 * Busca o crea la carpeta de adjuntos en Drive
 */
function obtenerOCrearCarpetaAdjuntos() {
  const ssId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const carpetaPadre = DriveApp.getFileById(ssId).getParents().next();
  const nombreCarpeta = "Adjuntos_Solicitudes_Permisos";
  
  const carpetas = carpetaPadre.getFoldersByName(nombreCarpeta);
  if (carpetas.hasNext()) return carpetas.next();
  return carpetaPadre.createFolder(nombreCarpeta);
}

/**
 * Convierte objetos Date a formato legible de texto dd/MM/yyyy
 */
function formatearFechaDDMMYYYY_(valor) {
  if (!valor) return "";
  if (Object.prototype.toString.call(valor) === "[object Date]" && !isNaN(valor.getTime())) {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), "dd/MM/yyyy");
  }
  return String(valor).trim();
}

/**
 * Lee datos omitiendo el encabezado y valida si la hoja tiene contenido
 */
function leerDatosDesdeFila2_(sheet) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
}