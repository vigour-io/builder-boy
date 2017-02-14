import br from 'brisky-render'
import nav from 'vigour-ua/navigator'
// // import hub from '../../../hub.js'
const bla = require('./bla.json')

// // const exotic = require('./exotic')
// // console.log(exotic)

// // // const fs = require('fs')

// // const state = {
// //   hello: 'hello what?'
// // }

// const x = new Promise((resolve, reject) => {

// })

// fetch('http://google.com', () => {})

// console.log('hello')

// async function x (x) {
//   if (x) return await x - 1
//   return 0
// }

// x().then(() => {
//   console.log('lullz')
// })
// const blax = function * () {
//   yield 'poop'
//   yield 'yuz'
// }

// const it = blax()
// for (var i of it) {
//   console.log('?', i)
// }
// console.log(x())
// var blax = new Promise()
// fetch('http://google.com')

// const state = {
//   hello: 'HELLO!1'
// }

// // // // // console.log(state

if (nav.device === 'tablet') {
  console.log('lulllz')
}

if (nav.device === 'phone') {
  console.log('dirt')
}

module.exports = br.render({
  text: { $: 'hello' },
  ua: {
    style: { fontSize: '25px' },
    text: JSON.stringify(nav, false, 2)
  },
  bla: {
    text: JSON.stringify(bla, false, 2),
    style: {
      marginTop: '15px',
      fontSize: '20px'
    }
  },
  style: {
    color: nav.browser === 'ie' ? 'blue' : nav.device === 'phone' ? 'rgb(20, 20, 20)' : 'yellow',
    // padding: webview === 'ploy-native' ? '15px' : '30px',
    margin: '0 auto',
    marginTop: '150px',
    // background: nav.device === 'tablet' ? 'blue' : 'pink',
    borderRadius: '15px',
    transform: { rotate: 0 },
    // fontSize: nav.browser === 'firefox' ? '250px' : '50px',
    textAlign: 'center',
    fontFamily: 'helvetica'
  },
  on: {
    click: () => {
      console.log('do it!')
    }
  }
}, bla)

// // // setInterval(() => {
// // //   window.location.reload()
// // // }, 200)
// // import { struct } from 'brisky-struct'
