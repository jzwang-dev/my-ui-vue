function required(errMsg = '此為必填欄位') {
  const validator = (value) => {
    if (Array.isArray(value) && value.length === 0) {
      return errMsg;
    }

    return value === 0 || !!value || errMsg;
  };
  validator.validatorName = 'required';
  return validator;
}

function requiredIf(testFunc, errMsg = '此為必填欄位') {
  if (
    !testFunc ||
    Object.prototype.toString.call(testFunc) !== '[object Function]'
  ) {
    testFunc = () => true;
  }

  const validator = (value, item) =>
    !testFunc(value, item) || required(errMsg)(value);
  validator.validatorName = 'requiredIf';
  validator.testFunc = testFunc;
  return validator;
}

function minlength(length, errMsg = `字數至少為 ${length} 字`) {
  const validator = (value) => {
    value = value?.toString();
    return !value || value.length >= length || errMsg;
  };
  validator.validatorName = 'minlength';
  return validator;
}

function maxlength(length, errMsg = `字數至多為 ${length} 字`) {
  const validator = (value) => {
    value = value?.toString();
    return !value || value.length <= length || errMsg;
  };
  validator.validatorName = 'maxlength';
  return validator;
}

function min(minimal, errMsg = `最小值為 ${minimal}`) {
  const validator = (value) => !value || value >= minimal || errMsg;
  validator.validatorName = 'min';
  return validator;
}

function max(maximal, errMsg = `最大值為 ${maximal}`) {
  const validator = (value) => !value || value <= maximal || errMsg;
  validator.validatorName = 'max';
  return validator;
}

function range(
  minimal,
  maximal,
  errMsg = `請輸入介於 ${minimal} 到 ${maximal} 之間的值`
) {
  const validator = (value) =>
    !value || (minimal <= value && value <= maximal) || errMsg;
  validator.validatorName = 'range';
  return validator;
}

function compareTo(valueToCompare, operator = '==', errMsg = '比較結果不成立') {
  const validator = (value) => {
    switch (operator) {
      case '<':
        return value < valueToCompare || errMsg;
      case '>':
        return value > valueToCompare || errMsg;
      case '<=':
        return value <= valueToCompare || errMsg;
      case '>=':
        return value >= valueToCompare || errMsg;
      case '==':
        return value == valueToCompare || errMsg;
      case '!=':
        return value != valueToCompare || errMsg;
      case '===':
        return value === valueToCompare || errMsg;
      case '!==':
        return value !== valueToCompare || errMsg;
      default:
        return errMsg;
    }
  };
  validator.validatorName = 'compareTo';
  return validator;
}

function compareByKey(
  compareToItemKey,
  operator = '==',
  errMsg = '比較結果不成立'
) {
  const validator = (value, item) =>
    compareTo(item[compareToItemKey], operator, errMsg)(value);
  validator.validatorName = 'compareByKey';
  return validator;
}

function regex(regex, errMsg = '格式不正確') {
  if (Object.prototype.toString.call(regex) !== '[object RegExp]') {
    regex = new RegExp(regex);
  }

  const validator = (value) => {
    value = value?.toString();
    return !value || regex.test(value) || errMsg;
  };
  validator.validatorName = 'regex';
  return validator;
}

function email(errMsg = '請輸入正確的Email格式') {
  const validator = (value) =>
    regex(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4})*$/, errMsg)(value);
  validator.validatorName = 'email';
  return validator;
}

export {
  required,
  requiredIf,
  minlength,
  maxlength,
  min,
  max,
  range,
  compareTo,
  compareByKey,
  regex,
  email
};