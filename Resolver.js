const Lox = require('./lox');

const FunctionType = {
  NONE: 0,
  FUNCTION: 1,
};

class Resolver {
  constructor(interpreter) {
    this.interpreter = interpreter;

    this.scopes = [];
    this.currentFunction = FunctionType.NONE;

    this.visitBlockStmt = this.visitBlockStmt.bind(this);
    this.resolve = this.resolve.bind(this);
    this.resolveStmt = this.resolveStmt.bind(this);
    this.resolveExpr = this.resolveExpr.bind(this);
    this.beginScope = this.beginScope.bind(this);
    this.endScope = this.endScope.bind(this);
    this.visitVarStmt = this.visitVarStmt.bind(this);
    this.declare = this.declare.bind(this);
    this.define = this.define.bind(this);
    this.visitVariableExpr = this.visitVariableExpr.bind(this);
    this.resolveLocal = this.resolveLocal.bind(this);
    this.visitAssignExpr = this.visitAssignExpr.bind(this);
    this.visitFnStmt = this.visitFnStmt.bind(this);
    this.resolveFn = this.resolveFn.bind(this);
    this.visitExpressionStmt = this.visitExpressionStmt.bind(this);
    this.visitIfStmt = this.visitIfStmt.bind(this);
    this.visitPrintStmt = this.visitPrintStmt.bind(this);
    this.visitReturnStmt = this.visitReturnStmt.bind(this);
    this.visitWhileStmt = this.visitWhileStmt.bind(this);
    this.visitBinaryExpr = this.visitBinaryExpr.bind(this);
    this.visitCallExpr = this.visitCallExpr.bind(this);
    this.visitGroupingExpr = this.visitGroupingExpr.bind(this);
    this.visitLiteralExpr = this.visitLiteralExpr.bind(this);
    this.visitLogicalExpr = this.visitLogicalExpr.bind(this);
    this.visitUnaryExpr = this.visitUnaryExpr.bind(this);
    this.visitClassStmt = this.visitClassStmt.bind(this);
  }

  visitBlockStmt(stmt) {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
    return null;
  }

  visitClassStmt(stmt) {
    this.declare(stmt.name);
    this.define(stmt.name);
    return null;
  }

  visitExpressionStmt(stmt) {
    this.resolve(stmt.expression);
    return null;
  }

  visitFnStmt(stmt) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFn(stmt, FunctionType.FUNCTION);
    return null;
  }

  visitIfStmt(stmt) {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
    return null;
  }

  visitPrintStmt(stmt) {
    if (stmt.value !== null) {
      this.resolve(stmt.value);
    }

    return null;
  }

  visitReturnStmt(stmt) {
    if (stmt.value !== null) {
      this.resolve(stmt.value);
    }

    return null;
  }

  visitVarStmt(stmt) {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolveStmt(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  visitWhileStmt(stmt) {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
    return null;
  }

  visitAssignExpr(expr) {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
    return null;
  }

  visitBinaryExpr(expr) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  visitCallExpr(expr) {
    this.resolveExpr(expr.callee);

    for (let argument of expr.args) {
      this.resolveExpr(argument);
    }

    return null;
  }

  visitGroupingExpr(expr) {
    this.resolveExpr(expr.expression);
    return null;
  }

  visitLiteralExpr(expr) {
    return null;
  }

  visitLogicalExpr(expr) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  visitUnaryExpr(expr) {
    this.resolveExpr(expr.right);
    return null;
  }

  visitVariableExpr(expr) {
    if (this.scopes.length > 0 &&
        this.scopes[0].get(expr.name.lexeme) === false) {
      Lox.error(expr.name,
        'Can\'t read local variable in its own initializer.');
    }

    this.resolveLocal(expr, expr.name);
    return null;
  }

  resolve(statements) {
    if (statements !== undefined &&
        statements.constructor.toString().indexOf('Array') > -1) {
      for (let statement of statements) {
        this.resolveStmt(statement);
      }
    } else {
      if (statements !== undefined && statements.constructor.toString().indexOf('Expr') > -1) {
        this.resolveExpr(statements);
      } else if (statements !== undefined && statements.constructor.toString().indexOf('Stmt') > -1) {
        this.resolveStmt(statements);
      }
    }
  }

  resolveFn(fn, type) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (let param of fn.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(fn.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  beginScope() {
    this.scopes.push(new Map());
  }

  endScope() {
    this.scopes.pop();
  }

  declare(name) {
    if (this.scopes.length === 0) return;

    const scope = this.scopes[0];
    if (scope.has(name.lexeme)) {
      Lox.error(name,
        'Already a variable with this name in this scope.');
    }
    scope.set(name.lexeme, false);
  }

  define(name) {
    if (this.scopes.length === 0) return;
    this.scopes[0].set(name.lexeme, true);
  }

  resolveLocal(expr, name) {
    for (let i = this.scopes.length - 1; i >= 0; i -= 1) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  resolveStmt(stmt) {
    stmt.accept(this);
  }

  resolveExpr(expr) {
    expr.accept(this);
  }
}
module.exports = Resolver;
