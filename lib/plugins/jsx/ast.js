const acornjsx = require('acorn-jsx')
const beautify = require('js-beautify')
const { logTypeChain, showcode } = require('../../log') //eslint-disable-line
const { walker, compile } = require('../../ast')
const parseCode = require('./compile')
const { JSXElement, JSXLiteral, JSXExpressionContainer } = require('./element')
const { JSXAttribute } = require('./attribute')

module.exports = file => new Promise(resolve => {
  const code = file.code.compute()
  const ast = acornjsx.parse(code, {
    plugins: {
      jsx: true
    },
    sourceType: 'module'
  })
  const replace = []
  walker(ast, node => {
    JSXElement(node, code, replace)
    JSXLiteral(node, code, replace)
    JSXAttribute(node, code, replace)
    JSXExpressionContainer(node, code, replace)
  })
  replace.forEach(val => {
    if (!val.elem._parsed_) {
      val.val = parseCode(val.elem, replace, code).join('')
    }
  })
  const result = beautify(compile(code, replace).join(''), { indent_size: 2 })
  console.log('--------------------------')
  // console.log(result)
  // console.log('--------------------------')
  resolve({ result: result })
})

// were going to use this for the normal ast transpiler way cleaner
// keep most expresion intact only thing we need to analyze if if something is state -- thats step 1
