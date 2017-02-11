import { device, platform as blurf } from 'vigour-ua/navigator'
// const { platform, device: smurt } = require('vigour-ua/navigator')
// const x = require('vigour-ua/navigator')
// import y from 'vigour-ua/navigator'

// // also with require ofc...
if (device === 'phone') {
  console.log('yo phone!')
} else if (device === 'tv') {
  console.log('tv!')
} else {
  console.log('dirtbag')
}

// const xx = blurf === 'ios' ? 'yes' : 'no'


// if (webview) {
//   console.log('jur')
// }

// var shur = {
//   style: {
//     color: device === 'tv' ? 'blue' : 'red'
//   }
// }

// console.log(shur, xx)
