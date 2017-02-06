#!/usr/bin/env node
const build = require('../')
const file = process.argv[2]
const dest = process.argv[3]
const chalk = require('chalk')
const fs = require('fs')
console.log('file', file)
build(file, (err, code) => {
  if (err) {
    if (!err.file) {
      console.log(err)
    }
  } else {
    if (dest) {
      console.log('dest:', dest)
      fs.writeFile(dest, code.node, err => {
        if (!err) {
          console.log(`👲  wrote file to ${chalk.green(dest)}`)
        }
      })
    }
  }
})
