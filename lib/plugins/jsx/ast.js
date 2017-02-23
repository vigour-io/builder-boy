const acornjsx = require('acorn-jsx')

const { logTypeChain, showcode } = require('../../log') //eslint-disable-line
const { walker, compile } = require('../../ast')

// expression is allways where you want to replace shit
const findExpression = node => {
  var p = node.parent
  while (p) {
    if (p.type === 'ArrowFunctionExpression' || p.type === 'FunctionExpression') {
      return p
    }
    p = p.parent
  }
}

const JSXContainer = (node, code, replace) => {
  if (node.type === 'JSXExpressionContainer') {
    const expression = findExpression(node)
    if (expression) {
      console.log('found expression')
      // check for switch
      showcode(code, expression)
    } else {
      console.log('replace inline!')
    }
    // this is what we replace
  }
}

module.exports = file => new Promise(resolve => {
  const code = file.code.compute()
  // can just add this to normal parser
  const ast = acornjsx.parse(code, {
    plugins: {
      jsx: true
    },
    sourceType: 'module'
  })

  const replace = []

  walker(ast, node => {
    // logTypeChain(node)
    if (JSXContainer(node, code, replace)) {
      return true // means dont go nested
    }
  })

  const result = compile(code, replace)

  resolve({ result: result.join('') })
})

// were going to use this for the normal ast transpiler way cleaner

// keep most expresion intact only thing we need to analyze if if something is state -- thats step 1
