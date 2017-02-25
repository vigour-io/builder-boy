const text = (node, elem, val, $, keys) => {
  if (!elem.text) elem.text = {}
  if ($) {
    elem.text.$ = $
    elem.text._$keysmap_ = keys
  }
  if (elem.text.val === void 0) {
    elem.text.val = '``'
    val = val.replace(/^\s+/, '')
  }
  elem.text.val = elem.text.val.slice(0, -1)
  elem.text.val += val + '`'
}

module.exports = text
