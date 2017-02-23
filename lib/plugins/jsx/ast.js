const acornjsx = require('acorn-jsx')

const isState = (node, elem) => {
  if (node.callee && node.callee.type === 'MemberExpression') {
    if (node.callee.object.object.name === 'state') {
      // make this into a deep path
      return node.callee.object.property.name
    }
  }
}

const walker = (node, parse) => {
  parse(node)
  const keys = Object.keys(node)
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    if (key === 'parent') continue
    let child = node[key]
    if (Array.isArray(child)) {
      for (let j = 0; j < child.length; j++) {
        let c = child[j]
        if (c && typeof c.type === 'string') {
          walker(c, parse)
        }
      }
    } else if (child && typeof child.type === 'string') {
      walker(child, parse)
    }
  }
}

const evalExpression = (expression, elem, code, prop = 'html') => {
  console.log(expression)
  const state = isState(expression)
  if (state) {
    if (expression.callee.object.object.name === 'state') {
      if (elem[prop]) {
        elem[prop].$ = `'${state}'`
        if (elem[prop].$transform) {
          elem[prop].$transform.push(`state.compute()`)
        }
      } else {
        elem[prop] = { $: `'${state}'` }
      }
    }
  } else if (expression.type === 'BinaryExpression') {
    let state = []
    walker(expression, node => {
      if (isState(node)) {
        state.push(isState(node))
      }
    })
    if (state.length) {
      console.log('!#@!@#!@#', state)
      var codez = code.slice(expression.start, expression.end)
      if (!elem[prop]) elem[prop] = {}
      if (!elem[prop].$) elem[prop].$ = {}
      for (var i in state) {
        elem[prop].$[state[i]] = '\'shallow\''
        codez = codez.replace('state.' + state[i], 'state')
      }
      if (!elem[prop].$transform) elem[prop].$transform = []
      elem[prop].$transform.push(codez)
      // console.log(codez)
    }
    // walk and find
  }
}

// this can just be inserted into the normal ast walker ofcourse
module.exports = file => new Promise((resolve, reject) => {
  const code = file.code.compute()

  // can just add this
  const ast = acornjsx.parse(code, {
    plugins: {
      jsx: true
    },
    sourceType: 'module'
  })

  const replace = []

  walker(ast, node => {
    if (node.type === 'ArrowFunctionExpression') {
      if (node.body && node.body.type === 'JSXElement') {
        const replacement = {
          start: node.start,
          end: node.end
        }

        const elem = {}

        replace.push(replacement)

        const jsx = node.body
        const opening = jsx.openingElement

        if (opening.name.name[0].toLowerCase() === opening.name.name[0]) {
          console.log('regular dom boy')
          elem.tag = `'${opening.name.name}'`
        } else {
          console.log('not dom')
        }

        if (opening.attributes) {
          // console.log(opening.attributes)
          // figure out a good way to do normal attributes as well
          // e.g map attrs or somethign dont know -- '@attr'
          opening.attributes.forEach(child => {
            console.log(child)
            // set to attr when appropriate
            if (!elem[child.name.name]) {
              elem[child.name.name] = {}
            }
            if (child.value.type === 'JSXExpressionContainer') {
              // if (child.value.expression && child.value.expression.type === 'ObjectExpression') {
                // console.log(code.slice(child.value.start + 1, child.value.end - 1))
              elem[child.name.name] = code.slice(child.value.start + 1, child.value.end - 1)
              // }
            } else {
              // bit more ofc...
              elem[child.name.name] = { val: child.raw }
            }
            // value
            // if ()
          })
        }

        if (jsx.children) {
          jsx.children.forEach(child => {
            if (child.type === 'Literal') {
              if (!elem.html) {
                elem.html = {}
              }
              if (!elem.html.$transform) elem.html.$transform = []
              elem.html.$transform.push(`'${child.raw}'`) // good escpaimng
            }
            // this will go html except when the expression holds a function
            if (child.type === 'JSXExpressionContainer') {
              evalExpression(child.expression, elem, code)
            }
          })
        }

        const makeCodes = (elem, arr = []) => {
          arr.push('{')
          for (let key in elem) {
            arr.push(`${key}:`)
            if (typeof elem[key] === 'object' && key === '$transform') {
              var transform = '(val, state) => { return '
              transform += elem[key].join(' + ')
              transform += '}'
              arr.push(transform)
            } else if (typeof elem[key] === 'object') {
              makeCodes(elem[key], arr)
            } else if (typeof elem[key] === 'function') {
              arr.push(elem[key].toString())
            } else {
              arr.push(`${elem[key]}`)
            }
            arr.push(`,`)
          }
          arr.pop()
          arr.push('}')
          return arr
        }
        replacement.val = makeCodes(elem)
        replacement.val = replacement.val.join('')
      }
      // if (node.body && node.body.find(val => val.type === 'JSXElement') > -1) {
      //   console.log('yes go')
      // }
    }
  })

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
  resolve({ result: result.join('') })
})

/*
JSXElement
JSXOpeningElement
JSXIdentifier
JSXClosingElement
JSXIdentifier
JSXExpressionContainer
*/
