//import myUtil from './myUtil';

async function exportExcel(
  exportItems,
  exportColumns,
  fileName = 'export_data',
  title = '',
  options = {}
) {
  console.log(
    'exportExcel',
    exportItems,
    exportColumns,
    fileName,
    title,
    options
  );
}

async function exportPdf(
  exportItems,
  exportColumns,
  fileName = 'export_data',
  title = '',
  docDefinition = {}
) {
  console.log(
    'exportPdf',
    exportItems,
    exportColumns,
    fileName,
    title,
    docDefinition
  );
}

export default {
  exportExcel,
  exportPdf
};
