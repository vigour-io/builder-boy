const fs = require('fs')
const ua = require('vigour-ua')
const { join } = require('path')

// do something like this in ua
fs.readFile(join(__dirname, '/raw.yaml'), (err, data) => {
  if (err) {
    console.log(err)
  }
  var list = []
  list = data.toString().split('\n\n')
  list.shift()
  const match = val => {
    const m = val.match(/- user_agent_string: '(.*?)'\n/)
    if (m) {
      return m[1]
    }
  }
  const nlist = list.map(match)
  console.log(nlist[nlist.length - 1])

  const obj = {}
  nlist.forEach(val => {
    const r = ua(val)
    // browser: true,
    // version: 0,
    if (r.browser !== true && r.version !== 0 && r.platform !== true) {
      obj[JSON.stringify(r)] = val
    }
  })

  const finallist = Object.keys(obj).map(key => obj[key])

  fs.writeFileSync(join(__dirname, '/list.js'), 'module.exports=' + JSON.stringify(finallist, false, 2))
})
