const parse = require('./parse')
const hash = require('string-hash')
const { showcode } = require('../util')

module.exports = (node) => {
  const raw = parse(node.ua)
  // console.log(final)
  console.log(node.ua.hash)
  showcode(node.ua.hash, false, node.code)

  const left = node.code.slice(0, node.ua.hash.start)
  const right = node.code.slice(node.ua.hash.end)
  const builds = {}

  // make builds
  raw.forEach(val => {
    val.id = hash(JSON.stringify(val.ua))
    builds[val.id] = `${left}\n // UA REPLACED\nvar ${node.ua.hash.val}=${JSON.stringify(val.ua, false, 2)};${right}`
  })

  const pickBuild = `module.exports = function (ua) { console.log(ua) }`

  return {
    raw,
    builds,
    pickBuild
  }
}
