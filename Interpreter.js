const TokenType = require('./TokenType');

Object
  .keys(TokenType)
  .forEach(tokenType => global[tokenType] = TokenType[tokenType]);

class Interpreter {
  constructor() {
    this.visitLiteralExpr = this.visitLiteralExpr.bind(this);
    this.visitGroupingExpr = this.visitGroupingExpr.bind(this);
    this.evaluate = this.evaluate.bind(this);
    this.visitUnaryExpr = this.visitUnaryExpr.bind(this);
    this.isTruthy = this.isTruthy.bind(this);
    this.visitBinaryExpr = this.visitBinaryExpr.bind(this);
    this.isEqual = this.isEqual.bind(this);
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
        return -right;
    }

    return null;
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

  visitGroupingExpr(expr) {
    return this.evaluate(expr.expression);
  }

  evaluate(expr) {
    return expr.accep(this);
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
        return left > right;
      case GREATER_EQUAL:
        return left >= right;
      case LESS:
        return left < right;
      case LESS_EQUAL:
        return left <= right;
      case MINUS:
        return left - right;
      case PLUS:
        if (left instanceof Number && right instanceof Number) {
          return left + right;
        }

        if (left instanceof String && right instanceof String) {
          return left + right;
        }

        break;
      case SLASH:
        return left / right;
      case STAR:
        return left * right;
    }

    return null;
  }
}
