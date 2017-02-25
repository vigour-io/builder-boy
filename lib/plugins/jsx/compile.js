const { isEvent } = require('./util')

const parseCode = (elem, replace, code, result = []) => {
  const isArray = Array.isArray(elem)
  result.push(isArray ? '[' : '{')
  for (let key in elem) {
    if (
      key !== '_children_' &&
      key !== '_attributes_' &&
      key !== '_inExpression_' &&
      key !== '_parsed_' &&
      key !== '_isFn_' &&
      key !== '_$keysmap_'
    ) {
      if (!isArray) result.push(`${key}:`)
      // if (key === 'text' && elem[key].val) {
      //   // elem[key].val = elem[key].val.replace(/\s+`$/, '`')
      // }
      if (typeof elem[key] === 'object') {
        if (elem[key].$ && elem[key].val) {
          if (elem[key].val._isFn_) {
            elem[key].$transform = `($val, ${elem[key]._$keysmap_[0]}) => ${elem[key].val._isFn_}`
          } else {
            elem[key].$transform = `($val, ${elem[key]._$keysmap_[0]}) => {return ${elem[key].val}}`
          }
          delete elem[key].val
        }

        if (elem[key].nestedJSX) {
          expressionCompilation(replace, code, elem, key, result)
        } else {
          parseCode(elem[key], replace, code, result)
        }
      } else {
        result.push(elem[key])
      }
      result.push(',')
    }
  }

  if (elem._children_) {
    elem._children_.forEach((val, key) => {
      key = 'child' + key
      if (val._attributes_ && val._attributes_.key) {
        key = val._attributes_.key
        if (key[0] !== "'" && key[0] !== '"') key = `[${key}]`
      }
      result.push(`${key}:`)
      result.push(parseCode(val, replace, code).join(''))
      result.push(',')
    })
  }

  if (elem._attributes_ && Object.keys(elem._attributes_).length) {
    let block, on
    if (elem._attributes_.key) {
      delete elem._attributes_.key
    }

    for (let key in elem._attributes_) {
      if (isEvent(key)) {
        if (!on) on = {}
        let event = key.slice(2)
        event = event[0].toLowerCase() + event.slice(1)
        on[event] = elem._attributes_[key]
        delete elem._attributes_[key]
      }
    }

    block = !Object.keys(elem._attributes_).length

    if (!block) {
      result.push('resolveAttr:')
      parseCode(elem._attributes_, replace, code, result)
      result.push(',')
    }

    if (on) {
      result.push('on:')
      parseCode(on, replace, code, result)
      result.push(',')
    }
  }

  elem._parsed_ = true
  if (result[result.length - 1] === ',') result.pop()
  result.push(isArray ? ']' : '}')
  return result
}

const expressionCompilation = (replace, code, elem, key, result) => {
  var expression
  var start, end
  if (elem[key].$any) {
    start = elem[key].arguments[0].start
    end = elem[key].arguments[0].end
  } else {
    start = elem[key].start
    end = elem[key].end
  }
  expression = code.slice(start, end)

  var correction = 0
  replace.forEach(val => {
    if (val.start >= start && val.end <= end) {
      const str = parseCode(val.elem, replace, code).join('')
      const s = val.start - start + correction
      const e = val.end - start + correction
      const l = expression.slice(0, s)
      const r = expression.slice(e)
      const old = val.end - val.start
      const newl = str.length
      correction += newl - old
      expression = l + str + r
    }
  })
  result.push(expression)
}

module.exports = parseCode
