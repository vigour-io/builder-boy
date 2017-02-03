const build = require('../')
const file = process.argv[2]
const dest = process.argv[3]
const chalk = require('chalk')
const fs = require('fs')
build(file, (err, code) => {
  if (err) {
    if (err.file) {
      console.log(`   ${chalk.red(err.message)} in file ${chalk.red(err.file)} `)
    } else {
      console.log(err)
    }
  } else {
    if (dest) {
      fs.writeFile(dest, code, err => {
        if (!err) {
          console.log(`👲  wrote file to ${chalk.green(dest)}`)
        }
      })
    }
  }
})
