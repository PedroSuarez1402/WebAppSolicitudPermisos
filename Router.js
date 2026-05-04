/**
 * Gestiona las solicitudes GET para cargar el Formulario o el Dashboard
 */
function doGet(e) {
  // Verificamos si en la URL viene el parámetro "?v=admin"
  if (e.parameter.v === 'admin') {
    var template = HtmlService.createTemplateFromFile('admin');
    return template.evaluate()
      .setTitle('Dashboard TH - Permisos Laborales')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  // Si no hay parámetro, carga el formulario por defecto (para los empleados)
  var template = HtmlService.createTemplateFromFile('formulario');
  return template.evaluate()
    .setTitle('Solicitud de Permisos Laborales')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Función auxiliar para incluir archivos HTML (CSS y JS) dentro de las plantillas
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}