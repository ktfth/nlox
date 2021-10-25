class LoxInstance {
  constructor(klass) {
    this.klass = klass;

    this.toString = this.toString.bind(this);
  }

  toString() {
    return this.klass.name + ' instance';
  }
}
module.exports = LoxInstance;
