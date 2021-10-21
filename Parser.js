const TokenType = require('./TokenType');
const {
  Binary,
  Unary,
  Literal,
  Grouping,
} = require('./Expr');
const {
  Print,
  Expression,
} = require('./Stmt');
const Lox = require('./lox');

Object
  .keys(TokenType)
  .forEach(tokenType => global[tokenType] = TokenType[tokenType]);

class ParserError extends Error {}

class Parser {
  constructor(tokens) {
    this.current = 0;
    this.tokens = tokens;

    this.expression = this.expression.bind(this);
    this.equality = this.equality.bind(this);
    this.match = this.match.bind(this);
    this.check = this.check.bind(this);
    this.advance = this.advance.bind(this);
    this.isAtEnd = this.isAtEnd.bind(this);
    this.peek = this.peek.bind(this);
    this.previous = this.previous.bind(this);
    this.comparison = this.comparison.bind(this);
    this.term = this.term.bind(this);
    this.factor = this.factor.bind(this);
    this.unary = this.unary.bind(this);
    this.primary = this.primary.bind(this);
    this.consume = this.consume.bind(this);
    this.error = this.error.bind(this);
    this.synchronize = this.synchronize.bind(this);
    this.parse = this.parse.bind(this);
    this.statement = this.statement.bind(this);
    this.printStatement = this.printStatement.bind(this);
    this.expressionStatement = this.expressionStatement.bind(this);
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.statement());
    }

    return statements;
  }

  expression() {
    return this.equality();
  }

  statement() {
    if (this.match(PRINT)) return this.printStatement();

    return this.expressionStatement();
  }

  printStatement() {
    const value = this.expression();
    this.consume(SEMICOLON, 'Expect \';\' after value.');
    return new Print(value);
  }

  expressionStatement() {
    const expr = this.expression();
    this.consume(SEMICOLON, 'Expect \';\' after expression.');
    return Expression(expr);
  }

  equality() {
    let expr = this.comparison();

    while (this.match(BANG_EQUAL, EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  comparison() {
    let expr = this.term();

    while (this.match(GREATER, GREATER_EQUAL, LESS, LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  term() {
    let expr = this.factor();

    while (this.match(MINUS, PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  factor() {
    let expr = this.unary();

    while (this.match(SLASH, STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  unary() {
    if (this.match(BANG, MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  primary() {
    if (this.match(FALSE)) return new Literal(false);
    if (this.match(TRUE)) return new Literal(true);
    if (this.match(NIL)) return new Literal(null);

    if (this.match(NUMBER, STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(RIGHT_PAREN, 'Expect \')\' after expression.');
      return new Grouping(expr);
    }

    throw this.error(this.peek(), 'Expect expression.');
  }

  match(...types) {
    for (let type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type === EOF;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  error(token, message) {
    Lox.error(token, message);
    return new ParserError();
  }

  synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === SEMICOLON) return;

      switch (this.peek().type) {
        case CLASS:
        case FUN:
        case VAR:
        case FOR:
        case IF:
        case WHILE:
        case PRINT:
        case RETURN:
          return;
      }

      this.advance();
    }
  }
}
module.exports = Parser;
