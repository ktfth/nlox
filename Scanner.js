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
  SLASH,
  STRING,
  NUMBER,
  OR,
  IDENTIFIER,
} = require('./TokenType');
const Token = require('./Token');
const Lox = require('./lox');

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
    this.peek = this.peek.bind(this);
    this.string = this.string.bind(this);
    this.isDigit = this.isDigit.bind(this);
    this.number = this.number.bind(this);
    this.peekNext = this.peekNext.bind(this);
    this.identifier = this.identifier.bind(this);
    this.isAlpha = this.isAlpha.bind(this);
    this.isAlphaNumeric = this.isAlphaNumeric.bind(this);
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
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        break;
      case '"': this.string(); break;
      case 'o':
        if (this.match('r')) {
          this.addToken(OR);
        }
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          Lox.error(this.line, 'Unexpected character.');
        }
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

  peek() {
    if (this.isAtEnd()) return '\0';
    return this.source.charCodeAt(this.current);
  }

  string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, 'Unterminated string.');
      return;
    }

    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(STRING, value);
  }

  isDigit(c) {
    c = parseInt(c, 10);
    return c >= 0 && c <= 9;
  }

  number() {
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(NUMBER,
      parseFloat(this.source.substring(this.start, this.current)));
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charCodeAt(this.current + 1);
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    this.addToken(IDENTIFIER);
  }

  isAlpha(c) {
    return (c.charCodeAt(0) >= 'a'.charCodeAt(0) && c.charCodeAt(0) <= 'z'.charCodeAt(0)) ||
           (c.charCodeAt(0) >= 'A'.charCodeAt(0) && c.charCodeAt(0) <= 'Z'.charCodeAt(0)) ||
           c === '_';
  }

  isAlphaNumeric(c) {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
module.exports = Scanner;
