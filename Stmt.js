class Stmt {
}
exports.Stmt = Stmt;

class Block extends Stmt {
  constructor(statements) {
    super(statements);
    this.statements = statements;
  }

  accept(visitor) {
    return visitor.visitBlockStmt(this);
  }

}
exports.Block = Block;

class Class extends Stmt {
  constructor(name, methods) {
    super(name, methods);
    this.name = name;
    this.methods = methods;
  }

  accept(visitor) {
    return visitor.visitClassStmt(this);
  }

}
exports.Class = Class;

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

class Fn extends Stmt {
  constructor(name, params, body) {
    super(name, params, body);
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept(visitor) {
    return visitor.visitFnStmt(this);
  }

}
exports.Fn = Fn;

class If extends Stmt {
  constructor(condition, thenBranch, elseBranch) {
    super(condition, thenBranch, elseBranch);
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor) {
    return visitor.visitIfStmt(this);
  }

}
exports.If = If;

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

class Return extends Stmt {
  constructor(keyword, value) {
    super(keyword, value);
    this.keyword = keyword;
    this.value = value;
  }

  accept(visitor) {
    return visitor.visitReturnStmt(this);
  }

}
exports.Return = Return;

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

class While extends Stmt {
  constructor(condition, body) {
    super(condition, body);
    this.condition = condition;
    this.body = body;
  }

  accept(visitor) {
    return visitor.visitWhileStmt(this);
  }

}
exports.While = While;
