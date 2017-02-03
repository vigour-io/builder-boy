import bla from './b'
// console.log(bla)
// var a = bla
// // bla is shit
// // need to put this in scope
// var x = true

// ;(function (a) {
//   var bla = 'x'
//   console.log(a, bla)
// })()

const x = true

var y = () => bla

var bla = {
  hello (x) {
    console.log('x', x, bla)
  }
}

class StyleSheet {
  constructor (t) {
    console.log(t)
  }
}

function dirt (a = x, b = bla, { c: g, d }) {
  var b = x
  var c = b
  var d = bla
}

for (var i = 0; i < 10; i++) {
  console.log(bla)
}

// // export default a
// // export default '!'
