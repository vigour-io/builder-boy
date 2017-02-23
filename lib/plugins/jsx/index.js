exports.parse = require('./ast.js')

exports.condition = file => /\.jsx$/i.test(file.key)

exports.compile = (file, result) => result.code.push(file.result.compute())
