const buble = require('buble')
const regenerator = require('regenerator')
const noderesolve = require('../resolve')
const path = require('path')

/*
 type: 'FunctionExpression',
     start: 124,
     end: 142,
     id: null,
     generator: true,

*/

const hasEs6 = (node, es6) => {
  const type = node.type

  if (
    type === 'ObjectPattern' ||
    type === 'TemplateLiteral' ||
    type === 'ArrowFunctionExpression' ||
    type === 'RestElement' ||
    (node.kind === 'let' || node.kind === 'const') ||
    type === 'Property' && (node.shorthand || node.computed)
  ) {
    es6.val = true
  } else if (type === 'FunctionExpression' && node.generator === true) {
    es6.generator = true
    es6.val = true
  }

  // Promise && fetch

  // const inlineobj = /\[.+\] {0,5}:/
  // const constCheck = /const /
}

// lets do from ast as well
// const hasGenerator = () => {

// }

// very slow obviously but we can replace buble later
// or just inline buble (copy the code) so we can use the same ast...
// at least make it optional

const transpile = ({ result, es6, dependencies }) => new Promise((resolve, reject) => {
  var es5
  // super loose check but fine for now...
  // maybe add hasGenerator
  if (es6.val) {
    // console.log('IS ES6!')
    if (es6.generator) {
      console.log('has generator -- add shim')
      es5 = regenerator.compile(result).code
      es5 = buble.transform(es5).code
      noderesolve('regenerator-runtime/runtime', (err, runtime) => {
        if (err) {
          reject(err)
        } else {
          // only for borwser ofc...
          dependencies.push({ node: path.join(__dirname, '../resolve/empty.js'), browser: runtime })
          resolve({ result, dependencies, es5 })
        }
      })
    } else {
      es5 = buble.transform(result).code
      resolve({ result, dependencies, es5 })
    }
  } else {
    es5 = result
    resolve({ result, dependencies, es5 })
  }
})

exports.hasEs6 = hasEs6
exports.transpile = transpile
