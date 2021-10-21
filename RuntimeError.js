class RuntimeError extends Error {
  constructor(token, message) {
    super(message);
    this.token = token;
  }
}
module.exports = RuntimeError;
