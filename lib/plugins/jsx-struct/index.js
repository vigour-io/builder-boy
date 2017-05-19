
exports.parse = require('./ast')

// were going to use this for the normal ast transpiler way cleaner
// keep most expresion intact only thing we need to analyze if if something is state -- thats step 1

// can make the condition a promise so you can check stuff like can i import this file
exports.condition = file => /\.jsx$/i.test(file.key)

exports.compile = (file, result) => result.code.push(file.result.compute())
