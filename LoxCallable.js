class LoxCallable {
  constructor(callee) {
    this.callee = callee;

    this.call = this.call.bind(this);
    this.arity = this.arity.bind(this);
  }

  call(interpreter, args) {
    this.callee.call(interpreter, args);
  }

  arity() {
    return 0;
  }
}
module.exports = LoxCallable;
