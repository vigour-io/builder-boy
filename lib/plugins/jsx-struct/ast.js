const acornjsx = require('acorn-jsx')
const beautify = require('js-beautify')
const { logTypeChain, showcode } = require('../../log') //eslint-disable-line
const { walker, compile } = require('../../ast')

module.exports = (file, ast) => new Promise(resolve => {
  const code = file.code.compute()
  if (!ast) {
    ast = acornjsx.parse(code, {
      plugins: { jsx: true },
      sourceType: 'module',
      allowHashBang: true
    })
  }
  const replace = []
  walker(ast, node => {
    showcode(code, node)
    // JSXElement(node, code, replace)
    // JSXLiteral(node, code, replace)
    // JSXAttribute(node, code, replace)
    // JSXExpressionContainer(node, code, replace)
  })
  // replace.forEach(val => {
    // if (!val.elem._parsed_) {
      // val.val = parseCode(val.elem, replace, code).join('')
    // }
  // })
  const result = beautify(compile(code, replace).join(''), { indent_size: 2 })

  // console.log('------------------')
  // console.log(result.replace(/\/\/.+\n/g, ''))
  resolve({ result })
})
