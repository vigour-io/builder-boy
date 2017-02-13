const buble = require('buble')
const regenerator = require('regenerator')
const noderesolve = require('../resolve')
const path = require('path')
const chalk = require('chalk')
const asyncToGen = require('async-to-gen')
// const { showcode } = require('../util')

// later make these things optional

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
  }

  if (node.async === true) {
    es6.val = true
    es6.generator = true
    es6.async = true
  }

  if (type === 'FunctionExpression' && node.generator === true) {
    es6.generator = true
    es6.val = true
  }

  if (node.name === 'Promise') {
    // bit dirty needs to check if its not overwritten but fine for now... do later when scopes
    es6.val = true
    es6.promise = true
  }

  // console.log(node)
  if (type === 'CallExpression' && node.callee.name === 'fetch') { // same stuff pretty weak
    // console.log('FETCH')
    es6.val = true // not rly but fuck it
    es6.fetch = true
  }
}

const empty = path.join(__dirname, '../resolve/empty.js')

const addDependency = ({ browser, dependencies, result }) => new Promise((resolve, reject) => {
  // add node fallback as well
  noderesolve(browser, (err, file) => {
    if (err) {
      reject(err)
    } else {
      dependencies.push({
        node: empty,
        browser: file,
        external: {
          polyfill: true,
          node: empty,
          browser: file,
          val: browser
        }
      })
      resolve()
    }
  })
})

const transpile = ({ result, es6, dependencies, file }) => new Promise((resolve, reject) => {
  var es5

  if (es6.val) {
    if (es6.generator || es6.promise || es6.fetch) {
      const deps = []

      if (es6.async) {
        console.log('  ', chalk.blue('has async -- convert to generator'), file.key)
        result = asyncToGen(result).toString()
      }

      if (es6.fetch) {
        console.log('  ', chalk.blue('has fetch -- add shim'), file.key)
        deps.push(addDependency({ browser: 'whatwg-fetch', dependencies, result }))
        // deps.push(addDependency({ node: 'node-fetch', dependencies, result }))
      }

      if (es6.generator) {
        console.log('  ', chalk.blue('has generator -- add shim'), file.key)
        es5 = regenerator.compile(result).code
        deps.push(addDependency({ browser: 'regenerator-runtime/runtime', dependencies, result }))
      }

      if (es6.promise) {
        console.log('  ', chalk.blue('has promise -- add shim'), file.key)
        deps.push(addDependency({ browser: 'promise-polyfill', dependencies, result }))
      }

      Promise.all(deps).then(() => {
        es5 = buble.transform(es5 || result).code
        resolve({ result, dependencies, es5 })
      }).catch(err => reject(err))
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
