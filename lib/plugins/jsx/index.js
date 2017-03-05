exports.parse = require('./ast.js')

// can make the condition a promise so you can check stuff like can i import this file
exports.condition = file => /\.jsx$/i.test(file.key)

exports.compile = (file, result) => result.code.push(file.result.compute())
