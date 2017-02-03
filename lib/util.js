const isExternal = (file) => {
  const path = file.key.split('/')
  const modulename = path[path.lastIndexOf('node_modules') + 1]
  return modulename
}

exports.isExternal = isExternal
