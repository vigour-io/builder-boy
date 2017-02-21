const fs = require('fs')
const { join } = require('path')

exports.testBuild = (test, results, t) => {
  for (let file in results) {
    t.equal(
      results[file],
      fs.readFileSync(
        join(__dirname, test, '/results/', file + '.js')
      ).toString(),
      `correct ${file} build`
    )
  }
}

exports.generate = (test, results) => {
  var fs = require('fs')
  var dir = join(__dirname, test, '/results/')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  for (let file in results) {
    fs.writeFileSync(
      join(__dirname, test, '/results/', file + '.js'),
      results[file]
    )
  }
}
