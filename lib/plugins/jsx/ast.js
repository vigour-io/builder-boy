const acornjsx = require('acorn-jsx')

module.exports = file => new Promise((resolve, reject) => {
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
const compile = (code, replace) => {
  var r = 0
  var result = []
  for (let i = 0, len = code.length; i < len; i++) {
    if (replace[r] && replace[r].start === i) {
      result.push(replace[r].val)
      i += replace[r].end - replace[r].start
      r++
    } else {
      result.push(code[i])
    }
  }
  console.log('-------RESULT-------')
  console.log('---->', result.join(''))
}

