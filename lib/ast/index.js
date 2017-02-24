const walker = (node, parse, parent) => {
  node.parent = parent
  if (!parse(node)) {
    const keys = Object.keys(node)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (key === 'parent') continue
      let child = node[key]
      if (Array.isArray(child)) {
        for (let j = 0; j < child.length; j++) {
          let c = child[j]
          if (c && typeof c.type === 'string') {
            walker(c, parse, node)
          }
        }
      } else if (child && typeof child.type === 'string') {
        walker(child, parse, node)
      }
    }
  }
}

const compile = (code, replace) => {
  var r = 0
  const result = []
  for (let i = 0, len = code.length; i < len; i++) {
    if (replace[r] && replace[r].start === i) {
      result.push(replace[r].val)
      const skip = replace[r].end - replace[r].start
      if (!skip) {
        result.push(code[i])
      } else {
        i += skip
      }
      r++
    } else {
      result.push(code[i])
    }
  }
  return result
}

const parent = (node, arr) => {
  let len = arr.length - 1
  let i = arr.length
  node = node.parent
  while (node && i--) {
    let field = arr[len - i]
    if (typeof field === 'object') {
      let cnt = len
      for (let j = 0, len = field.length; j < len; j++) {
        if (node.type === field[j]) {
          cnt--
        }
      }
      if (cnt === len) {
        return false
      }
    } else if (node.type !== field) {
      return false
    }
    node = node.parent
  }
  return true
}

const parentType = (node, type) => {
  var p = node
  while (p) {
    if (p.type === type) {
      return true
    }
    p = p.parent
  }
}

exports.parentType = parentType

exports.parent = parent

exports.walker = walker

exports.compile = compile
