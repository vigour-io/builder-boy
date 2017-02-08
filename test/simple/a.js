import { v, xx } from './d'
import { x } from './b'
import c from './c'

const a = 'a'
const b = 'b'

// export { a, b, c }

// something wrong here
// order of assignment
console.log(c, ' --- ', x, ' --- ',  v, xx)

// export default listen
// function listen () {
//   console.log(c)
// }

/*
import { getFn, getData, get } from '../get'
import { getKeys } from '../keys'
import subscription from './subscription'
*/

export { a, b }
