const LoxInstance = require('./LoxInstance');

class LoxClass {
  constructor(name) {
    this.name = name;

    this.toString = this.toString.bind(this);
    this.call = this.call.bind(this);
    this.arity = this.arity.bind(this);
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
