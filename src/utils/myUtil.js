export const getEnv = () => {
  return process.env.NODE_ENV;
};

export const isEnv = (env) => {
  return getEnv() === env;
};

export const isDevelopmentEnv = () => {
  return isEnv('development');
};

export function devLog() {
  if (isDevelopmentEnv()) {
    console.log.apply(this, arguments);
  }
}

export default {
  getEnv,
  isEnv,
  isDevelopmentEnv,
  devLog
};
