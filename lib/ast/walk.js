const walk = (node, parent, cb, blocks) => {
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
          c.parent = node
          walktargets.push(c)
        }
      }
    } else if (child && typeof child.type === 'string') {
      child.parent = node
      walktargets.push(child)
    }
  }

  var ex
  var later = []
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
        walk(c, node, cb, blocks)
      } else {
        later.push(c)
      }
    }
  })

  later.forEach(c => walk(c, node, cb, blocks))

  if (ex) ex.forEach(c => { walk(c, node, cb, blocks) })
}

module.exports = walk
