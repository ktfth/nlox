const Lox = require('./lox');
const TokenType = require('./TokenType');
const Environment = require('./Environment');
const RuntimeError = require('./RuntimeError');

Object
  .keys(TokenType)
  .forEach(tokenType => global[tokenType] = TokenType[tokenType]);

class Interpreter {
  constructor() {
    this.environment = new Environment();

    this.visitLiteralExpr = this.visitLiteralExpr.bind(this);
    this.visitGroupingExpr = this.visitGroupingExpr.bind(this);
    this.evaluate = this.evaluate.bind(this);
    this.visitUnaryExpr = this.visitUnaryExpr.bind(this);
    this.isTruthy = this.isTruthy.bind(this);
    this.visitBinaryExpr = this.visitBinaryExpr.bind(this);
    this.isEqual = this.isEqual.bind(this);
    this.checkNumberOperand = this.checkNumberOperand.bind(this);
    this.checkNumberOperands = this.checkNumberOperands.bind(this);
    this.interpret = this.interpret.bind(this);
    this.stringify = this.stringify.bind(this);
    this.visitExpressionStmt = this.visitExpressionStmt.bind(this);
    this.visitPrintStmt = this.visitPrintStmt.bind(this);
    this.execute = this.execute.bind(this);
    this.visitVarStmt = this.visitVarStmt.bind(this);
    this.visitVariableExpr = this.visitVariableExpr.bind(this);
  }

  interpret(statements) {
    try {
      for (let statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      Lox.runtimeError(error);
    }
  }

  visitLiteralExpr(expr) {
    return expr.value;
  }

  visitUnaryExpr(expr) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.left) {
      case BANG:
        return !isTruthy(right);
      case MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }

    return null;
  }

  visitVariableExpr(expr) {
    return this.environment.get(expr.name);
  }

  checkNumberOperand(operator, operand) {
    if (operand instanceof Number) return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  checkNumberOperands(operator, left, right) {
    if (left instanceof Number && right instanceof Number) return;
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  isTruthy(object) {
    if (object === null) return false;
    if (object instanceof Boolean) return object;
    return true;
  }

  isEqual(a, b) {
    if (a === null && b === null) return true;
    if (a === null) return false;

    return a === b;
  }

  stringify(object) {
    if (object === null) return 'nil';

    if (object instanceof Number) {
      let text = object.toString();
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    if (object instanceof Object) {
      return JSON.stringify(object);
    }

    return object.toString();
  }

  visitGroupingExpr(expr) {
    return this.evaluate(expr.expression);
  }

  evaluate(expr) {
    return expr.accept(this);
  }

  execute(stmt) {
    stmt.accept(this);
  }

  visitExpressionStmt(stmt) {
    this.evaluate(stmt.expression);
    return null;
  }

  visitPrintStmt(stmt) {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
  }

  visitVarStmt(stmt) {
    let value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
    return null;
  }

  visitBinaryExpr(expr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case BANG:
        return !this.isEqual(left, right);
      case EQUAL_EQUAL:
        return this.isEqual(left, right);
      case GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      case GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      case LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      case LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      case MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case PLUS:
        if (left.constructor.toString().indexOf('Number') > -1 &&
            right.constructor.toString().indexOf('Number') > -1) {
          return left + right;
        }

        if (left instanceof String && right instanceof String) {
          return left + right;
        }

        throw new RuntimeError(expr.operator,
          'Operands must be two numbers or two strings.');
      case SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return left / right;
      case STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
    }

    return null;
  }
}
module.exports = Interpreter;
