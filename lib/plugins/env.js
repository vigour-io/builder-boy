module.exports = (file, result, opts) => {
  if (file.env) {
    let env = {}
    if (opts.env) {
      for (let key in file.env) {
        env[key] = opts.env[key]
      }
    } else {
      for (let key in file.env) {
        env[key] = process.env[key]
      }
    }
    if (!result.env) result.env = {}
    Object.assign(result.env, env)
  }
}
