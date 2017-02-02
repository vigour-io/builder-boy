const { struct } = require('brisky-struct')
const fs = require('fs')

const cache = {}

const fromCache = (file) => {
  //  return object
}

exports.build = (file, dest = 'dist/', watch = true, caches = cache) => {
  // fs
  console.log('go build', file, 'to', dest)
  // fromCache
}
