const Environment = require('./Environment');

class LoxFunction {
  constructor(declaration, closure) {
    this.declaration = declaration;
    this.closure = closure;

    this.call = this.call.bind(this);
    this.arity = this.arity.bind(this);
    this.bind = this.bind.bind(this);
  }

  bind(instance) {
    const environment = new Environment(this.closure);
    environment.define('this', instance);
    return new LoxFunction(this.declaration, environment);
  }

  call(interpreter, args) {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme,
        args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      return returnValue.value;
    }
    return null;
  }

  arity() {
    return this.declaration.params.length;
  }

  toString() {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
module.exports = LoxFunction;
