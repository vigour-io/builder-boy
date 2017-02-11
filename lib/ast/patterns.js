exports.blockVar = [
  'VariableDeclarator',
  'VariableDeclaration',
  'BlockStatement'
]

exports.fnOnTop = [
  'CallExpression',
  'ExpressionStatement',
  'Program'
]

exports.reqPattern = [
  'CallExpression',
  'VariableDeclarator',
  'VariableDeclaration',
  'Program'
]

exports.reqPatternCalledByFn = [
  'CallExpression',
  'CallExpression',
  'VariableDeclarator',
  'VariableDeclaration',
  'Program'
]

exports.exportsPath = [
  'MemberExpression',
  'AssignmentExpression',
  'ExpressionStatement',
  'Program'
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

exports.exportAssign = [
  'AssignmentExpression',
  'AssignmentExpression',
  'ExpressionStatement',
  'Program'
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
