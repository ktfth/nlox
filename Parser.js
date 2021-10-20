const TokenType = require('./TokenType');

Object
  .keys(TokenType)
  .forEach(tokenType => global[tokenType] = TokenType[tokenType]);

class Parser {
  constructor(tokens) {
    this.current = 0;
    this.tokens = tokens;
  }
}
