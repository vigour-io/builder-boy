const isExternal = (file) => {
  const split = file.key.split('node_modules/')
  const index = split.length - 1
  if (index) return split[index]
}

exports.isExternal = isExternal
