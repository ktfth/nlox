const LoxInstance = require('./LoxInstance');

class LoxClass {
  constructor(name, methods) {
    this.name = name;
    this.methods = methods;

    this.toString = this.toString.bind(this);
    this.call = this.call.bind(this);
    this.arity = this.arity.bind(this);
    this.findMethod = this.findMethod.bind(this);
  }

  findMethod(name) {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    return null;
  }

  call(interpreter, args) {
    const instance = new LoxInstance(this);
    return instance;
  }

  arity() {
    return 0;
  }

  toString() {
    return this.name;
  }
}
module.exports = LoxClass;
