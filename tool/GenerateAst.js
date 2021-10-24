const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('Usage: GenerateAst.js <output directory>');
  process.exit(64);
}
const outputDir = path.join(process.cwd(), args[0]);

defineAst(outputDir, 'Expr', [
  'Assign   : Token name, Expr value',
  'Binary   : Expr left, Token operator, Expr right',
  'Grouping : Expr expression',
  'Literal  : Object value',
  'Logical  : Expr left, Token operator, Expr right',
  'Unary    : Token operator, Expr right',
  'Variable : Token name',
]);

defineAst(outputDir, 'Stmt', [
  'Block      : List<Stmt> statements',
  'Expression : Expr expression',
  'If         : Expr condition, Stmt thenBranch,' +
              ' Stmt elseBranch',
  'Print      : Expr expression',
  'Var        : Token name, Expr initializer',
  'While      : Expr condition, Stmt body',
]);

function defineAst(outputDir, baseName, types) {
  const filePath = path.join(outputDir, `${baseName}.js`);
  fs.appendFileSync(filePath, `class ${baseName} {\n`);

  defineVisitor(filePath, baseName, types);

  fs.appendFileSync(filePath, '}\n');
  fs.appendFileSync(filePath, `exports.${baseName} = ${baseName};\n`);

  for (let type of types) {
    const className = type.split(':')[0].trim();
    const fields = type.split(':')[1].trim();
    defineType(filePath, baseName, className, fields);
  }
}

function defineType(filePath, baseName, className, fieldList) {
  fs.appendFileSync(filePath, '\n');
  fs.appendFileSync(filePath, `class ${className} extends ${baseName} {\n`);
  const fieldListConstructor = fieldList.split(', ').map(field => field.split(' ')[1]).join(', ');
  fs.appendFileSync(filePath, `  constructor(${fieldListConstructor}) {\n`);
  fs.appendFileSync(filePath, `    super(${fieldListConstructor});\n`);

  const fields = fieldList.split(', ');
  for (let field of fields) {
    const name = field.split(' ')[1];
    fs.appendFileSync(filePath, `    this.${name} = ${name};\n`);
  }

  fs.appendFileSync(filePath, `  }\n`);

  fs.appendFileSync(filePath, '\n');
  fs.appendFileSync(filePath, '  accept(visitor) {\n');
  fs.appendFileSync(filePath, `    return visitor.visit${className}${baseName}(this);\n`);
  fs.appendFileSync(filePath, '  }\n');

  fs.appendFileSync(filePath, '\n');
  fs.appendFileSync(filePath, '}\n');
  fs.appendFileSync(filePath, `exports.${className} = ${className};\n`);
}

function defineVisitor(filePath, baseName, types) {
  // has no need to implement an interface in javascript
}
