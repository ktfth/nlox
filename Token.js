class Token {
  constructor(type, lexeme, literal, line) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;

    this.toString = this.toString.bind(this);
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
modul.exports = Token;
