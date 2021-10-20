const {
  Expr,
  Binary,
  Unary,
  Literal,
  Grouping,
} = require('./Expr.js');
const Token = require('./Token');
const TokenType = require('./TokenType');

class AstPrinter extends Expr {
  print(expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr) {
    return this.parenthesized(expr.operator.lexeme,
                         expr.left, expr.right);
  }

  visitGroupingExpr(expr) {
    return this.parenthesized('group', expr.expression);
  }

  visitLiteralExpr(expr) {
    if (expr.value === null) return 'nil';
    return expr.value.toString();
  }

  visitUnaryExpr(expr) {
    return this.parenthesized(expr.operator.lexeme, expr.right);
  }

  parenthesized(name, ...exprs) {
    const builder = [];

    builder.push('(');
    builder.push(name);
    for (let expr of exprs) {
      builder.push(' ');
      builder.push(expr.accept(this));
    }
    builder.push(')');

    return builder.join('');
  }
}
module.exports = AstPrinter;

if (!module.parent) {
  const expression = new Binary(
    new Unary(
      new Token(TokenType.MINUS, '-', null, 1),
      new Literal(123)
    ),
    new Token(TokenType.STAR, '*', null, 1),
    new Grouping(new Literal(45.67))
  );

  console.log(new AstPrinter().print(expression));
}
