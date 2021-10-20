#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Scanner = require('./Scanner');
const Parser = require('./Parser');
const AstPrinter = require('./AstPrinter');
const TokenType = require('./TokenType');

const args = process.argv.slice(2);

let hadError = false;

function runFile(filePath) {
    const data = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
    run(data);
    if (hadError) process.exit(65);
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
        run(line);
        hadError = false;
    }
}

function run(source) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const expression = parser.parse();

    if (hadError) return;

    console.log(new AstPrinter().print(expression));
}

function report(line, where, message) {
    console.error(`[line ${line}] Error ${where}: ${message}`);
    hadError = true;
}

function error(token, message) {
  if (token.type === TokenType.EOF) {
    report(token.line, ' at end', message);
  } else {
    report(token.line, ` at \'${token.lexeme}\'`, message);
  }
}
exports.error = error;

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
