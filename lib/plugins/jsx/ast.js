const acornjsx = require('acorn-jsx')

const { logTypeChain } = require('../../log')
const { walker, compile } = require('../../ast')

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
    logTypeChain(node)
  })

  const result = compile(code, replace)

  resolve({ result: result.join('') })
})

// were going to use this for the normal ast transpiler way cleaner

// keep most expresion intact only thing we need to analyze if if something is state -- thats step 1
