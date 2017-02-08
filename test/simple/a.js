import { c } from './c'

const a = 'a'
const b = 'b'

export { a, b, c }

// something wrong here
// order of assignment
export default listen
function listen () {
  console.log(c)
}
