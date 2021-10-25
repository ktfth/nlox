const RuntimeError = require('./RuntimeError');

class Environment {
  constructor(enclosing) {
    this.values = new Map();
    this.enclosing = enclosing;

    this.define = this.define.bind(this);
    this.get = this.get.bind(this);
    this.assign = this.assign.bind(this);
    this.getAt = this.getAt.bind(this);
    this.ancestor = this.ancestor.bind(this);
    this.assignAt = this.assignAt.bind(this);
  }

  define(name, value) {
    this.values.set(name, value);
  }

  ancestor(distance) {
    let environment = this;
    for (let i = 0; i < distance; i += 1) {
      environment = environment.enclosing;
    }

    return environment;
  }

  getAt(distance, name) {
    return this.ancestor(distance).values.get(name);
  }

  assignAt(distance, name, value) {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  get(name) {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(name,
      `Undefined variable '${name.lexeme}'.`);
  }

  assign(name, value) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name,
      `Undefined variable '${name.lexeme}'.`);
  }
}
module.exports = Environment;
