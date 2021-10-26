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
    const initializer = this.findMethod('init');
    if (initializer !== null) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }

  arity() {
    const initializer = this.findMethod('init');
    if (initializer === null) return 0;
    return initializer.arity();
  }

  toString() {
    return this.name;
  }
}
module.exports = LoxClass;
