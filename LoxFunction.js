const Environment = require('./Environment');

class LoxFunction {
  constructor(declaration, closure, isInitializer) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;


    this.call = this.call.bind(this);
    this.arity = this.arity.bind(this);
    this.bind = this.bind.bind(this);
  }

  bind(instance) {
    const environment = new Environment(this.closure);
    environment.define('this', instance);
    return new LoxFunction(this.declaration, environment,
                           this.isInitializer);
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
      if (this.isInitializer) return this.closure.getAt(0, 'this');
      return returnValue.value;
    }

    if (this.isInitializer) return this.closure.getAt(0, 'this');
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
