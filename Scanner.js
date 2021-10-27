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
  AND,
  CLASS,
  ELSE,
  FALSE,
  FOR,
  FUN,
  IF,
  NIL,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,
  MODULO,
} = require('./TokenType');
const Token = require('./Token');
const Lox = require('./lox');

const keywords = {
  'and': AND,
  'class': CLASS,
  'else': ELSE,
  'false': FALSE,
  'for': FOR,
  'fun': FUN,
  'if': IF,
  'nil': NIL,
  'or': OR,
  'print': PRINT,
  'return': RETURN,
  'super': SUPER,
  'this': THIS,
  'true': TRUE,
  'var': VAR,
  'while': WHILE,
};

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

    this.tokens.push(new Token(EOF, "", null, this.line));

    return this.tokens;
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case '('.charCodeAt(0): this.addToken(LEFT_PAREN); break;
      case ')'.charCodeAt(0): this.addToken(RIGHT_PAREN); break;
      case '{'.charCodeAt(0): this.addToken(LEFT_BRACE); break;
      case '}'.charCodeAt(0): this.addToken(RIGHT_BRACE); break;
      case ','.charCodeAt(0): this.addToken(COMMA); break;
      case '.'.charCodeAt(0): this.addToken(DOT); break;
      case '-'.charCodeAt(0): this.addToken(MINUS); break;
      case '+'.charCodeAt(0): this.addToken(PLUS); break;
      case ';'.charCodeAt(0): this.addToken(SEMICOLON); break;
      case '*'.charCodeAt(0): this.addToken(STAR); break;
      case '%'.charCodeAt(0): this.addToken(MODULO); break;
      case '!'.charCodeAt(0):
        this.addToken(this.match('='.charCodeAt(0)) ? BANG_EQUAL : BANG);
        break;
      case '='.charCodeAt(0):
        this.addToken(this.match('='.charCodeAt(0)) ? EQUAL_EQUAL : EQUAL);
        break;
      case '<'.charCodeAt(0):
        this.addToken(this.match('='.charCodeAt(0)) ? LESS_EQUAL : LESS);
        break;
      case '>'.charCodeAt(0):
        this.addToken(this.match('='.charCodeAt(0)) ? GREATER_EQUAL : GREATER);
        break;
      case '/'.charCodeAt(0):
        if (this.match('/'.charCodeAt(0))) {
          while (this.peek() !== '\n'.charCodeAt(0) && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(SLASH);
        }
        break;
      case ' '.charCodeAt(0):
      case '\r'.charCodeAt(0):
      case '\t'.charCodeAt(0):
        break;
      case '\n':
        this.line++;
        break;
      case '"'.charCodeAt(0): this.string(); break;
      case 'o'.charCodeAt(0):
        if (this.match('r'.charCodeAt(0))) {
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

  addToken(type, literal) {
    this._addToken(type, (literal || null));
  }

  _addToken(type, literal) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  match(expected) {
    if (this.isAtEnd()) return false;
    if (this.source.charCodeAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  peek() {
    if (this.isAtEnd()) return '\0'.charCodeAt(0);
    return this.source.charCodeAt(this.current);
  }

  string() {
    while (this.peek() !== '"'.charCodeAt(0) && !this.isAtEnd()) {
      if (this.peek() === '\n'.charCodeAt(0)) this.line++;
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
    return c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0);
  }

  number() {
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() === '.'.charCodeAt(0) && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(NUMBER,
      parseFloat(this.source.substring(this.start, this.current), 10));
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charCodeAt(this.current + 1);
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    let type = keywords[text] || null;
    if (type === null) type = IDENTIFIER;
    this.addToken(type);
  }

  isAlpha(c) {
    return (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) ||
           (c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) ||
           c === '_'.charCodeAt(0);
  }

  isAlphaNumeric(c) {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
module.exports = Scanner;
