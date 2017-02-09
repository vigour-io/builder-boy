const boy = require('./struct')
// now have to add external without asts etc
// but not external fields names...

const browserFn = (build, cb) => {
  console.log('ok lets browser the shit out of this boy')
  cb(null, `(function (global) { ${build} })(window)`)
}

module.exports = browserFn
