const acornjsx = require('acorn-jsx')

const { logTypeChain, showcode } = require('../../log') //eslint-disable-line
const { walker, compile, parent } = require('../../ast')
const beautify = require('js-beautify')
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

const str = str => `'${str}'` // escape ' etc can also use template literals more safe

const expression = (node, code, replace) => {
  if (node.value) {
    return code.slice(node.value.start + 1, node.value.end - 1)
  } else if (node.expression) {
    return code.slice(node.expression.start, node.expression.end)
  }
}

const text = (node, elem, val) => {
  if (!elem.text) elem.text = {}
  if (elem.text.$) {
    console.log('handle subs from literal')
  } else {
    if (elem.text.val === void 0) {
      elem.text.val = '``'
      val = val.replace(/^\s+/, '')
    }
    elem.text.val = elem.text.val.slice(0, -1)
    elem.text.val += val + '`'
  }
}

const JSXExpressionContainer = (node, code, replace) => {
  if (node.type === 'JSXExpressionContainer' && parent(node, [ 'JSXElement' ])) {
    const elem = findElem(node)
    text(node, elem, '${' + expression(node, code, replace) + '}')
  }
}

const JSXLiteral = (node, code, replace) => {
  if (
    node.type === 'Literal' &&
    parent(node, [ 'JSXElement' ]) && // not for attr!
    node.value &&
    node.value !== '\n' &&
    !/^\s+$/.test(node.value)
  ) {
    console.log('\n\nLiteral')
    const elem = findElem(node)
    text(node, elem, node.value.replace(/\s+/g, ' ').replace(/\n/g, ''))
    showcode(code, node)
  }
}

const JSXAtribute = (node, code, replace) => {
  if (node.type === 'JSXAttribute') {
    console.log('\nJSXAttribute')
    const name = node.name.name
    const elem = findElem(node)
    if (node.value) {
      if (node.value.type === 'JSXExpressionContainer') {
        // this will be handled by a special function
        elem._attributes_[name] = expression(node, code, replace)
      } else if (node.value.type === 'Literal') {
        elem._attributes_[name] = str(node.value.value)
      }
    }
    showcode(code, node)
  }
}

const JSXElement = (node, code, replace) => {
  if (node.type === 'JSXElement') {
    var pelem = findElem(node)
    var elem
    var replacement
    const expression = findExpression(node)
    if (expression) {
      console.log('found expression')
      replacement = expression
      elem = expression.elem = { _children_: [], _attributes_: {}, _inExpression_: true }
      pelem = false // do this later for switch, etc etc
    } else {
      console.log('replace inline!')
      replacement = node
      elem = node.elem = { _children_: [], _attributes_: {} }
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
      console.log('IS AN ELEMENT -- use type OR scoped var')
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
    JSXLiteral(node, code, replace)
    JSXAtribute(node, code, replace)
    JSXExpressionContainer(node, code, replace)
  })

  // add elem in replace
  console.log('\n\n\n\n-------RESULT')
  showcode(code, replace)
  // put the replacements in place
  console.log(replace[0].elem)

  const parseCode = (elem, result = []) => {
    result.push('{')
    for (let key in elem) {
      if (key !== '_children_' && key !== '_attributes_' && key !== '_inExpression_') {
        result.push(`${key}:`)
        if (key === 'text') {
          if (elem[key].val) {
            elem[key].val = elem[key].val.replace(/\s+`$/, '`')
          }
        }
        // some more checks e.g is it an object...
        if (typeof elem[key] === 'object') {
          parseCode(elem[key], result)
        } else {
          result.push(elem[key])
        }
        result.push(',')
      }
    }

    if (elem._children_) {
      elem._children_.forEach((val, key) => {
        if (val._attributes_ && val._attributes_.key) {
          key = val._attributes_.key
          if (key[0] !== "'" && key[0] !== '"' && !(isNaN(key * 1))) {
            key = `[${key}]`
          }
        }
        result.push(`${key}:`)
        result.push(parseCode(val).join(''))
        result.push(',')
      })
    }

    if (elem._attributes_ && Object.keys(elem._attributes_).length) {
      result.push('resolveAttr:')
      if (elem._attributes_.key) {
        delete elem._attributes_.key
      }
      parseCode(elem._attributes_, result)
      result.push(',')
    }

    if (result[result.length - 1] === ',') result.pop()
    result.push('}')
    return result
  }

  replace.forEach(val => {
    val.val = parseCode(val.elem).join('')
  })

  const result = beautify(compile(code, replace).join(''), { indent_size: 2 })

  console.log('--------------------------')
  console.log(result)
  console.log('--------------------------')

  resolve({ result: result })
})

// were going to use this for the normal ast transpiler way cleaner

// keep most expresion intact only thing we need to analyze if if something is state -- thats step 1
