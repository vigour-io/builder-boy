const walker = (node, parse, parent) => {
  if (parent) node.parent = parent
  if (!parse(node)) {
    const keys = Object.keys(node)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (key === 'parent') continue
      let child = node[key]
      if (Array.isArray(child)) {
        for (let j = 0; j < child.length; j++) {
          let c = child[j]
          if (c && typeof c.type === 'string') walker(c, parse, node)
        }
      } else if (key !== 'elem' && child && typeof child.type === 'string') {
        walker(child, parse, node)
      }
    }
  }
}

const compile = (code, replace) => {
  replace.sort((a, b) => a.start - b.start)
  var r = 0
  const result = []
  for (let i = 0, len = code.length; i < len + 1; i++) {
    while (replace[r] && replace[r].start < i) { r++ }
    if (replace[r] && replace[r].start === i) {
      const skip = replace[r].end - replace[r].start
      result.push(replace[r].val)
      if (!skip) {
        result.push(code[i])
      } else {
        i += skip
      }
      r++
    } else if (i !== len) {
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
    const field = arr[len - i]
    if (typeof field === 'object') {
      let cnt = len
      for (let j = 0, len = field.length; j < len; j++) {
        if (node.type === field[j]) {
          cnt--
        }
      }
      if (cnt === len) return false
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
    if (p.type === type) return true
    p = p.parent
  }
}

exports.parentType = parentType

exports.parent = parent

exports.walker = walker

exports.compile = compile
