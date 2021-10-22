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

class Var extends Stmt {
  constructor(name, initializer) {
    super(name, initializer);
    this.name = name;
    this.initializer = initializer;
  }

  accept(visitor) {
    return visitor.visitVarStmt(this);
  }

}
exports.Var = Var;
