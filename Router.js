/**
 * Gestiona las solicitudes GET para cargar el Formulario o el Dashboard
 */
function doGet(e) {
  var vista = e.parameter.v;
  
  if (vista === 'admin') {
    return HtmlService.createTemplateFromFile('admin').evaluate()
      .setTitle('Panel Administrativo - Talento Humano')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } else if (vista === 'formulario_permiso') {
    var template = HtmlService.createTemplateFromFile('formulario');
    template.uid = e.parameter.uid || '';
    return template.evaluate()
      .setTitle('Solicitud de Permisos')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } else {
    return HtmlService.createTemplateFromFile('index').evaluate()
      .setTitle('Portal Corporativo ANS')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

/**
 * Función auxiliar para incluir archivos HTML (CSS y JS) dentro de las plantillas
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
