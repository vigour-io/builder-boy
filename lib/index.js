const { struct } = require('brisky-struct')

const cache = {}

exports.build = (file, dest, watch = true, caches = cache) => {
  console.log('go build', file, 'to', dest)
}
