const blurf = () => {}

async function bla () {
  await blurf() + '!'
}

const fs = require('fs')

function x () {
  console.log('hello')
}

function * ballz () {
  yield x()
}

for (let i of ballz()) {
  console.log(i)
}

console.log(fs)

bla()
