import myUtil from './myUtil';

async function exportExcel(
  exportItems,
  exportColumns,
  fileName = 'export_data',
  title = '',
  options = {}
) {
  myUtil.devLog(
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
  myUtil.devLog(
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
