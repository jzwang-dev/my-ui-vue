function _alert(message) {
  return new Promise((resolve) => {
    alert(message);
    resolve();
  });
}

function _confirm(message) {
  return new Promise((resolve) => {
    resolve(confirm(message));
  });
}

function _prompt(message, _default) {
  return new Promise((resolve) => {
    resolve(prompt(message, _default));
  });
}

function toast(message, type = "warning") {
  return new Promise((resolve) => {
    console.log(`${type}: ${message}`);
    resolve();
  });
}

export default {
  alert: _alert,
  confirm: _confirm,
  prompt: _prompt,
  toast,
};
