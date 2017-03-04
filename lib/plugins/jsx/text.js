const { str, prefixSubscription } = require('./util')

const whitespace = (re, val) => {
  var whitespaces = val.match(re)
  whitespaces = whitespaces && whitespaces[0].match(/\s/g)
  const cnt = whitespaces && whitespaces.length % 2
  return cnt
}

const text = (node, elem, val, $) => {
  if (!$) {
    const left = whitespace(/^\s+/, val)
    if (/^\s+$/.test(val) && !left) return
    const right = whitespace(/\s+$/, val)
    val = val.replace(/^\s+/, (new Array(left)).fill(' '))
    val = val.replace(/\s+$/, (new Array(right)).fill(' '))
  }

  const text = { type: str('text') }
  elem._children_.push(text)

  if ($) {
    text.$ = $.$multi.length > 1 ? $.$object : $.$
    text._$prefix = prefixSubscription($)
    text._$keysmap_ = $.keys
  }

  text.val = val
}

module.exports = text
