function validateItemField(value, column, item) {
  column.errors = [];
  for (let validator of column.validators ?? []) {
    if (Object.prototype.toString.call(validator) !== '[object Function]') {
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
  return columns.map((column) => {
    const errors = column.errors ?? [];
    return {
      key: column.key,
      errors,
      errMsg: errors.join(column.errorsSeparator || ', ')
    };
  });
}

function handleColumnModelChange(value, column, item) {
  if (column.validationMode?.lazy !== true) {
    validateItemField(value, column, item);
  }
}

function isColumnRequired(column, item) {
  const isRequired = column.validators?.some(
    (validator) =>
      validator.validatorName === 'required' ||
      (validator.validatorName === 'requiredIf' &&
        validator.testFunc(item[column.key], item))
  );
  return isRequired;
}

export default {
  validateItemField,
  validateItem,
  clearErrors,
  getErrors,
  handleColumnModelChange,
  isColumnRequired
};
