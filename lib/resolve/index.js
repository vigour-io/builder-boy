// borrowed completely from defunctzombie/node-browser-resolve
// builtin
var fs = require('fs')
var path = require('path')

// vendor
var resv = require('resolve')

// given a path, create an array of node_module paths for it
// borrowed from substack/resolve
function nodeModulesPaths (start, cb) {
  var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\/+/
  var parts = start.split(splitRe)

  var dirs = []
  for (var i = parts.length - 1; i >= 0; i--) {
    if (parts[i] === 'node_modules') continue
    var dir = path.join.apply(
      path, parts.slice(0, i + 1).concat(['node_modules'])
    )
    if (!parts[0].match(/([A-Za-z]:)/)) {
      dir = '/' + dir
    }
    dirs.push(dir)
  }
  return dirs
}

function find_shims_in_package(pkgJson, cur_path, shims, browser) {
  try {
    var info = JSON.parse(pkgJson)
  } catch (err) {
    err.message = pkgJson + ' : ' + err.message
    throw err
  }

  var replacements = getReplacements(info, browser)

  // no replacements, skip shims
  if (!replacements) {
    return
  }

  // if browser mapping is a string
  // then it just replaces the main entry point
  if (typeof replacements === 'string') {
    var key = path.resolve(cur_path, info.main || 'index.js')
    shims[key] = path.resolve(cur_path, replacements)
    return
  }

  // http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders
  Object.keys(replacements).forEach(function (key) {
    var val
    if (replacements[key] === false) {
      val = __dirname + '/empty.js' // eslint-disable-line
    } else {
      val = replacements[key]
        // if target is a relative path, then resolve
        // otherwise we assume target is a module
      if (val[0] === '.') {
        val = path.resolve(cur_path, val)
      }
    }

    if (key[0] === '/' || key[0] === '.') {
      // if begins with / ../ or ./ then we must resolve to a full path
      key = path.resolve(cur_path, key)
    }
    shims[key] = val
  })

  ;
  ['.js', '.json'].forEach(function(ext) {
    Object.keys(shims).forEach(function(key) {
      if (!shims[key + ext]) {
        shims[key + ext] = shims[key]
      }
    })
  })
}

// paths is mutated
// load shims from first package.json file found
function load_shims(paths, browser, cb) {
  // identify if our file should be replaced per the browser field
  // original filename|id -> replacement
  var shims = Object.create(null)

  ;
  (function next() {
    var cur_path = paths.shift()
    if (!cur_path) {
      return cb(null, shims)
    }

    var pkg_path = path.join(cur_path, 'package.json')

    fs.readFile(pkg_path, 'utf8', function(err, data) {
      if (err) {
        // ignore paths we can't open
        // avoids an exists check
        if (err.code === 'ENOENT') {
          return next()
        }

        return cb(err)
      }
      try {
        find_shims_in_package(data, cur_path, shims, browser)
        return cb(null, shims)
      } catch (err) {
        return cb(err)
      }
    })
  })()
}

function build_resolve_opts(opts, base) {
  var packageFilter = opts.packageFilter
  var browser = normalizeBrowserFieldName(opts.browser)

  opts.basedir = base
  opts.packageFilter = function(info, pkgdir) {
    if (packageFilter) info = packageFilter(info, pkgdir)

    var replacements = getReplacements(info, browser)

    // no browser field, keep info unchanged
    if (!replacements) {
      return info
    }

    info[browser] = replacements

    // replace main
    if (typeof replacements === 'string') {
      info.main = replacements
      return info
    }

    var replace_main = replacements[info.main || './index.js'] ||
      replacements['./' + info.main || './index.js']

    info.main = replace_main || info.main
    return info
  }

  var pathFilter = opts.pathFilter
  opts.pathFilter = function(info, resvPath, relativePath) {
    if (relativePath[0] !== '.') {
      relativePath = './' + relativePath
    }
    var mappedPath
    if (pathFilter) {
      mappedPath = pathFilter.apply(this, arguments)
    }
    if (mappedPath) {
      return mappedPath
    }

    var replacements = info[browser]
    if (!replacements) {
      return
    }

    mappedPath = replacements[relativePath]
    if (!mappedPath && path.extname(relativePath) === '') {
      mappedPath = replacements[relativePath + '.js']
      if (!mappedPath) {
        mappedPath = replacements[relativePath + '.json']
      }
    }

    return mappedPath
  }

  return opts
}

function resolve(id, opts, cb) {

  // opts.filename
  // opts.paths
  // opts.modules
  // opts.packageFilter

  opts = opts || {}
  opts.filename = opts.filename || ''

  var base = path.dirname(opts.filename)

  if (opts.basedir) {
    base = opts.basedir
  }

  var paths = nodeModulesPaths(base)

  if (opts.paths) {
    paths.push.apply(paths, opts.paths)
  }

  paths = paths.map(function(p) {
    return path.dirname(p)
  })

  // we must always load shims because the browser field could shim out a module
  load_shims(paths, opts.browser, function(err, shims) {
    if (err) {
      return cb(err)
    }

    var resid = path.resolve(opts.basedir || path.dirname(opts.filename), id)
    var nodeid = id
    var nodeopts = { basedir: opts.basedir }

    var browserresolve

    if (shims[id] || shims[resid]) {
      var xid = shims[id] ? id : resid
        // if the shim was is an absolute path, it was fully resolved
      if (shims[xid][0] === '/') {
        browserresolve = new Promise((resolve, reject) => {
          resv(shims[xid], build_resolve_opts(opts, base), (err, full, pkg) => {
            if (err) {
                reject(err)
            } else {
                fs.realpath(full, (err, realfile) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(realfile)
                    }
                })
            }
          })
        })
      } else {
        // module -> alt-module shims
        id = shims[xid]
      }
    }

    if (!browserresolve) {
        if (typeof id !== 'string') {
          // browserresolve = { code: id }
          cb(new Error('browser - inline shimmed modules not supported yet'))
        } else {
          var modules = opts.modules || Object.create(null)
          var shim_path = modules[id]
          if (shim_path) {
            browserresolve = shim_path
          } else {
              browserresolve = new Promise((resolve, reject) => {
                resv(id, build_resolve_opts(opts, base), (err, full, pkg) => {
                  if (err) {
                      reject(err)
                  } else {
                      fs.realpath(full, (err, realfile) => {
                          if (err) {
                              reject(err)
                          } else {
                              resolve(realfile)
                          }
                      })
                  }
                })
              })
          }
        }
    }

    // our browser field resolver
    // if browser field is an object tho?
    Promise.all([
        browserresolve,
        new Promise((resolve, reject) => {
            resv(nodeid, nodeopts, function(err, full, pkg) {
                if (err) {
                    reject(err)
                } else {
                    fs.realpath(full, (err, realfile) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(realfile)
                        }
                    })
                }
            })
        })
    ])
    .then(([ browser, node ]) => {
      console.log('  BROWSER:', browser)
      console.log('  NODE:', node)
      cb(null, { browser, node })
    }).catch(err => {
      // throw err
      // err.message // += ' parsing in resolve'
      cb(err)
    })
  })
}

function normalizeBrowserFieldName(browser) {
  return browser || 'browser'
}

function getReplacements(info, browser) {
  browser = normalizeBrowserFieldName(browser)
  var replacements = info[browser] || info.browser

  // support legacy browserify field for easier migration from legacy
  // many packages used this field historically
  if (typeof info.browserify === 'string' && !replacements) {
    replacements = info.browserify
  }

  return replacements
}

module.exports = resolve
