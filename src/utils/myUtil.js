function getEnv() {
  return process.env.NODE_ENV;
}

function isEnv(env) {
  return getEnv() === env;
}

function isDevelopmentEnv() {
  return isEnv('development');
}

function devLog() {
  if (isDevelopmentEnv()) {
    console.log.apply(this, arguments);
  }
}

function typeToString(type) {
  let typeStr = type.toString();
  typeStr = typeStr.substring(9, typeStr.indexOf('()'));
  return typeStr;
}

function setLoading(loading) {
  console.log(`loading: ${loading}`);
}

function formatValue(format, value) {
  if (format == null) {
    return value;
  }

  if (Object.prototype.toString.call(format) === '[object Function]') {
    value = format(value);
  } else if (Array.isArray(format)) {
    for (let el of format) {
      if (Object.prototype.toString.call(el) === '[object Function]') {
        value = el(value);
      }
    }
  }

  return value;
}

export default {
  getEnv,
  isEnv,
  isDevelopmentEnv,
  devLog,
  typeToString,
  setLoading,
  formatValue
};
