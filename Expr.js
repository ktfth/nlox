class Expr {
}
exports.Expr = Expr;

class Assign extends Expr {
  constructor(name, value) {
    super(name, value);
    this.name = name;
    this.value = value;
  }

  accept(visitor) {
    return visitor.visitAssignExpr(this);
  }

}
exports.Assign = Assign;

class Binary extends Expr {
  constructor(left, operator, right) {
    super(left, operator, right);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitBinaryExpr(this);
  }

}
exports.Binary = Binary;

class Grouping extends Expr {
  constructor(expression) {
    super(expression);
    this.expression = expression;
  }

  accept(visitor) {
    return visitor.visitGroupingExpr(this);
  }

}
exports.Grouping = Grouping;

class Literal extends Expr {
  constructor(value) {
    super(value);
    this.value = value;
  }

  accept(visitor) {
    return visitor.visitLiteralExpr(this);
  }

}
exports.Literal = Literal;

class Unary extends Expr {
  constructor(operator, right) {
    super(operator, right);
    this.operator = operator;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitUnaryExpr(this);
  }

}
exports.Unary = Unary;

class Variable extends Expr {
  constructor(name) {
    super(name);
    this.name = name;
  }

  accept(visitor) {
    return visitor.visitVariableExpr(this);
  }

}
exports.Variable = Variable;
