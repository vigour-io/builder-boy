import bb from './b'
import * as success from './b'
import { a } from './b'
require('./a')

var obj = {
  foo: 'baz'
}

const haha = {
  bla: obj
}
const { a, b } = 'blur'

var x = {}
x.blarf = true
console.log(x.blarf)

function smurk (a, b) {
  console.log(a, b)
  console.log()
}

smurk()

export default 'a!' + bb
