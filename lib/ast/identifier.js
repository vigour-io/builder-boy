const parent = require('./parent')
const hasLocalVar = require('./localvar')

const {
  blockVar,
  blockVarFunction,
  functionExpression,
  arrowFunction,
  blockVarFunctionInline,
  inlinevar,
  variableDeclaration,
  objectProperty
} = require('./patterns')

const isImport = (node) => {
  while (node) {
    if (node.type === 'ImportDeclaration') {
      return true
    }
    node = node.parent
  }
}

const getFn = node => {
  while (node) {
    if (
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression'
    ) {
      return node
    }
    node = node.parent
  }
}

// call this fromStore / from list
const setStore = (node, replaceImports, insertId, store, shorthand) => {
  // console.log('setStore:', node.name, node.type, parent(node, memberAssignment), node.parent.property !== node)
  if (
    store[node.name] &&
    (
      (
        (
          !parent(node, objectProperty) || (
            node.parent.key !== node ||
            node.parent.shorthand ||
            node.parent.computed
          )
        ) && (node.parent.property !== node || node.parent.computed)
      )
    )
  ) {
    if (!hasLocalVar(node)) {
      // also need to put import if nessecary ofc...
      if (node.parent.shorthand) {
        if (
          !shorthand[shorthand.length - 1] ||
          shorthand[shorthand.length - 1].start !== node.start
        ) {
          shorthand.push({ start: node.start, name: node.name })
        }
      }

      if (store[node.name] !== true && store[node.name].type === 'imports') {
        if (
          !replaceImports[replaceImports.length - 1] ||
          replaceImports[replaceImports.length - 1].start !== node.start
        ) {
          if (!isImport(node)) {
            replaceImports.push({ start: node.start, name: node.name, store: store[node.name] })
          }
        }
      } else if (store[node.name] === true) {
        if (insertId[insertId.length - 1] !== node.start) {
          insertId.push(node.start)
        }
      }
    }
    return true
  }
}

const identifier = (node, replaceImports, insertId, store, shorthand) => {
  if (node.name && node.type === 'Identifier') {
    if (parent(node, blockVar)) { // || parent(node, blockInlinevar)
      if (!node.parent.id.name !== node.name) {
        setStore(node, replaceImports, insertId, store, shorthand)
      } else {
        const fn = getFn(node)
        if (fn) {
          if (!fn.localVars) { fn.localVars = {} }
          fn.localVars[node.name] = true
        }
      }
    } else if (
      parent(node, blockVarFunction) ||
      parent(node, blockVarFunctionInline) ||
      parent(node, arrowFunction) ||
      parent(node, functionExpression)
    ) {
      if (node.parent.id === node && (
        node.parent.parent.type === 'Program' || node.parent.parent.type === 'ExportNamedDeclaration'
      )) {
        store[node.name] = true
        if (insertId[insertId.length - 1] !== node.start) insertId.push(node.start)
      } else {
        const fn = getFn(node)
        if (!fn.localVars) { fn.localVars = {} }
        fn.localVars[node.name] = true
      }
    } else if (parent(node, inlinevar) || parent(node, variableDeclaration)) {
      if (store[node.name] && store[node.name] !== true && store[node.name].type === 'imports') {
        if (
          !replaceImports[replaceImports.length - 1] ||
          replaceImports[replaceImports.length - 1].start !== node.start
        ) {
          replaceImports.push({ start: node.start, name: node.name, store: store[node.name] })
        }
      } else {
        store[node.name] = true
        if (insertId[insertId.length - 1] !== node.start) {
          insertId.push(node.start)
        }
      }
    } else {
      setStore(node, replaceImports, insertId, store, shorthand)
    }
  }
}

module.exports = identifier
