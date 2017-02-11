exports.blockVar = [
  'VariableDeclarator',
  'VariableDeclaration',
  'BlockStatement'
]

exports.reqPattern = [
  'CallExpression',
  'VariableDeclarator',
  'VariableDeclaration'
]

exports.reqPatternCalledByFn = [
  'CallExpression',
  'CallExpression',
  'VariableDeclarator',
  'VariableDeclaration'
]

exports.exportsPath = [
  'MemberExpression',
  'AssignmentExpression',
  'ExpressionStatement',
  'Program'
]

exports.exportAssign = [
  'AssignmentExpression',
  'AssignmentExpression',
  'ExpressionStatement'
]

exports.fnOnTop = [
  'CallExpression',
  'ExpressionStatement'
]

exports.blockVarFunction = [
  'FunctionDeclaration'
]

exports.functionExpression = [
  'FunctionExpression'
]

exports.arrowFunction = [
  'ArrowFunctionExpression'
]

exports.blockVarFunctionInline = [
  'Property',
  'ObjectPattern',
  'FunctionDeclaration'
]

exports.inlinevar = [
  'Property',
  'ObjectPattern',
  'VariableDeclarator',
  'VariableDeclaration',
  [ 'Program', 'ExportNamedDeclaration' ]
]

exports.variableDeclaration = [
  'VariableDeclarator',
  'VariableDeclaration',
  [ 'Program', 'ExportNamedDeclaration' ]
]

exports.objectProperty = [
  'Property',
  'ObjectExpression'
]
