const { struct } = require('brisky-struct')
const fs = require('fs')

const cache = {}

exports.build = (file, dest = 'dist/', watch = true, caches = cache) => {
  console.log('go build', file, 'to', dest)
}
