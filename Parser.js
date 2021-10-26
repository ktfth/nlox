const TokenType = require('./TokenType');
const {
  Binary,
  Unary,
  Literal,
  Grouping,
  Variable,
  Assign,
  Logical,
  Call,
  Get,
  Set,
  This,
  Super,
} = require('./Expr');
const {
  Print,
  Expression,
  Var,
  Block,
  If,
  While,
  Fn,
  Return,
  Class,
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
    this.declaration = this.declaration.bind(this);
    this.varDeclaration = this.varDeclaration.bind(this);
    this.assignment = this.assignment.bind(this);
    this.block = this.block.bind(this);
    this.ifStatement = this.ifStatement.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.whileStatement = this.whileStatement.bind(this);
    this.forStatement = this.forStatement.bind(this);
    this.call = this.call.bind(this);
    this.finishCall = this.finishCall.bind(this);
    this.fn = this.fn.bind(this);
    this.returnStatement = this.returnStatement.bind(this);
    this.classDeclaration = this.classDeclaration.bind(this);
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }

    return statements;
  }

  expression() {
    return this.assignment();
  }

  declaration() {
    try {
      if (this.match(CLASS)) return this.classDeclaration();
      if (this.match(FUN)) return this.fn('function');
      if (this.match(VAR)) return this.varDeclaration();

      return this.statement();
    } catch (error) {
      console.log(error);
      this.synchronize();
      return null;
    }
  }

  classDeclaration() {
    const name = this.consume(IDENTIFIER, 'Expect class name.');

    let superclass = null;
    if (this.match(LESS)) {
      this.consume(IDENTIFIER, 'Expect superclass name.');
      superclass = new Variable(this.previous());
    }

    this.consume(LEFT_BRACE, 'Expect \'{\' before class body.');

    const methods = [];
    while (!this.check(RIGHT_BRACE) && !this.isAtEnd()) {
      methods.push(this.fn('method'));
    }

    this.consume(RIGHT_BRACE, 'Expect \'}\' after class body.');

    return new Class(name, superclass, methods);
  }

  statement() {
    if (this.match(FOR)) return this.forStatement();
    if (this.match(IF)) return this.ifStatement();
    if (this.match(PRINT)) return this.printStatement();
    if (this.match(RETURN)) return this.returnStatement();
    if (this.match(WHILE)) return this.whileStatement();
    if (this.match(LEFT_BRACE)) return new Block(this.block());

    return this.expressionStatement();
  }

  forStatement() {
    this.consume(LEFT_PAREN, 'Expect \'(\' after \'for\'.');

    let initializer;
    if (this.match(SEMICOLON)) {
      initializer = null;
    } else if (this.match(VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;
    if (!this.check(RIGHT_PAREN)) {
      condition = this.expression();
    }
    this.consume(SEMICOLON, 'Expect \';\' after loop condition.');

    let increment = null;
    if (!this.check(RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(RIGHT_PAREN, 'Expect \')\' after for clauses.');
    let body = this.statement();

    if (increment !== null) {
      body = new Block([
        body,
        new Expression(increment),
      ]);
    }

    if (condition === null) condition = new Literal(true);
    body = new While(condition, body);

    if (initializer !== null) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  ifStatement() {
    this.consume(LEFT_PAREN, 'Expect \'(\' after \'if\'.');
    const condition = this.expression();
    this.consume(RIGHT_PAREN, 'Expect \')\' after if condition.');

    const thenBranch = this.statement();
    let elseBranch = null;
    if (this.match(ELSE)) {
      elseBranch = this.statement();
    }

    return new If(condition, thenBranch, elseBranch);
  }

  printStatement() {
    const value = this.expression();
    this.consume(SEMICOLON, 'Expect \';\' after value.');
    return new Print(value);
  }

  returnStatement() {
    const keyword = this.previous();
    let value = null;
    if (!this.check(SEMICOLON)) {
      value = this.expression();
    }

    this.consume(SEMICOLON, 'Expect \';\' after return value.');
    return new Return(keyword, value);
  }

  varDeclaration() {
    const name = this.consume(IDENTIFIER, 'Expect variable name.');

    let initializer = null;
    if (this.match(EQUAL)) {
      initializer = this.expression();
    }

    this.consume(SEMICOLON, 'Expect \';\' after variable declaration.');
    return new Var(name, initializer);
  }

  whileStatement() {
    this.consume(LEFT_PAREN, 'Expect \'(\' after \'while\'.');
    const condition = this.expression();
    this.consume(RIGHT_PAREN, 'Expect \')\' after condition.');
    const body = this.statement();

    return new While(condition, body);
  }

  expressionStatement() {
    const expr = this.expression();
    this.consume(SEMICOLON, 'Expect \';\' after expression.');
    return new Expression(expr);
  }

  fn(kind) {
    const name = this.consume(IDENTIFIER, `Expect ${kind} name.`);
    this.consume(LEFT_PAREN, `Expect \'(\' after ${kind} name.`);
    const parameters = [];
    if (!this.check(RIGHT_PAREN)) {
      do {
        if (parameters.length >= 255) {
          this.error(this.peek(), 'Can\'t have more than 255 parameters.');
        }

        const param = this.consume(IDENTIFIER, 'Expect parameter name.');

        parameters.push(param);
      } while (this.match(COMMA));
    }
    this.consume(RIGHT_PAREN, 'Expect \')\' after parameters.');

    this.consume(LEFT_BRACE, `Expect \'{\' before ${kind} body.`);
    const body = this.block();
    return new Fn(name, parameters, body);
  }

  block() {
    const statements = [];

    while (!this.check(RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(RIGHT_BRACE, 'Expect \'}\' after block.');
    return statements;
  }

  assignment() {
    const expr = this.or();

    if (this.match(EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr.constructor.toString().indexOf('Variable') > -1) {
        const name = expr.name;
        return new Assign(name, value);
      } else if (expr.constructor.toString().indexOf('Get') > -1) {
        const get = expr;
        return new Set(get.object, get.name, value);
      }

      this.error(equals, 'Invalid assignment target.');
    }

    return expr;
  }

  or() {
    let expr = this.and();

    while (this.match(OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  and() {
    let expr = this.equality();

    while (this.match(AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
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

    return this.call();
  }

  finishCall(callee) {
    const args = [];
    if (!this.check(RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), 'Can\'t have more than 255 arugments.');
        }
        args.push(this.expression());
      } while (this.match(COMMA));
    }

    const paren = this.consume(RIGHT_PAREN,
                               'Expect \')\' after arguments.');

    return new Call(callee, paren, args);
  }

  call() {
    let expr = this.primary();

    while (true) {
      if (this.match(LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(DOT)) {
        const name = this.consume(IDENTIFIER,
          'Expect property name after \'.\'.');
        expr = new Get(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  primary() {
    if (this.match(FALSE)) return new Literal(false);
    if (this.match(TRUE)) return new Literal(true);
    if (this.match(NIL)) return new Literal(null);

    if (this.match(NUMBER, STRING)) {
      return new Literal(
        this.previous().literal === null ? 0 : this.previous().literal);
    }

    if (this.match(SUPER)) {
      const keyword = this.previous();
      this.consume(DOT, 'Expect \'.\' after \'super\'.');
      const method = this.consume(IDENTIFIER,
        'Expect superclass method name.');
      return new Super(keyword, method);
    }

    if (this.match(THIS)) return new This(this.previous());

    if (this.match(IDENTIFIER)) {
      return new Variable(this.previous());
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
