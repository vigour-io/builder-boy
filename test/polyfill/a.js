const a = Object.assign({ a: 5 }, { b: 6 })

const blurf = () => {}

async function bla () {
  await blurf() + '!'
}

if (global.require) {
  const fs = global.require('fs')
  console.log(fs)
}

function x () {
  console.log('hello')
}

function * ballz () {
  yield x()
}

global.fetch('http://google.com').then(() => {}).catch(err => {
  console.log('errrr', err)
})

for (let i of ballz()) {
  console.log(i)
}

bla()
