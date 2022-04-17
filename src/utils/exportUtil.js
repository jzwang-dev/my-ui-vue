import messageUtil from '../utils/messageUtil';
import myUtil from '../utils/myUtil';
import { saveAs } from 'file-saver';

async function exportExcel(
  exportItems,
  exportColumns,
  exportName = 'export_data',
  options = {}
) {
  options = Object.assign(
    {
      title: '',
      titleAlignmentHorizontal: 'center',
      titleAlignmentVertical: 'middle',
      titleAlignmentWrapText: false,
      columnWidthTolerance: 5
    },
    options
  );

  if (!exportItems || !Array.isArray(exportItems) || exportItems.length === 0) {
    messageUtil.alert('沒有可供匯出的資料！');
    return;
  }

  try {
    myUtil.setLoading(true);

    exportItems.forEach((exportItem) => {
      for (let key in exportItem) {
        exportItem[key] = exportItem[key] ?? '';
      }
    });

    const exceljs = await import(
      /* webpackChunkName: "exceljs" */
      /* webpackPrefetch: true */
      'exceljs'
    );

    const defaultBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet();

    let rowNum = 1;
    let titleRowNum = null,
      headerRowNum = null;

    if (options.title) {
      titleRowNum = rowNum;
      rowNum++;
      const titleRow = worksheet.getRow(titleRowNum);
      titleRow.font = { bold: true, size: 13 };
      const titleCell = titleRow.getCell(1);
      titleCell.value = options.title;
      titleCell.border = defaultBorder;
      titleCell.alignment = {
        wrapText: options.titleAlignmentWrapText,
        vertical: options.titleAlignmentVertical,
        horizontal: options.titleAlignmentHorizontal
      };
      worksheet.mergeCells(1, 1, 1, exportColumns.length);
    }

    headerRowNum = rowNum;
    rowNum++;
    const headerRow = worksheet.getRow(headerRowNum);
    headerRow.font = { bold: true };
    exportColumns.forEach((exportColumn, index) => {
      const headerCell = headerRow.getCell(index + 1);
      headerCell.value = exportColumn.header;
      headerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'f3f3f3' }
      };
      headerCell.border = defaultBorder;
      headerCell.alignment = {
        wrapText: true,
        vertical: 'middle',
        horizontal: 'left'
      };
    });

    exportItems.forEach((exportItem) => {
      const row = worksheet.getRow(rowNum);
      rowNum++;
      exportColumns.forEach((exportColumn, index) => {
        const cell = row.getCell(index + 1);
        cell.value = exportItem[exportColumn.key];
        cell.border = defaultBorder;
        cell.alignment = {
          wrapText: true,
          vertical: 'middle',
          horizontal: 'left'
        };
      });
    });

    // fix column width
    const strLen = (str) => {
      return (
        str?.split('').reduce((prev, curr) => {
          const charCode = curr.charCodeAt(0);
          const length = charCode >= 32 && charCode <= 126 ? 1 : 2;
          return prev + length;
        }, 0) ?? 0
      );
    };
    for (let i = 0; i < worksheet.columns.length; i++) {
      const worksheetColumn = worksheet.columns[i];
      const exportColumn = exportColumns[i];

      if (exportColumn.width != null) {
        worksheetColumn.width = exportColumn.width;
        continue;
      }

      const _minWidth = exportColumn._minWidth ?? 10;
      const _maxWidth = exportColumn._maxWidth;

      const cellValueLengths = [];
      worksheetColumn.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber >= headerRowNum) {
          const cellValue = cell.value?.toString() ?? '';
          const cellValueLines = cellValue.split('\n');
          for (let cellValueLine of cellValueLines) {
            cellValueLengths.push(strLen(cellValueLine));
          }
        }
      });

      let columnWidth =
        (Math.max(...cellValueLengths) + options.columnWidthTolerance) * 1.15;
      columnWidth = Math.max(_minWidth, columnWidth);
      if (_maxWidth && columnWidth > _maxWidth) {
        columnWidth = _maxWidth;
      }

      worksheetColumn.width = columnWidth;
    }

    const buffer = await workbook.xlsx.writeBuffer();

    myUtil.setLoading(false);
    saveAs(new Blob([buffer]), `${exportName}.xlsx`);
  } catch (err) {
    console.log(err);
    let errMsg = '匯出Excel時發生錯誤！';
    if (
      err.message === '不正確的字元集範圍' ||
      err.message === 'Invalid range in character set'
    ) {
      errMsg = '您的瀏覽器不支援匯出Excel，請使用建議的瀏覽器再試一次。';
    }
    messageUtil.alert(errMsg);
  } finally {
    myUtil.setLoading(false);
  }
}

async function exportPdf(
  exportItems,
  exportColumns,
  exportName = 'export_data',
  options = {}
) {
  options = Object.assign(
    {
      title: ''
    },
    options,
    {
      docDefinition: Object.assign(
        {
          pageSize: 'A4',
          pageOrientation: 'landscape',
          pageMargins: [5, 5, 5, 5]
        },
        options?.docDefinition
      )
    }
  );

  if (!exportItems || !Array.isArray(exportItems) || exportItems.length === 0) {
    messageUtil.alert('沒有可供匯出的資料！');
    return;
  }

  try {
    myUtil.setLoading(true);

    exportItems.forEach((exportItem) => {
      for (let key in exportItem) {
        exportItem[key] = exportItem[key] ?? '';
      }
    });

    const modules = await Promise.all([
      import(
        /* webpackChunkName: "pdfmake" */
        /* webpackPrefetch: true */
        'pdfmake/build/pdfmake'
      ),
      import(
        /* webpackChunkName: "vfs_fonts" */
        /* webpackPrefetch: true */
        '../assets/vfs_fonts'
      )
    ]);
    const pdfmake = modules[0].default;
    const vfs_fonts = modules[1];
    pdfmake.vfs = vfs_fonts;

    pdfmake.fonts = {
      NotoSansTC: {
        normal: 'NotoSansTC-Regular.woff2'
      }
    };

    const tableBody = [];

    if (options.title) {
      const titleRow = exportColumns.map(() => ({}));
      titleRow[0] = {
        text: options.title,
        colSpan: exportColumns.length,
        alignment: 'center'
      };
      tableBody.push(titleRow);
    }

    tableBody.push(
      exportColumns.map((exportColumn) => ({
        text: exportColumn.header,
        fillColor: '#cccccc'
      }))
    );
    exportItems.forEach((exportItem) => {
      const row = [];
      exportColumns.forEach((exportColumn) => {
        row.push(exportItem[exportColumn.key]);
      });
      tableBody.push(row);
    });

    let dd = Object.assign(
      {
        defaultStyle: {
          font: 'NotoSansTC'
        },
        content: [
          {
            table: {
              body: tableBody
            }
          }
        ]
      },
      options.docDefinition
    );

    myUtil.setLoading(false);
    pdfmake.createPdf(dd).download(`${exportName}.pdf`);
  } catch (err) {
    console.log(err);
    messageUtil.alert('匯出Pdf時發生錯誤！');
  } finally {
    myUtil.setLoading(false);
  }
}

export default {
  exportExcel,
  exportPdf
};
