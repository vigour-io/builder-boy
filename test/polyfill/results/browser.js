const $3877244887_a = Object.assign({ a: 5 }, { b: 6 })

const $3877244887_blurf = () => {}

async function $3877244887_bla () {
  await $3877244887_blurf() + '!'
}

if (global.require) {
  const fs = global.require('fs')
  console.log(fs)
}

function $3877244887_x () {
  console.log('hello')
}

function * $3877244887_ballz () {
  yield $3877244887_x()
}

global.fetch('http://google.com').then(() => {}).catch(err => {
  console.log('errrr', err)
})

for (let i of $3877244887_ballz()) {
  console.log(i)
}

$3877244887_bla()
