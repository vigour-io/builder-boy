const acornjsx = require('acorn-jsx')

const { logTypeChain, showcode } = require('../../log') //eslint-disable-line
const { walker, compile } = require('../../ast')

// const 'atomic is eseenctialy the same'

// const

// expression is allways where you want to replace shit
const findExpression = node => {
  var p = node.parent
  while (p) {
    if (p.type === 'JSXElement') {
      return
    }
    if (p.type === 'ArrowFunctionExpression' || p.type === 'FunctionExpression') {
      return p
    }
    p = p.parent
  }
}

const findElem = node => {
  var p = node.parent
  while (p) {
    if (p.elem) {
      return p.elem
    }
    p = p.parent
  }
}

// identify if
//   -- in expression
//   -- in if statement && in expression

const str = str => `'${str}'` // escape

const JSXElement = (node, code, replace) => {
  if (node.type === 'JSXElement') {
    var pelem = findElem(node)
    var elem
    var replacement
    const expression = findExpression(node)
    if (expression) {
      console.log('found expression')
      replacement = expression
      elem = expression.elem = { _children_: [], _inExpression_: true }
      pelem = false // do this later for switch, etc etc
    } else {
      console.log('replace inline!')
      replacement = node
      elem = node.elem = { _children_: [] }
    }
    if (!pelem) {
      replace.push(replacement)
    } else {
      pelem._children_.push(elem)
    }

    console.log('\n\nJSXElement')
    showcode(code, node)

    const tag = node.openingElement.name.name
    if (tag[0].toLowerCase() === tag[0]) {
      elem.tag = str(tag)
    } else {
      console.log('IS AN ELEMENT -- use type OR SCOPED VAR')
    }
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
    JSXElement(node, code, replace)
  })

  // add elem in replace
  console.log('\n\n\n\n-------RESULT')
  showcode(code, replace)
  // put the replacements in place
  console.log(replace[0].elem)

  const parseCode = (elem, result = []) => {
    result.push('{')
    for (let key in elem) {
      if (key !== '_children_' && key !== '_inExpression_') {
        result.push(`${key}:`)
        // some more checks e.g is it an object...
        result.push(elem[key])
        result.push(',')
      }
    }
    elem._children_.forEach((child, key) => {
      result.push(`${key}:`)
      result.push(parseCode(child).join(''))
      result.push(',')
    })
    if (result[result.length - 1] === ',') result.pop()
    result.push('}')
    return result
  }

  replace.forEach(val => {
    val.val = parseCode(val.elem).join('')
  })

  const result = compile(code, replace)

  console.log(result.join(''))

  resolve({ result: result.join('') })
})

// were going to use this for the normal ast transpiler way cleaner

// keep most expresion intact only thing we need to analyze if if something is state -- thats step 1
