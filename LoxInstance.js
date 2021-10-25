const RuntimeError = require('./RuntimeError');

class LoxInstance {
  constructor(klass) {
    this.klass = klass;

    this.fields = new Map();

    this.toString = this.toString.bind(this);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
  }

  toString() {
    return this.klass.name + ' instance';
  }

  get(name) {
    if (this.fields.has(name.lexeme)) {
      return fields.get(name.lexeme);
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method !== null) return method;

    throw new RuntimeError(name,
      `Undefined property \'${name.lexeme}\'.`);
  }

  set(name, value) {
    this.fields.set(name.lexeme, value);
  }
}
module.exports = LoxInstance;
