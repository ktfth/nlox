const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('Usage: GenerateAst.js <output directory>');
  process.exit(64);
}
const outputDir = path.join(process.cwd(), args[0]);

defineAst(outputDir, 'Expr', [
  'Binary   : Expr left, Token operator, Expr right',
  'Grouping : Expr expression',
  'Literal  : Object value',
  'Unary    : Token operator, Expr right',
]);

function defineAst(outputDir, baseName, types) {
  const filePath = path.join(outputDir, `${baseName}.js`);
  fs.appendFileSync(filePath, `class ${baseName} {\n`);

  fs.appendFileSync(filePath, '}\n');

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

  const fields = fieldList.split(', ');
  for (let field of fields) {
    const name = field.split(' ')[1];
    fs.appendFileSync(filePath, `    this.${name} = ${name};\n`);
  }

  fs.appendFileSync(filePath, `  }\n`);
  fs.appendFileSync(filePath, '\n');
  fs.appendFileSync(filePath, '}\n');
}
