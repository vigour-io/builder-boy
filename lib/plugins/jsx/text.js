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

  if (!elem.text) {
    elem.text = { _text_: true }
    elem._children_.push(elem.text)
  }

  if ($) {
    elem.text.$ = $
    elem.text._$keysmap_ = keys
  }

  if (elem.text.val === void 0) {
    elem.text.val = '``'
    // const cnt = val.match(/^(\s)+/)
    // if (cnt) {
    //   console.log(cnt.length % 2, cnt.length, cnt)
    //   val = val.replace(/^\s+/, (new Array(cnt.length % 2)).fill(' '))
    // }
    // console.log('---->', `"${val}"`)
  }
  elem.text.val = elem.text.val.slice(0, -1)
  elem.text.val += val + '`'
}

module.exports = text

/*
&&
    !/^\s+$/.test(node.value)
*/
