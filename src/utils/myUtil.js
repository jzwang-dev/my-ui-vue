export function getEnv() {
  return process.env.NODE_ENV;
}

export function isEnv(env) {
  return getEnv() === env;
}

export function isDevelopmentEnv() {
  return isEnv('development');
}

export function devLog() {
  if (isDevelopmentEnv()) {
    console.log.apply(this, arguments);
  }
}

export function typeToString(type) {
  let typeStr = type.toString();
  typeStr = typeStr.substring(9, typeStr.indexOf('()'));
  return typeStr;
}

export default {
  getEnv,
  isEnv,
  isDevelopmentEnv,
  devLog,
  typeToString
};
