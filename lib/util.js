const isExternal = (file) => {
  return !/^\/\/.+\.js$/.test(file.key) && file.key
}

exports.isExternal = isExternal
