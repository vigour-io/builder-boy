#!/usr/bin/env node
const { dirname, isAbsolute, join } = require('path')
const build = require('../')
const file = process.argv[2]
const dest = process.argv[3]
const watch = ~process.argv.indexOf('-w') || ~process.argv.indexOf('--watch')
const raw = ~process.argv.indexOf('-r') || ~process.argv.indexOf('--raw')
const chalk = require('chalk')
const fs = require('fs')
const cwd = process.cwd()

const write = (dest, code, type) => new Promise((resolve, reject) => {
  if (!isAbsolute(dest)) dest = join(cwd, dest)
  const path = dirname(dest).split('/')
  var dir = ''
  path.forEach(part => {
    if (!fs.existsSync(dir += `/${part}`)) {
      fs.mkdirSync(dir)
    }
  })
  fs.writeFile(dest, code[type], err => {
    if (err) {
      reject(err)
    } else {
      console.log(`👲  wrote ${type} to ${chalk.green(dest)}`)
      resolve()
    }
  })
})

build(file, { raw }, (err, code) => {
  if (err) {
    if (!err.file) {
      console.log(err)
    }
  } else {
    if (dest) {
      Promise.all([
        write(dest, code, 'node'),
        write(dest.replace(/\.js$/, '.browser.js'), code, 'browser'),
        write(dest.replace(/\.js$/, '.browser.inline.js'), code, 'inlineBrowser')
      ]).then(() => {
        if (!watch) {
          process.exit()
        }
      })
    }
  }
})
