/**
 * merge_planillas.gs
 *
 * Une Gastos_Barberia con stock-vatos-studio.
 * Copia las hojas "Gastos" y "Resumen" a stock-vatos-studio y
 * actualiza el Dashboard para mostrar el resumen de gastos.
 *
 * CÓMO USAR:
 *   1. Abrí stock-vatos-studio en Google Sheets.
 *   2. Extensiones → Apps Script → pegá este código → Guardar.
 *   3. Ejecutá la función  mergePlanillas().
 *   4. Aceptá los permisos cuando los pida.
 */

const GASTOS_ID = '1UXyAFziwFOqZ6FUadu7iYZ4q7WUHCxeX3iXhERdlSv4';
const STOCK_ID  = '1DfRcxg4-Ut7guRkJtLAR7nIoT4olMNnV5riPM5BBVhs';

function mergePlanillas() {
  const gastosFile = SpreadsheetApp.openById(GASTOS_ID);
  const stockFile  = SpreadsheetApp.openById(STOCK_ID);

  _copiarHoja(gastosFile, stockFile, 'Gastos');
  _copiarHoja(gastosFile, stockFile, 'Resumen');
  _actualizarDashboard(stockFile);

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('✅ Planillas unificadas correctamente en stock-vatos-studio.');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function _copiarHoja(origen, destino, nombre) {
  // Eliminar hoja previa si ya existe (para poder re-ejecutar sin duplicados)
  const existente = destino.getSheetByName(nombre);
  if (existente) destino.deleteSheet(existente);

  const hoja = origen.getSheetByName(nombre);
  if (!hoja) {
    Logger.log('Hoja no encontrada en origen: ' + nombre);
    return;
  }

  const copia = hoja.copyTo(destino);
  copia.setName(nombre);

  // Mover al final del archivo destino
  destino.moveActiveSheet(destino.getNumSheets());
  Logger.log('Hoja copiada: ' + nombre);
}

function _actualizarDashboard(stockFile) {
  const dashboard = stockFile.getSheetByName('Dashboard');
  if (!dashboard) return;

  // Buscar la primera fila vacía después del bloque de métricas existente
  // para agregar el bloque de Gastos sin pisar nada.
  const ultimaFila = dashboard.getLastRow();
  const filaGastos = ultimaFila + 2; // deja una fila en blanco

  dashboard.getRange(filaGastos, 1).setValue('RESUMEN DE GASTOS');
  dashboard.getRange(filaGastos, 1).setFontWeight('bold');

  // Encabezados
  const encabezados = ['Mes', 'Año', 'Gastos', 'Ingresos (ventas)', 'Neto'];
  dashboard.getRange(filaGastos + 1, 1, 1, encabezados.length).setValues([encabezados]);
  dashboard.getRange(filaGastos + 1, 1, 1, encabezados.length).setFontWeight('bold');

  // Fórmula que lee dinámicamente la hoja Resumen (que acabamos de copiar)
  // Copia las filas de meses desde Resumen!A4:E15 (12 meses) + fila de totales
  const formulaRango = `=IFERROR(Resumen!A4:E16, "Sin datos")`;
  dashboard.getRange(filaGastos + 2, 1).setFormula(formulaRango);

  // Nota al pie
  dashboard.getRange(filaGastos + 15, 1)
    .setValue('* Los datos de gastos se administran desde la hoja "Gastos".')
    .setFontStyle('italic');

  Logger.log('Dashboard actualizado con bloque de gastos.');
}
