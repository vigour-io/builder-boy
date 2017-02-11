// uid per file is better
var uid = 0

const { showcode, parseCharIndex } = require('../util') // eslint-disable-line

const addToParent = (node, results) => {
  var p = node.parent
  while (p) {
    if (p.conditionUid) {
      return p.results
    }
    p = p.parent
  }
  return results
}

const addConditional = (node, results, alternate, computed) => {
  if (!node.conditionUid) {
    node.conditionUid = ++uid
    node.results = {}
    const parent = addToParent(node, results)

    console.log('ADD CONDITIONAL')
    if (alternate) {
      parent.alternate = node.results
    } else {
      parent[uid] = node.results
    }
  }
  return node.results
}

// const findUaName = () => {
//   if (ua[i].type === 'imports') {
//     for (let key in ua[i].exports) {
//       // check default as well
//       if (ua[i].exports[key][0]
//   }
// }

const parseTest = (node, ua, results, computed, condition, isLeft) => {
  if (node.type === 'Literal') {
    if (!isLeft) {
      if (!condition[node.parent.operator]) condition[node.parent.operator] = []
      condition[node.parent.operator].push(node.value)
    }
  } else if (node.type === 'Identifier') {
    if (isLeft) {
      if (!condition[node.name]) condition[node.name] = []
      const r = {}
      condition[node.name].push(r)
      return r
    } else {
      throw new Error(
        'Need to find var for UA -- feature will be added later!' +
        parseCharIndex(computed, node.parent.start)
      )
    }
  } else if (node.left) {
    const r = parseTest(node.left, ua, results, computed, condition, true)
    if (r && node.operator !== '||') {
      parseTest(node.right, ua, results, computed, r)
    } else {
      parseTest(node.right, ua, results, computed, condition)
    }
    return r
  }
}

const parseUa = (node, ua, results, computed, alternate) => {
  if (ua.length && (node.type === 'IfStatement' || node.type === 'ConditionalExpression' || alternate)) {
    // showcode(node, false, computed)

    // const obj = addConditional(node, results, alternate, computed)
    // if (node.test) {
    //   if (!obj.test) obj.test = {}
    //   parseTest(node.test, ua, results, computed, obj.test)
    // }
    // if (node.alternate) {
    //   // console.log(node.alternate)
    //   // showcode(node.alternate, false, computed)
    //   parseUa(node.alternate, ua, results, computed, true)
    // }
  }
}

// will become generalized
const handleUa = (ua, imports) => {
  //  exports: { default: 'app' } }
  if (imports.file === 'vigour-ua/navigator') {
    ua.push(imports)
  }
}

exports.parseUa = parseUa
exports.handleUa = handleUa
