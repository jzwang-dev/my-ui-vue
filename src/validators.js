function required(errMsg = '此為必填欄位') {
  return (value) => {
    if (Array.isArray(value) && value.length === 0) {
      return errMsg;
    }

    return value === 0 || !!value || errMsg;
  };
}

function requiredIf(testFunc, errMsg = '此為必填欄位') {
  if (
    !testFunc ||
    Object.prototype.toString.call(testFunc) !== '[object Function]'
  ) {
    testFunc = () => true;
  }

  return (value, item) => !testFunc(value, item) || required(errMsg)(value);
}

function minlength(length, errMsg = `字數至少為 ${length} 字`) {
  return (value) => {
    value = value?.toString();
    return !value || value.length >= length || errMsg;
  };
}

function maxlength(length, errMsg = `字數至多為 ${length} 字`) {
  return (value) => {
    value = value?.toString();
    return !value || value.length <= length || errMsg;
  };
}

function min(minimal, errMsg = `最小值為 ${minimal}`) {
  return (value) => !value || value >= minimal || errMsg;
}

function max(maximal, errMsg = `最大值為 ${maximal}`) {
  return (value) => !value || value <= maximal || errMsg;
}

function range(
  minimal,
  maximal,
  errMsg = `請輸入介於 ${minimal} 到 ${maximal} 之間的值`
) {
  return (value) => !value || (minimal <= value && value <= maximal) || errMsg;
}

function compareTo(valueToCompare, operator = '==', errMsg = '比較結果不成立') {
  return (value) => {
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
}

function compareByKey(
  compareToItemKey,
  operator = '==',
  errMsg = '比較結果不成立'
) {
  return (value, item) =>
    compareTo(item[compareToItemKey], operator, errMsg)(value);
}

function regex(regex, errMsg = '格式不正確') {
  if (Object.prototype.toString.call(regex) !== '[object RegExp]') {
    regex = new RegExp(regex);
  }

  return (value) => {
    value = value?.toString();
    return !value || regex.test(value) || errMsg;
  };
}

function email(errMsg = '請輸入正確的Email格式') {
  return (value) =>
    regex(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4})*$/, errMsg)(value);
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
