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

module.exports = parent
