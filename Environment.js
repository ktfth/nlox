const RuntimeError = require('./RuntimeError');

class Environment {
  constructor() {
    this.values = new Map();

    this.define = this.define.bind(this);
    this.get = this.get.bind(this);
  }

  define(name, value) {
    this.values.set(name, value);
  }

  get(name) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    throw new RuntimeError(name,
      `Undefined variable '${name.lexeme}'.`);
  }
}
module.exports = Environment;
