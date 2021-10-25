#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Parser = require('./Parser');
const readline = require('readline');
const Scanner = require('./Scanner');
const Resolver = require('./Resolver');
const TokenType = require('./TokenType');
const AstPrinter = require('./AstPrinter');
const Interpreter = require('./Interpreter');

const args = process.argv.slice(2);

const interpreter = new Interpreter();
let hadError = false;
let hadRuntimeError = false;

function runFile(filePath) {
  const data = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
  run(data);
  if (hadError) process.exit(65);
  if (hadRuntimeError) process.exit(70);
}

async function runPrompt() {
  const question = (prompt) => {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(prompt, (line) => {
        rl.close();
        resolve(line);
      });
    });
  };

  for (;;) {
    const line = await question('> ');
    if (line === null) break;
    runRepl(line);
    hadError = false;
  }
}

function runRepl(source) {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);

  if (hadError) return;

  const declaration = parser.declaration();
  interpreter.repl(declaration);
}

function run(source) {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse();

  if (hadError) return;

  const resolver = new Resolver(interpreter);
  resolver.resolve(statements);

  interpreter.interpret(statements);
}

function report(line, where, message) {
  console.error(`[line ${line}] Error ${where}: ${message}`);
  hadError = true;
}

function error(token, message) {
  if (token === 0) return;
  if (token.type === TokenType.EOF) {
    report(token.line, 'at end', message);
  } else {
    report(token.line, `at \'${token.lexeme}\'`, message);
  }
}
exports.error = error;

function runtimeError(error) {
  console.log(error);
  console.log(`${error.message}\n[line ${error.token.line}]`);
  hadRuntimeError = true;
}
exports.runtimeError = runtimeError;

if (!module.parent) {
  (async function () {
    if (args.length > 1) {
      console.log('Usage: nlox [script]');
      process.exit(64);
    } else if (args.length === 1) {
      runFile(args[0]);
    } else {
      await runPrompt();
    }
  }());
}
