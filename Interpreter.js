const Lox = require('./lox');
const LoxClass = require('./LoxClass');
const TokenType = require('./TokenType');
const Environment = require('./Environment');
const LoxCallable = require('./LoxCallable');
const LoxFunction = require('./LoxFunction');
const RuntimeError = require('./RuntimeError');
const Return = require('./Return');

Object
  .keys(TokenType)
  .forEach(tokenType => global[tokenType] = TokenType[tokenType]);

class Clock extends LoxCallable {
  constructor(callee) {
    super(callee);

    this.arity = this.arity.bind(this);
    this.call = this.call.bind(this);
  }

  arity() {
    return 0;
  }

  call(interpreter, args) {
    return (new Date()).getMilliseconds() / 1000.0;
  }
}

class Interpreter {
  constructor() {
    this.globals = new Environment();
    this.environment = this.globals;
    this.locals = new Map();

    this.globals.define('clock', new Clock());

    this.visitLiteralExpr = this.visitLiteralExpr.bind(this);
    this.visitGroupingExpr = this.visitGroupingExpr.bind(this);
    this.evaluate = this.evaluate.bind(this);
    this.visitUnaryExpr = this.visitUnaryExpr.bind(this);
    this.isTruthy = this.isTruthy.bind(this);
    this.visitBinaryExpr = this.visitBinaryExpr.bind(this);
    this.isEqual = this.isEqual.bind(this);
    this.checkNumberOperand = this.checkNumberOperand.bind(this);
    this.checkNumberOperands = this.checkNumberOperands.bind(this);
    this.interpret = this.interpret.bind(this);
    this.stringify = this.stringify.bind(this);
    this.visitExpressionStmt = this.visitExpressionStmt.bind(this);
    this.visitPrintStmt = this.visitPrintStmt.bind(this);
    this.execute = this.execute.bind(this);
    this.visitVarStmt = this.visitVarStmt.bind(this);
    this.visitVariableExpr = this.visitVariableExpr.bind(this);
    this.visitAssignExpr = this.visitAssignExpr.bind(this);
    this.visitBlockStmt = this.visitBlockStmt.bind(this);
    this.executeBlock = this.executeBlock.bind(this);
    this.visitIfStmt = this.visitIfStmt.bind(this);
    this.visitLogicalExpr = this.visitLogicalExpr.bind(this);
    this.visitWhileStmt = this.visitWhileStmt.bind(this);
    this.visitCallExpr = this.visitCallExpr.bind(this);
    this.visitFnStmt = this.visitFnStmt.bind(this);
    this.visitReturnStmt = this.visitReturnStmt.bind(this);
    this.resolve = this.resolve.bind(this);
    this.lookUpVariable = this.lookUpVariable.bind(this);
    this.visitClassStmt = this.visitClassStmt.bind(this);
    this.visitGetExpr = this.visitGetExpr.bind(this);
    this.visitSetExpr = this.visitSetExpr.bind(this);
    this.visitThisExpr = this.visitThisExpr.bind(this);
    this.visitSuperExpr = this.visitSuperExpr.bind(this);
  }

  interpret(statements) {
    try {
      for (let statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      Lox.runtimeError(error);
    }
  }

  visitLiteralExpr(expr) {
    return expr.value;
  }

  visitLogicalExpr(expr) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitSetExpr(expr) {
    const object = this.evaluate(expr.object);

    if (object.constructor.toString().indexOf('LoxInstance') === -1) {
      throw new RuntimeError(expr.name,
        'Only instances have fields.');
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  visitSuperExpr(expr) {
    const distance = this.locals.get(expr);
    const superclass = this.environment.getAt(
      distance, 'super');

    const object = this.environment.getAt(
      distance - 1, 'this');

    const method = superclass.findMethod(expr.method.lexeme);

    if (method === null) {
      throw new RuntimeError(expr.method,
        `Undefined property \'${expr.method.lexeme}\'.`);
    }

    return method.bind(object);
  }

  visitThisExpr(expr) {
    return this.environment.get(expr.keyword);
  }

  visitUnaryExpr(expr) {
    const right = this.evaluate(expr.right);

    switch (expr.operator.left) {
      case BANG:
        return !isTruthy(right);
      case MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }

    return null;
  }

  visitVariableExpr(expr) {
    // return this.lookUpVariable(expr.name, expr);
    return this.environment.get(expr.name);
  }

  lookUpVariable(name, expr) {
    const distance = this.locals.get(expr);
    if (distance !== null) {
      return this.environment.getAt(distance, name);
    } else {
      return this.globals.get(name);
    }
  }

  checkNumberOperand(operator, operand) {
    if (operand.constructor.toString().indexOf('Number') > -1) return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  checkNumberOperands(operator, left, right) {
    if (left !== null && left.constructor.toString().indexOf('Number') > -1 &&
        right !== null && right.constructor.toString().indexOf('Number') > -1) return;
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  isTruthy(object) {
    if (object === null) return false;
    if (object.constructor.toString().indexOf('Boolean') > -1) return object;
    return true;
  }

  isEqual(a, b) {
    if (a === null && b === null) return true;
    if (a === null) return false;

    return a === b;
  }

  stringify(object) {
    if (object === null || object === undefined) return 'nil';

    if (object !== undefined && object.constructor.toString().indexOf('Number') > -1) {
      let text = object.toString();
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    if (object !== undefined && object.constructor.toString().indexOf('Object') > -1) {
      return JSON.stringify(object);
    }

    return object.toString();
  }

  visitGroupingExpr(expr) {
    return this.evaluate(expr.expression);
  }

  evaluate(expr) {
    return expr.accept(this);
  }

  execute(stmt) {
    stmt.accept(this);
  }

  resolve(expr, depth) {
    this.locals.set(expr, depth);
  }

  repl(stmt) {
    try {
      this.execute(stmt);
    } catch (error) {
      Lox.runtimeError(error);
    } finally {
      if (stmt === null || stmt.expression === undefined) return;
      const value = this.evaluate(stmt.expression);
      if (stmt.constructor.toString().indexOf('Print') === -1) {
        console.log(this.stringify(value));
      }
    }
  }

  executeBlock(statements, environment) {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (let statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitBlockStmt(stmt) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return null;
  }

  visitClassStmt(stmt) {
    let superclass = null;
    if (stmt.superclass !== null) {
      superclass = this.evaluate(stmt.superclass);
      if (superclass.constructor.toString().indexOf('LoxClass') === -1) {
        throw new RuntimeError(stmt.superclass.name,
          'Superclass must be a class.');
      }
    }

    this.environment.define(stmt.name.lexeme, null);

    if (stmt.superclass !== null) {
      this.environment = new Environment(this.environment);
      this.environment.define('super', superclass);
    }

    const methods = new Map();
    if (stmt.methods !== undefined) {
      for (let method of stmt.methods) {
        const fn = new LoxFunction(method, this.environment,
          method.name.lexeme === 'init');
          methods.set(method.name.lexeme, fn);
        }
    }

    const klass = new LoxClass(stmt.name.lexeme,
      superclass, methods);

    if (superclass !== null) {
      this.environment = this.environment.enclosing;
    }

    this.environment.assign(stmt.name, klass);
    return null;
  }

  visitExpressionStmt(stmt) {
    this.evaluate(stmt.expression);
    return null;
  }

  visitFnStmt(stmt) {
    const fn = new LoxFunction(stmt, this.environment, false);
    this.environment.define(stmt.name.lexeme, fn);
    return null;
  }

  visitIfStmt(stmt) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
    return null;
  }

  visitPrintStmt(stmt) {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
  }

  visitReturnStmt(stmt) {
    let value = null;
    if (stmt.value !== null) value = this.evaluate(stmt.value);

    throw new Return(value);
  }

  visitVarStmt(stmt) {
    let value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
    return null;
  }

  visitWhileStmt(stmt) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
    return null;
  }

  visitAssignExpr(expr) {
    const value = this.evaluate(expr.value);

    // const distance = this.locals.get(expr);
    // if (distance !== null) {
    //   this.environment.assignAt(distance, expr.name, value);
    // } else {
    //   this.globals.assign(expr.name, value);
    // }

    this.environment.assign(expr.name, value);

    return value;
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
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      case GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      case LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      case LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      case MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case PLUS:
        if (left !== undefined && left !== null && left.constructor.toString().indexOf('Number') > -1 &&
            right !== undefined && right !== null && right.constructor.toString().indexOf('Number') > -1) {
          return left + right;
        }

        if (left !== undefined && left !== null && left.constructor.toString().indexOf('String') > -1 &&
            right !== undefined && right !== null && right.constructor.toString().indexOf('String') > -1) {
          return left + right;
        }

        if (left !== undefined && left !== null && left.constructor.toString().indexOf('String') > -1 &&
            right !== undefined && right !== null && right.constructor.toString().indexOf('Number') > -1) {
          return left + right;
        }

        if (left !== undefined && left !== null && left.constructor.toString().indexOf('Number') > -1 &&
            right !== undefined && right !== null && right.constructor.toString().indexOf('String') > -1) {
          return left + right;
        }

        throw new RuntimeError(expr.operator,
          'Operands must be number or string.');
      case SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return left / right;
      case STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
      case MODULO:
        this.checkNumberOperands(expr.operator, left, right);
        return left % right;
    }

    return null;
  }

  visitCallExpr(expr) {
    const callee = this.evaluate(expr.callee);

    const args = [];
    for (let argument of expr.args) {
      args.push(this.evaluate(argument));
    }

    let flagLoxClass = false;
    let flagFunction = false;
    let flagLoxCallable = false;

    const hasLoxClass = callee.constructor.toString().indexOf('LoxClass') > -1;
    const hasLoxCallable = callee.constructor.toString().indexOf('LoxCallable') > -1;
    const hasFunction = callee.constructor.toString().indexOf('Function') > -1;

    if (hasLoxClass) flagLoxClass = true;
    if (hasFunction) flagFunction = true;
    if (hasLoxCallable) flagLoxCallable = true;

    if (
      (!hasFunction && !flagLoxClass && !flagLoxCallable) ||
      (!hasLoxClass && !flagFunction && !flagLoxCallable) ||
      (!hasLoxCallable && !flagFunction && !flagLoxClass)
    ) {
      throw new RuntimeError(expr.paren,
        'Can only call functions and classes.');
    }

    const fn = callee;
    if (args.length !== fn.arity()) {
      throw new RuntimeError(expr.paren, 'Expect ' +
        fn.arity() + ' arguments but got ' +
        args.length + '.');
    }
    return fn.call(this, args);
  }

  visitGetExpr(expr) {
    const object = this.evaluate(expr.object);
    if (object.constructor.toString().indexOf('LoxInstance') > -1) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name,
      'Only instances have properties.');
  }
}
module.exports = Interpreter;
