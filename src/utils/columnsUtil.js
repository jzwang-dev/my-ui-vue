function validateItemField(value, column, item) {
  column.errors = [];
  for (let validator of column.validators ?? []) {
    if (Object.prototype.toString.call(validator) !== "[object Function]") {
      continue;
    }
    const result = validator(value, item);
    if (result !== true) {
      column.errors.push(result);
      if (column.validationMode?.greedy !== true) {
        break;
      }
    }
  }
  return column.errors.length === 0;
}

function validateItem(columns, item) {
  clearErrors(columns);
  if (!item) {
    return;
  }
  let valid = true;
  for (let column of columns) {
    if (
      column.modifyVisible === false ||
      (column.visibleInModifyFormIf && !column.visibleInModifyFormIf(item))
    ) {
      continue;
    }

    if (!validateItemField(item[column.key], column, item)) {
      valid = false;
    }
  }
  return valid;
}

function clearErrors(columns) {
  for (let column of columns) {
    column.errors = [];
  }
}

function getErrors(columns) {
  return columns
    .map((column) => {
      const errors = column.errors ?? [];
      return {
        key: column.key,
        errors,
        errMsg: errors.join(column.errorsSeparator || ", "),
      };
    })
    .filter((column) => column.errors.length);
}

function validateColumn(value, column, item) {
  if (column.validationMode?.lazy !== true) {
    return validateItemField(value, column, item);
  }
}

function isColumnRequired(column, item) {
  const isRequired = column.validators?.some(
    (validator) =>
      validator.validatorName === "required" ||
      (validator.validatorName === "requiredIf" && validator.testFunc(item))
  );
  return isRequired;
}

function normalizeDataSource(
  dataSource,
  dataValueField = "value",
  dataTextField = "text"
) {
  if (
    dataSource.every((dataItem) =>
      [dataValueField, dataTextField].every((p) =>
        Object.prototype.hasOwnProperty.call(dataItem, p)
      )
    )
  ) {
    return dataSource;
  }

  return dataSource.map((dataItem) => ({
    [dataValueField]: dataItem?.toString(),
    [dataTextField]: dataItem?.toString(),
  }));
}

export default {
  validateItemField,
  validateItem,
  clearErrors,
  getErrors,
  validateColumn,
  isColumnRequired,
  normalizeDataSource,
};
