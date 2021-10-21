class Stmt {
}
exports.Stmt = Stmt;

class Expression extends Stmt {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  accept(visitor) {
    return visitor.visitExpressionStmt(this);
  }

}
exports.Expression = Expression;

class Print extends Stmt {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  accept(visitor) {
    return visitor.visitPrintStmt(this);
  }

}
exports.Print = Print;
