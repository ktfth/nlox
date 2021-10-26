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

class Call extends Expr {
  constructor(callee, paren, args) {
    super(callee, paren, args);
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept(visitor) {
    return visitor.visitCallExpr(this);
  }

}
exports.Call = Call;

class Get extends Expr {
  constructor(object, name) {
    super(object, name);
    this.object = object;
    this.name = name;
  }

  accept(visitor) {
    return visitor.visitGetExpr(this);
  }

}
exports.Get = Get;

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

class Logical extends Expr {
  constructor(left, operator, right) {
    super(left, operator, right);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitLogicalExpr(this);
  }

}
exports.Logical = Logical;

class Set extends Expr {
  constructor(object, name, value) {
    super(object, name, value);
    this.object = object;
    this.name = name;
    this.value = value;
  }

  accept(visitor) {
    return visitor.visitSetExpr(this);
  }

}
exports.Set = Set;

class This extends Expr {
  constructor(keyword) {
    super(keyword);
    this.keyword = keyword;
  }

  accept(visitor) {
    return visitor.visitThisExpr(this);
  }

}
exports.This = This;

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
