function getEnv() {
  return process.env.NODE_ENV;
}

function isEnv(env) {
  return getEnv() === env;
}

function isDevelopmentEnv() {
  return isEnv("development");
}

function devLog() {
  if (isDevelopmentEnv()) {
    console.log.apply(this, arguments);
  }
}

function typeToString(type) {
  let typeStr = type.toString();
  typeStr = typeStr.substring(9, typeStr.indexOf("()"));
  return typeStr;
}

function setLoading(loading) {
  console.log(`loading: ${loading}`);
}

function formatValue(format, value) {
  if (format == null) {
    return value;
  }

  if (Object.prototype.toString.call(format) === "[object Function]") {
    value = format(value);
  } else if (Array.isArray(format)) {
    for (let el of format) {
      if (Object.prototype.toString.call(el) === "[object Function]") {
        value = el(value);
      }
    }
  }

  return value;
}

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomIntString(length) {
  const max = 10 ** length - 1;
  return randomInt(0, max).toString().padStart(length, "0");
}

function randomId(length = 5, prefix = "id_") {
  return `${prefix}${randomIntString(length)}`;
}

function timestamp() {
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return performance.now();
  }

  return Date.now();
}

function uuid() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  let d = timestamp();

  return "xxxxxxxx-xxxx-4xxx-Nxxx-xxxxxxxxxxxx".replace(/[xN]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function valueToString(value) {
  const valueType = Object.prototype.toString.call(value);
  let valueString = "";
  if (valueType === "[object Object]" || valueType === "[object Array]") {
    valueString = JSON.stringify(value);
  } else {
    valueString = value?.toString();
  }
  return valueString ?? "";
}

export default {
  getEnv,
  isEnv,
  isDevelopmentEnv,
  devLog,
  typeToString,
  setLoading,
  formatValue,
  randomInt,
  randomIntString,
  randomId,
  timestamp,
  uuid,
  valueToString,
};
