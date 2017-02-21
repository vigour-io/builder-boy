import b from './b'
import * as blurf from './c'
var x = b
const bla = (x, b) => {
  console.log(x, b)
}
console.log(b, blurf, bla(1, 2), x)
