#!/usr/bin/env node
const { dirname, isAbsolute, join } = require('path')
const build = require('../')
const file = process.argv[2]
const dest = process.argv[3]
const watch = ~process.argv.indexOf('-w') || ~process.argv.indexOf('--watch')
const raw = ~process.argv.indexOf('-r') || ~process.argv.indexOf('--raw')
var env, targets

if (~process.argv.indexOf('-e') || ~process.argv.indexOf('--env')) {
  env = {}
  for (let i = 0, len = process.argv.length; i < len; i++) {
    const arg = process.argv[i]
    if (arg === '-e' || arg === '--env') {
      const envArg = process.argv[i + 1].split('=')
      env[envArg[0]] = envArg[1]
    }
  }
}

if (~process.argv.indexOf('-t') || ~process.argv.indexOf('--target')) {
  targets = []
  for (let i = 0, len = process.argv.length; i < len; i++) {
    const arg = process.argv[i]
    if (arg === '-t' || arg === '--target') {
      targets.push(process.argv[i + 1])
    }
  }
}

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

// add pipe in option vs filepath -- simpler
// for dest use -d flag else just pipe out pipe in out nice!

build(file, { raw, nowatch: !watch, env: env, targets: targets }, (err, code) => {
  if (err) {
    if (!err.file) {
      if (err.message.indexOf('ENOENT') > -1) {
        console.log(`   ${chalk.red('no such file or directory')} "${err.message.split('\'')[1]}"`)
      } else {
        console.log(err)
      }
    }
  } else {
    if (dest) {
      Promise.all([
        (!targets || targets.includes('node')) &&
          write(dest, code, 'node'),
        (!targets || targets.includes('browser')) &&
          write(dest.replace(/\.js$/, '.browser.js'), code, 'browser'),
        (!targets || targets.includes('inlineBrowser')) &&
          write(dest.replace(/\.js$/, '.browser.inline.js'), code, 'inlineBrowser')
      ]).then(() => {
        if (!watch) process.exit()
      })
    }
  }
})
