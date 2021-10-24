const Lox = require('./lox');

class Resolver {
  constructor(interpreter) {
    this.interpreter = interpreter;

    this.scopes = [];

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
  }

  visitBlockStmt(stmt) {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
    return null;
  }

  visitFnStmt(stmt) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFn(stmtm);
    return null;
  }

  visitVarStmt(stmt) {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  visitAssignExpr(expr) {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
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
    for (let statement of statements) {
      this.resolveStmt(statement);
    }
  }

  resolveFn(fn) {
    this.beginScope();
    for (let param of fn.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(fn.body);
    this.endScope();
  }

  beginScope() {
    this.scopes.push(new Map());
  }

  endScope() {
    this.scope.pop();
  }

  declare(name) {
    if (this.scopes.length === 0) return;

    const scope = this.scopes[0];
    scope.set(name.lexeme, false);
  }

  define(name) {
    if (this.scopes.length === 0) return;
    this.scopes[0].set(name.lexeme, true);
  }

  resolveLocal(expr, name) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
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
