const {
  EOF,
  LEFT_PAREN,
  RIGHT_PAREN,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  STAR,
  BANG_EQUAL,
  BANG,
  EQUAL_EQUAL,
  EQUAL,
  LESS_EQUAL,
  LESS,
  GREATER_EQUAL,
  GREATER,
} = require('./TokenType');
const Token = require('./Token');

class Scanner {
  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 0;

    this.scanTokens = this.scanTokens.bind(this);
    this.isAtEnd = this.isAtEnd.bind(this);
    this.scanToken = this.scanToken.bind(this);
    this.advance = this.advance.bind(this);
    this.addToken = this.addToken.bind(this);
    this._addToken = this._addToken.bind(this);
    this.match = this.match.bind(this);
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(EOF, "", null, this.line))
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case '(': this.addToken(LEFT_PAREN); break;
      case ')': this.addToken(RIGHT_PAREN); break;
      case '{': this.addToken(LEFT_BRACE); break;
      case '}': this.addToken(RIGHT_BRACE); break;
      case ',': this.addToken(COMMA); break;
      case '.': this.addToken(DOT); break;
      case '-': this.addToken(MINUS); break;
      case '+': this.addToken(PLUS); break;
      case ';': this.addToken(SEMICOLON); break;
      case '*': this.addToken(STAR); break;
      case '!':
        this.addToken(this.match('=') ? BANG_EQUAL : BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? EQUAL_EQUAL : EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? LESS_EQUAL : LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? GREATER_EQUAL : GREATER);
        break;
      default:
        throw new Error(this.line, 'Unexpected character.');
        break;
    }
  }

  advance() {
    return this.source.charCodeAt(this.current++);
  }

  addToken(type) {
    this._addToken(type, null);
  }

  _addToken(type, literal) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(type, text, literal, this.line);
  }

  match(expected) {
    if (this.isAtEnd()) return false;
    if (this.source.charCodeAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }
}
module.exports = Scanner;
