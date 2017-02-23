const acornjsx = require('acorn-jsx')

const { walker, compile } = require('../../ast')

module.exports = file => new Promise((resolve, reject) => {
  console.log('GO JSX')

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

  })

  const result = compile(code, replace)

  resolve({ result: result.join('') })
})

// were going to use this for the normal ast transpiler way cleaner
