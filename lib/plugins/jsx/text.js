const { str } = require('./util')

const whitespace = (re, val) => {
  var whitespaces = val.match(re)
  whitespaces = whitespaces && whitespaces[0].match(/\s/g)
  const cnt = whitespaces && whitespaces.length % 2
  return cnt
}

const text = (node, elem, val, $, keys) => {
  if (!$) {
    const left = whitespace(/^\s+/, val)
    if (/^\s+$/.test(val) && !left) return
    const right = whitespace(/\s+$/, val)
    val = val.replace(/^\s+/, (new Array(left)).fill(' '))
    val = val.replace(/\s+$/, (new Array(right)).fill(' '))
  }

  const text = { type: str('text') }
  // if (!elem.text) {
  elem._children_.push(text)
  // }

  if ($) {
    text.$ = $
    text._$keysmap_ = keys
  }

  if (text.val === void 0) {
    text.val = '``'
  }
  text.val = text.val.slice(0, -1)
  text.val += val + '`'
}

module.exports = text

/*
&&
    !/^\s+$/.test(node.value)
*/
