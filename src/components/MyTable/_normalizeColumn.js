import { defaultControlTypes, controlAllowedDataTypes } from '../../configs';
import myUtil from '../../utils/myUtil';

function _normalizeColumn(column) {
  const normalizedColumn = Object.assign(
    {
      header: column.key,
      displayable: true,
      value: (item) => item[column.key],
      defaultValue: null,
      format: (value) => value,
      nullText: '--',
      sort: null,
      sortable: true,
      thClass: null,
      thStyle: null,
      tdClass: null,
      tdStyle: null,
      exportable: true,
      valueToExport: (item) => item[column.key],
      editable: true,
      valueToEdit: (item) => item[column.key],
      dataType: String,
      validators: [],
      errors: [],
      errorsSeparator: ', '
    },
    column,
    {
      control: Object.assign(
        {
          type: defaultControlTypes[column.dataType ?? String],
          cssClass: null,
          style: null,
          dataSource: [],
          dataValueField: 'value',
          dataTextField: 'text',
          showEmptyOption: true,
          emptyOptionValue: '',
          emptyOptionText: '-請選擇-',
          inline: false,
          trueValue: true,
          falseValue: false
        },
        column.control
      ),
      validationMode: Object.assign(
        {
          greedy: false,
          lazy: false
        },
        column.validationMode
      )
    }
  );

  const allowedDataTypes =
    controlAllowedDataTypes[normalizedColumn.control.type];
  if (!allowedDataTypes.includes(normalizedColumn.dataType)) {
    console.log(
      `[warning] 欄位 ${normalizedColumn.key} 的 control.type 為「${
        normalizedColumn.control.type
      }」，其 dataType (${myUtil.typeToString(
        normalizedColumn.dataType
      )}) 是否有誤？ (allowedDataTypes: ${allowedDataTypes
        .map((type) => myUtil.typeToString(type))
        .join(', ')})`
    );
  }

  return normalizedColumn;
}

export default _normalizeColumn;
