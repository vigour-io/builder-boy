var cnt = 0
const globalMap = {}

// const combinations = {}

const uid = num => {
  const div = num / 26 | 0
  var str = String.fromCharCode(97 + num % 26)
  if (div) {
    if (div / 26 | 0) {
      str = str + uid(div)
    } else {
      str = str + String.fromCharCode(97 + div % 26)
    }
  }
  return str
}

const isOperator = x => x === '===' ||
  x === '>' ||
  x === '<' ||
  x === '==' ||
  x === '!=' ||
  x === '!==' ||
  x === '>=' ||
  x === '<='

const parseOperator = (operator, key, variable) => {
  if (operator.length > 1) {
    throw new Error('w000t')
  }
  // remove extra array
  for (let j in operator) {
    const parsed = variable + key + operator[j]
    if (!globalMap[parsed]) {
      globalMap[parsed] = parsed
    }
    return globalMap[parsed]
  }
}

// const parseTest = (test, variable, travel) => {
//   for (var key in test) {
//     if (isOperator(key)) {
//       if (!travel.val) travel.val = []
//       travel.val.push(parseOperator(test[key], key, variable))
//     } else if (Array.isArray(test[key])) {
//       // here we are branching
//       test[key].forEach((val, x) => {
//         // if (test[key].length > 1) {
//         travel[x] = { val: travel.val.concat() }
//         // delete travel.val
//         parseTest(val, key, travel[x])
//         // } else {
//         //   parseTest(val, key, travel)
//         // }
//       })
//     } else if (typeof test[key] === 'object') {
//       parseTest(test[key], key, travel)
//     }
//   }
// }

const cleanup = (val, arr) => {
  if (val.val && Object.keys(val).length === 1) {
    arr.push(val.val)
  } else {
    for (var i in val) {
      if (i !== 'val') {
        cleanup(val[i], arr)
      }
    }
  }
  return arr
}

const parseua = (ua) => {
  console.log(JSON.stringify(ua.test, false, 2))
}

module.exports = ua => {
  const trueResult = {}
  // console.log('ua:', JSON.stringify(ua, false, 2))
  for (var key in ua) {
    if (key !== 'hash') {
      parseua(ua[key], trueResult)
    }
  }

  console.log(globalMap)
}
