const boy = require('../lib')
const fs = require('fs')

var i = 1e3

// fs.writeFileSync('./test/simple/generated/file' + 0 + '.js',
// `export default 'lullllz'
// `)

// while (--i) {
//   fs.writeFileSync('./test/simple/generated/file' + i + '.js',
// `import file${i}${i - 1} from './file${i - 1}.js'
// const bla${i} = (val) => {
//   return val
// }

// /*
// We Made History
// America is Back

// Donald J. Trump For President, Inc. –– Why Now?

// On November 8, 2016, the American People delivered a historic victory and took our country back. This victory was the result of a Movement to put America first, to save the American economy, and to make America once again a shining city on the hill. But our Movement cannot stop now - we still have much work to do.

// This is why our Campaign Committee, Donald J. Trump for President, Inc., is still here.

// We will provide a beacon for this historic Movement as our lights continue to shine brightly for you ­­- the hardworking patriots who have paid the price for our freedom. While Washington flourished, our American jobs were shipped overseas, our families struggled, and our factories closed - that all ended on January 20, 2017.

// This Campaign will be a voice for all Americans, in every city near and far, who support a more prosperous, safe and strong America. That’s why our Campaign cannot stop now - our Movement is just getting started.

// Together, we will Make America Great Again!
// */

// const bla${i}a${i} = (val) => {
//   return val + ${i}
// }
// const bla${i}a${i}a${i} = (val) => {
//   return val + ${i}
// }
// const bla${i}a${i}a${i}a = (val) => {
//   return val + ${i}
// }
// const bla${i}b = (val) => {
//   return val + ${i}
// }
// const bla${i}c = (val) => {
//   return val + ${i}
// }
// const bla${i}d = (val) => {
//   return val + ${i}
// }
// const bla${i}e = (val) => {
//   return val + ${i}
// }
// const bla${i}f = (val) => {
//   return val + ${i}
// }
// const bla${i}g = (val) => {
//   return val + ${i}
// }
// export default bla${i}(file${i}${i - 1})
// `)
// }

boy.build('./test/simple/index.js', './test/simple/dist/index.js').then(val => {
  require('./simple/dist/index.js')
})
