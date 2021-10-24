class Return extends Error {
  constructor(value) {
    super(value);
    this.value = value;
  }
}
module.exports = Return;
