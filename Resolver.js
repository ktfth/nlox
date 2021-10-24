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
  }

  visitBlockStmt(stmt) {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
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

  resolve(statements) {
    for (let statement of statements) {
      this.resolveStmt(statement);
    }
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

  resolveStmt(stmt) {
    stmt.accept(this);
  }

  resolveExpr(expr) {
    expr.accept(this);
  }
}
module.exports = Resolver;
