const { hasEs6 } = require('./es5')
// first add parent then walk em

// pretty heavy but ok for now -- later we just pass parent
const addParent = (node) => {
  var keys = Object.keys(node)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (key === 'parent') continue
    var child = node[key]
    if (Array.isArray(child)) {
      for (var j = 0; j < child.length; j++) {
        var c = child[j]
        if (c && typeof c.type === 'string') {
          c.parent = node
          addParent(c)
        }
      }
    } else if (child && typeof child.type === 'string') {
      child.parent = node
      addParent(child)
    }
  }
}

const walk = (node, parent, cb, blocks, es6) => {
  hasEs6(node, es6)

  if (!node.parent) addParent(node)

  var keys = Object.keys(node)

  var walktargets = []

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (key === 'parent') continue
    var child = node[key]
    if (Array.isArray(child)) {
      for (var j = 0; j < child.length; j++) {
        var c = child[j]
        if (c && typeof c.type === 'string') {
          walktargets.push(c)
        }
      }
    } else if (child && typeof child.type === 'string') {
      walktargets.push(child)
    }
  }

  var ex
  var later
  cb(node)

  walktargets.forEach((c) => {
    if (blocks && (c.type === 'BlockStatement' || node.type === 'ArrowFunctionExpression') || node.type === '') {
      blocks.push({ c, node, cb, blocks })
    } else if (c.type === 'ExportDefaultDeclaration' || c.type === 'ExportNamedDeclaration') {
      if (!ex) {
        ex = []
      }
      ex.push(c)
    } else {
      if (c.parent.type === 'Program' && c.type === 'FunctionDeclaration') {
        walk(c, node, cb, blocks, es6)
      } else {
        if (!later) later = []
        later.push(c)
      }
    }
  })

  if (later) later.forEach(c => walk(c, node, cb, blocks, es6))

  if (ex) ex.forEach(c => { walk(c, node, cb, blocks, es6) })
}

module.exports = walk
