var $2244796395={"browser":"safari","version":29,"prefix":"moz","platform":"not-android-ios","device":"not-tv-tablet-phone","webview":"any"}
;var $1662971556 = require('brisky-struct')
;var $2376834506 = require('html-element/global-shim')
;var $826337949 = require('stamp')
;var $215521817_exports = {}
var $215521817_$1662971556 = $1662971556
;var $215521817_$834129491 = []

;const $215521817_$61209465_getPath = (t, path) => {
  var i = 0
  const len = path.length
  while (i < len && (t = t[path[i++]]));
  return t
}

const $215521817_$61209465_isWidget = t => t.isWidget !== void 0 ? t.isWidget : t.inherits && $215521817_$61209465_isWidget(t.inherits)

const $215521817_$61209465_cache = t => t._cachedNode !== void 0
  ? t._cachedNode
  : t.inherits && $215521817_$61209465_cache(t.inherits)

const $215521817_$61209465_tag = t => t.tag || t.inherits && $215521817_$61209465_tag(t.inherits)

const $215521817_$61209465_get$ = t => t.$ !== void 0 ? t.$ : t.inherits && $215521817_$61209465_get$(t.inherits)

const $215521817_$61209465_get$any = t => t.$any !== void 0 ? t.$any : t.inherits && $215521817_$61209465_get$any(t.inherits)

const $215521817_$61209465_get$switch = t => t.$switch !== void 0 ? t.$switch : t.inherits && $215521817_$61209465_get$switch(t.inherits)

const $215521817_$61209465_getType = t => t.subscriptionType || t.inherits && $215521817_$61209465_getType(t.inherits)

const $215521817_$61209465_getClass = t => t.class !== void 0 ? t.class : t.inherits && $215521817_$61209465_getClass(t.inherits)




var $215521817_$61209465_$ALL$ = {
  getPath: $215521817_$61209465_getPath,
  isWidget: $215521817_$61209465_isWidget,
  cache: $215521817_$61209465_cache,
  tag: $215521817_$61209465_tag,
  get$: $215521817_$61209465_get$,
  get$any: $215521817_$61209465_get$any,
  get$switch: $215521817_$61209465_get$switch,
  getType: $215521817_$61209465_getType,
  getClass: $215521817_$61209465_getClass
}
; // better to store on the root -- prevent mismatch


const $215521817_$2717887677_parent = (tree, pid) => (tree._ && tree._[pid]) ? tree
  : tree._p && $215521817_$2717887677_parent(tree._p, pid)

var $215521817_$2717887677 = (t, state, type, subs, tree, id, pid, order) => {
  if (t.isObject && (!t.isElement || t.isText)) {
    const p = $215521817_$2717887677_parent(tree, pid)
    tree = p
    state = p.$t
    if (!state) {
      throw new Error('OBJECT SUBS - NO STATE')
    }
  }

  if (type === 'remove') {
    for (let i = $215521817_$834129491.length - 1; i >= 0; i = i - 3) {
      const wtree = $215521817_$834129491[i]
      let ptree = wtree
      while (ptree) {
        if (tree === ptree) {
          $215521817_$2717887677_emitRemove($215521817_$834129491[i - 2], state, wtree, $215521817_$834129491[i - 1])
          $215521817_$834129491.splice(i - 2, 3)
        }
        ptree = ptree._p
      }
    }
    if ($215521817_$2717887677_onRemove(t) && !$215521817_$61209465_isWidget(t)) {
      $215521817_$2717887677_emitRemove(t, state, tree, id)
    }
  } else if (!tree._) {
    tree._ = {}
  }
  return t.render.state(t, state, type, subs, tree, id, pid, order)
}

const $215521817_$2717887677_emitRemove = (t, state, tree, id) => {
  const data = { target: tree._ && tree._[id], state }
  t.emit('remove', data, state.stamp)
}

const $215521817_$2717887677_onRemove = (t, key) => t.emitters && t.emitters.remove ||
  t.inherits && $215521817_$2717887677_onRemove(t.inherits)

;

var $215521817_$3029535488 = (state, type, subs, tree) => {
  const _ = subs._
  if (_) {
    if (type !== 'update') {
      const traveler = _.tList
      if (traveler) {
        for (let i = 0, len = traveler.length; i < len; i += 4) {
          // its all abotu this state here
          // console.log(subs) also wrong tree ofc
          $215521817_$2717887677(traveler[i + 3], state, type, subs, tree, traveler[i], traveler[i + 1], traveler[i + 2])
        }
      }
    } else if (_.sList) {
      const specific = _.sList
      for (let i = 0, len = specific.length; i < len; i += 4) {
        // its all abotu this state here
        $215521817_$2717887677(specific[i + 3], state, type, subs, tree, specific[i], specific[i + 1], specific[i + 2])
      }
    }
  }
}

;var $215521817_$2944552032 = (t, subs, tree, key) => {
  const computed = t.compute()
  if (computed) {
    const store = subs.props[key]
    const path = t.origin().path()
    var eligable, level, length
    for (let field in store) {
      if (field[0] !== '$exec' && field[0] !== 'self') {
        if (!length) { length = path.length }
        const glob = field.split('.')
        const l = glob.length
        if (length >= l) {
          if (!level || l >= level) {
            const delta = length - l
            let score = 0
            for (let i = l - 1, weight = 2; i >= 0; i--) {
              const key = glob[i]
              weight++
              if (key === path[i + delta]) {
                score += weight
              } else if (key === '*') {
                score += 1
              } else {
                score = false
                break
              }
            }
            if (score) {
              if (!eligable) { eligable = [] }
              if (!(l in eligable)) { eligable[l] = [] }
              eligable[l][score] = field
              level = l
            }
          }
        }
      }
    }
    if (eligable) {
      const candidates = eligable[level]
      return candidates[candidates.length - 1]
    }
  }
}

;const $215521817_$2138692569_isNull = t => t.val === null || t.inherits && $215521817_$2138692569_isNull(t.inherits)


var $215521817_$2138692569 = (t, map, prevMap) => {
  var changed
  const keys = t.keys()
  if (keys) {
    let i = keys.length
    while (i--) {
      let p = $215521817_$1662971556.get(t, keys[i])
      if (p && !$215521817_$2138692569_isNull(p) && p.$map) {
        if ($215521817_$2138692569_exec(p, map, prevMap)) { changed = true }
        p._blockContext = null
      }
    }
  }
  return changed
}

function $215521817_$2138692569_exec (p, map, prevMap) {
  const change = p.$map(map, prevMap)

  if (change) {
    return true
  } else {
    // this can be removed the 1 thing
    p.isStatic = true
  }
}

;var $215521817_$1479020246 = (a, b) => {
  if (b.t) {
    if (!a.t) { a.t = {} }
    for (let uid in b.t) {
      a.t[uid] = b.t[uid]
    }
    if (!b.s) {
      a.tList = a.tList ? a.tList.concat(b.tList) : b.tList
    }
  }
  if (b.s) {
    if (!a.s) { a.s = {} }
    for (let uid in b.s) {
      a.s[uid] = b.s[uid]
    }
    a.sList = a.sList ? a.sList.concat(b.sList) : b.sList
    a.tList = a.tList ? a.tList.concat(b.tList) : b.tList
  }
}

;var $215521817_$4042634048 = (target, map, val) => {
  if (val && map.val !== true) {
    if (
      val === true ||
      (val === 1 && !map.val) ||
      (val === 'switch' && map.val !== true && map.val !== 'shallow') ||
      (val === 'shallow' && map.val !== true)
    ) {
      map.val = val
    }
  }
  return map
}

;

var $215521817_$3434732633 = function set (target, val, map, path) {
  const len = path.length - 1
  if (len === 0) {
    map[path[0]] = val
    val._ = { p: map }
    if (val.val) {
      const subsVal = val.val
      delete val.val
      $215521817_$4042634048(target, val, subsVal)
    }
  } else {
    let m = map
    for (let i = 0, key; i < len; i++) {
      key = path[i]
      if (!m[key]) {
        m[key] = { _: { p: m }, $blockRemove: false } // $blockRemove: false - should not be nessecary
      }
      m = m[key]
    }
    m[path[len]] = val
    val._ = { p: m }
    if (val.val) {
      const subsVal = val.val
      delete val.val
      $215521817_$4042634048(target, val, subsVal)
    }
  }
  return val
}

;




var $215521817_$2174896419 = (t, subs, val, map) => {
  const field = $215521817_$61209465_getPath(map, subs)
  if (field) {
    if (subs.length > 1) {
      for (let i = 0, len = subs.length - 1, m = map, key; i < len; i++) {
        key = subs[i]
        m = m[key]
        if (m.$blockRemove) { m.$blockRemove = false }
      }
    }
    $215521817_$2174896419_merge(t, field, val)
    return field
  } else {
    return $215521817_$3434732633(t, val, map, subs)
  }
}

const $215521817_$2174896419_merge = (t, a, b) => {
  if (b && typeof b !== 'object') {
    if (!a.val) { a.val = b }
  } else {
    if (typeof b === 'object') {
      if (!b._) {
        b._ = {}
      }
      b._.p = a._.p
    }
    for (let i in b) {
      if (i !== '$keys') {
        if (i === 'props') {
          if (!a.props) {
            a.props = {}
          }
          for (let j in b.props) {
            a.props[j] = b.props[j]
            for (let n in b.props[j]) {
              if (typeof b.props[j][n] === 'object') {
                b.props[j][n]._.p = a._.p
              }
            }
          }
        } else if (i !== '_') {
          if (typeof a[i] === 'object') {
            $215521817_$2174896419_merge(t, a[i], b[i])
          } else if (!a[i]) {
            if (typeof b[i] === 'object' && b[i]._) {
              b[i]._.p = a
            }
            a[i] = b[i]
          } else if (i === 'val') {
            // alse remove this specific true thing
            if (a.val !== b.val) {
              // pretty wrong since i need the info of the t in the def
              $215521817_$4042634048(t, a, b.val)
            }
          } else {
            let prev = a[i]
            // maybe copy sync?
            a[i] = { _: { p: a } }
            $215521817_$4042634048(t, a[i], prev)
            $215521817_$2174896419_merge(t, a[i], b[i])
          }
        } else {
          $215521817_$1479020246(a._, b._)
        }
      }
    }
  }
}

;



var $215521817_$3687913080 = (t, map, prevMap) => {
  const $ = $215521817_$61209465_get$(t)
  let key = '$switch' + $215521817_$1662971556.puid(t)
  $[$.length - 1] = key
  if ($.length !== 1) {
    let val = {}
    map = $215521817_$2174896419(t, $.slice(0, -1), val, map)
    $215521817_$3687913080_mapSwitch(map, key, t, map, $)
  } else {
    $215521817_$3687913080_mapSwitch(map, key, t, map, $)
  }
  return map
}

const $215521817_$3687913080_helper = (struct, subs, tree, key) => {
  const store = subs.props[key]
  const $exec = store.$exec
  var result = $exec(struct, subs, tree, key)
  if (result === true) {
    result = store.self
  } else {
    const type = typeof result
    if (type === 'number' || type === 'string') {
      result = store[result]
    }
  }
  return result
}

function $215521817_$3687913080_mapSwitch (val, pkey, t, pmap, $) {
  const self = t.$map(void 0, pmap, true)
  const props = $215521817_$1662971556.get(t, 'props')
  const types = $215521817_$1662971556.get(t, 'types')
  var blackList
  if (types.element) {
    blackList = types.element.props
  } else {
    blackList = types.struct.props
  }
  const mappedProps = {}
  if (!val.props) { val.props = {} }
  val.props[pkey] = mappedProps

  var $switch = $215521817_$61209465_get$switch(t)
  if (typeof $switch === 'object') {
    $switch = $215521817_$1662971556.parse($switch)
    mappedProps.$exec = $switch.val
    const n = {}
    for (let key in $switch) {
      n[key] = $switch[key]
    }
    n.val = $215521817_$3687913080_helper
    $switch = n
    n.props = val.props // bit weird...
  } else {
    mappedProps.$exec = $switch
    $switch = $215521817_$3687913080_helper
  }

  var len = $.length
  var select = self
  for (let i = 0; i < len; i++) { select = select[$[i]] }
  select._.p = pmap._.p
  mappedProps.self = select
  if (!select.val) select.val = 1

  for (let key in props) {
    const keyO = key[0]
    if (
      keyO !== '$' && keyO !== '_' &&
      (!blackList[key] || blackList[key] !== props[key])
    ) {
      const prop = props[key]
      const struct = prop.struct
      if (struct && struct.$map) { // is element or is property
        struct.key = key
        struct._c = (!t._c || t._cLevel > 1) ? t._p : t._c
        struct._cLevel = 1
        struct.indexProperty = t
        let map = struct.$map(void 0, pmap)
        mappedProps[key] = map
        map._.p = pmap._.p
        if (!map.val) { map.val = 1 }
        delete struct.indexProperty
      }
    }
  }

  val[pkey] = $switch
  return val
}

;

var $215521817_$3922121264 = (target, obs, type) => {
  const _ = target._
  var store = _[type] || (_[type] = {})
  var pid, id, parent, index

  id = $215521817_$1662971556.puid(obs)
  parent = $215521817_$3922121264_getParent(obs.parent())
  pid = parent && $215521817_$1662971556.puid(parent)

// }
  index = obs.findIndex(parent)
  if (!store[id]) {
    if (target.$blockRemove !== false) {
      target.$blockRemove = true
    }
    store[id] = obs
    if (type === 's') {
      if (!_.sList) _.sList = []
      _.sList.unshift(id, pid, index, obs)
    }
    if (!_.tList) _.tList = []
    _.tList.unshift(id, pid, index, obs)
  }
  return target
}

const $215521817_$3922121264_getParent = parent => {
  while (parent) {
    if (parent.isElement) {
      return parent
    }
    parent = parent.parent()
  }
}

;




// import hash from 'string-hash'


var $215521817_$1460522650 = (t, map) => {
  const props = t.get('props')
  const child = props.default.struct

  const $ = $215521817_$61209465_get$(t)

  child.key = 'default'
  if (t._c || t !== child._p) {
    child._c = t
    child._cLevel = 1
  }

  var key = '$any'
  var $any = $215521817_$61209465_get$any(t)
  var extra

  if (typeof $any === 'function') {
    key = '$any' + $215521817_$1662971556.puid(t)
  } else if (typeof $any === 'object') {
    extra = $215521817_$1662971556.parse($any)
    $any = $any.val
    key = '$any' + $215521817_$1662971556.puid(t)
  } else {
    $any = false
  }

  if ($.length !== 1) {
    const path = $.slice(0, -1)
    const val = { val: 1 } // wrong for switch .. what to do
    let walk = map
    let exists
    val[key] = child.$map(void 0, exists ? walk : val)

    if ($any) {
      val[key].$keys = $any
    }

    if (!val[key].val) {
      if (!$215521817_$61209465_get$switch(child)) {
        $215521817_$4042634048(child, val[key], 1)
      }
    }
    // if (!child.$test && child.sync !== false && val.$any._.sync === true) {
    //   val.$any._.sync = 1
    // }
    map = $215521817_$2174896419(t, path, val, map)
  } else {
    if (map[key]) {
      $215521817_$2174896419(t, [ key ], child.$map(void 0, map), map)
    } else {
      map[key] = child.$map(void 0, map)
    }

    if (!map[key].val) {
      if (!$215521817_$61209465_get$switch(child)) {
        $215521817_$4042634048(child, map[key], 1)
      }
    }

    if ($any) {
      map[key].$keys = $any
    }
    // if (!child.$test && child.sync !== false && map.$any._.sync === true) {
    //   map.$any._.sync = 1
    // }
  }

  $215521817_$2138692569(t, map)
  $215521817_$3922121264(map, t, 't')

  if (extra) {
    $215521817_$1460522650_mergeExtra(extra, map[key])
  }

  return map
}

const $215521817_$1460522650_$keys = (map, i, t) => {
  if (typeof map.$keys !== 'object') {
    map.$keys = { val: map.$keys }
  }
  if (i === 'parent') {
    for (let j in t) {
      map.$keys[j] = t[j]
    }
  } else if (i === 'root') {
    map.$keys.root = {}
    for (let j in t) {
      map.$keys.root[j] = t[j]
    }
  } else {
    map.$keys[i] = t
  }
}

const $215521817_$1460522650_mergeExtra = (target, map, deep) => {
  for (let i in target) {
    let t = target[i]
    if (!deep && (i === 'root' || i === 'parent')) {
      $215521817_$1460522650_$keys(map, i, t)
    } else {
      let type = typeof t
      if (type !== 'object' && type !== 'function') {
        t = target[i] = { val: t }
      }
      if (i === 'val') {
        if (!deep) {
          if (!map.val) {
            map.val = t
          } else if (t === true && map.val === 1) {
            map.val = t
          }
        }
      } else {
        if (!(i in map)) {
          map[i] = t
        } else {
          $215521817_$1460522650_mergeExtra(t, map[i], true)
        }
      }
    }
  }
}

;





var $215521817_$4025610930 = (t, map) => {
  const def = $215521817_$61209465_getType(t)
  const path = $215521817_$61209465_get$(t)
  const type = def === 1 ? 't' : 's'
  if (path !== true) {
    map = $215521817_$2174896419(t, path, { val: def }, map)
  } else {
    $215521817_$4042634048(t, map, def)
  }
  $215521817_$2138692569(t, map)
  $215521817_$3922121264(map, t, type)
  return map
}

;





const $215521817_$4276047929_parse = (subs, arr, x) => {
  for (let field in subs) {
    let path = x.concat()
    if (field === 'val') {
      path.push(subs[field])
      arr.push(path)
    } else if (typeof subs[field] !== 'object') {
      path.push(field)
      path.push(subs[field])
      arr.push(path)
    } else {
      path.push(field)
      $215521817_$4276047929_parse(subs[field], arr, path)
    }
  }
  return arr
}

var $215521817_$4276047929 = (t, map) => {
  const subs = $215521817_$61209465_get$(t)
  const arr = $215521817_$4276047929_parse(subs, [], [])
  let cnt = false
  t.isObject = true
  const def = $215521817_$61209465_getType(t)
  for (let i = 0, len = arr.length; i < len; i++) {
    let path = arr[i]
    let type = path.pop()
    let prevmap = path.length === 0
      ? $215521817_$4042634048(t, map, type)
      : $215521817_$2174896419(t, path, { val: type }, map)
    if (!cnt) {
      $215521817_$2138692569(t, prevmap || map)
    }
    if (def !== 1 || !cnt) {
      $215521817_$3922121264(prevmap || map, t, type === true ? 's' : 't')
    }
    if (!cnt) cnt = true
  }
  if (!cnt) {
    $215521817_$2138692569(t, map)
    $215521817_$3922121264(map, t, def)
    $215521817_$4042634048(t, map, def)
  }
  return map
}


;







// dont define just require
var $215521817_$3846085509 = {
  define: {
    $map (map, prev, ignoreSwitch) {
      var returnValue
      const $ = $215521817_$61209465_get$(this)
      if (!map) {
        returnValue = map = this._$map = { _: { p: prev || false } }
      }
      this.isStatic = null
      if ($) {
        if (typeof $ === 'object' && !($ instanceof Array)) {
          if (!returnValue) { returnValue = true }
          map = $215521817_$4276047929(this, map)
        } else {
          if ($[0] === 'root' && (!map || !map._ || !map._.p)) $.shift()
          if (!returnValue) returnValue = true
          if ($215521817_$61209465_get$switch(this) && !ignoreSwitch) {
            map = $215521817_$3687913080(this, map)
          } else if ($215521817_$61209465_get$any(this)) {
            map = $215521817_$1460522650(this, map)
          } else {
            map = $215521817_$4025610930(this, map)
          }
        }
      } else if ($215521817_$2138692569(this, map) || returnValue) {
        $215521817_$3922121264(map, this, 't')
        if (!returnValue) { returnValue = true }
      }

      return returnValue
    }
  }
}

;


const $215521817_$4133454486_injectable = {}

var $215521817_$4133454486 = $215521817_$4133454486_injectable

$215521817_$4133454486_injectable.props = {
  $ (t, val) {
    if (typeof val === 'number' && !isNaN(val)) {
      val = [ val + '' ]
    } else if (typeof val === 'string') {
      val = val.split('.')
    }
    if (Array.isArray(val)) {
      let length = val.length
      const last = val[length - 1]
      if (last === '$any') {
        if (!t.$any) {
          t.$any = true
        }
        length--
      } else if ($215521817_$61209465_get$any(t)) {
        t.$any = null
      } else if (last === '$switch') {
        if (!$215521817_$61209465_get$switch(t)) { t.$switch = $215521817_$2944552032 }
      } else if ($215521817_$61209465_get$switch(t)) {
        t.$switch = null
      }
      t._$length = length
    } else {
      t._$length = null
    }
    t.$ = val
    return true
  },
  isStatic: true,
  $switch: true,
  $any: true,
  subscriptionType: true,
  render (t, val) {
    t.set({
      define: {
        render: val
      }
    })
  }
}


$215521817_$4133454486_injectable.subscriptionType = 1
$215521817_$4133454486_injectable.inject = $215521817_$3846085509

/*
more merge tests
*/

;


const $215521817_$2365388884_injectable = {}

var $215521817_$2365388884 = $215521817_$2365388884_injectable

$215521817_$2365388884_injectable.define = {
  findIndex (parent) {
    if (parent) {
      if (this.indexProperty) {
        return this.indexProperty.findIndex(parent)
      } else {
        if (!$215521817_$61209465_get$any(parent)) {
          const key = $215521817_$1662971556.get(this, 'key')
          if (key !== void 0 && key !== null) {
            const keys = parent.keys()
            if (keys) {
              const len = keys.length
              if (len > 1) {
                for (let i = 0; i < len; i++) {
                  if (keys[i] === key) {
                    if ($215521817_$61209465_tag(parent) === 'fragment') {
                      const fraction = ((i + 1) / (len + 1)).toFixed((len + '').length)
                      return (parent.findIndex(parent.parent()) || 1) + fraction
                    } else {
                      return i + 1
                    }
                  }
                }
              }
            }
          }
        }
        if ($215521817_$61209465_tag(parent) === 'fragment') return parent.findIndex(parent.parent())
      }
    }
  }
}

;var $215521817_$2376834506 = $2376834506
;const $215521817_$1039077650_isStatic = t => t.isStatic !== void 0
  ? t.isStatic
  : t.inherits && $215521817_$1039077650_isStatic(t.inherits)

const $215521817_$1039077650_staticProps = t => t.staticProps ||
  (t.staticProps = t.filter(t => !t.isElement && $215521817_$1039077650_isStatic(t)))

const $215521817_$1039077650_staticElements = t => t.staticElements ||
  (t.staticElements = t.filter(t => t.isElement && $215521817_$1039077650_isStatic(t)))

const $215521817_$1039077650_property = (t, div, param) => {
  const props = $215521817_$1039077650_staticProps(t)
  for (let i = 0, len = props.length; i < len; i++) {
    props[i].render.static(props[i], div, param)
  }
  return props
}

const $215521817_$1039077650_element = (t, div) => {
  const elements = $215521817_$1039077650_staticElements(t)
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].render.static(elements[i], div)
  }
  return elements
}



var $215521817_$1039077650_$ALL$ = {
  isStatic: $215521817_$1039077650_isStatic,
  staticProps: $215521817_$1039077650_staticProps,
  staticElements: $215521817_$1039077650_staticElements,
  property: $215521817_$1039077650_property,
  element: $215521817_$1039077650_element
}
;

var $215521817_$2107281421 = (target, pnode, id, tree) => {
  const arr = [ pnode ]
  $215521817_$1039077650_element(target, arr)
  tree._[id] = arr
  return arr
}

;





const $215521817_$2156255699_injectable = {}

var $215521817_$2156255699 = $215521817_$2156255699_injectable

$215521817_$2156255699_injectable.state = (t, type, subs, tree, id, pnode, state) => {
  const nodeType = $215521817_$61209465_tag(t)
  if (nodeType === 'fragment') {
    return $215521817_$2107281421(t, pnode, id, tree)
  } else {
    const node = document.createElement(nodeType)
    if (!t._noResolve_) {
      node.setAttribute('id', (id * 33 ^ $215521817_$1662971556.puid(state)) >>> 0)
    }
    $215521817_$1039077650_property(t, node)
    $215521817_$1039077650_element(t, node)
    tree._[id] = node
    return node
  }
}

$215521817_$2156255699_injectable.static = t => {
  const nodeType = $215521817_$61209465_tag(t)
  const node = document.createElement(nodeType)
  $215521817_$1039077650_property(t, node)
  $215521817_$1039077650_element(t, node)
  return node
}

;const $215521817_$1908772127_parent = (tree, pid) => tree._ && tree._[pid] ||
  tree._p && $215521817_$1908772127_parent(tree._p, pid)

var $215521817_$1908772127 = $215521817_$1908772127_parent

;const $215521817_$2307634410_findParent = node => {
  while ($215521817_$2307634410_isFragment(node)) {
    node = node[0]
  }
  return node
}

const $215521817_$2307634410_isFragment = node => node instanceof Array



var $215521817_$2307634410_$ALL$ = {
  findParent: $215521817_$2307634410_findParent,
  isFragment: $215521817_$2307634410_isFragment
}
;

const $215521817_$2716462886_injectable = {}

var $215521817_$2716462886 = $215521817_$2716462886_injectable

$215521817_$2716462886_injectable.static = (t, pnode, domNode) => {
  if ($215521817_$2307634410_isFragment(pnode)) {
    pnode.push(domNode)
    pnode = $215521817_$2307634410_findParent(pnode)
  }
  const index = t.findIndex(t.parent())
  if (index !== void 0) {
    pnode._last = index
    domNode._order = index
  }
  pnode.appendChild(domNode)
}

$215521817_$2716462886_injectable.state = (t, pnode, node, subs, tree, uid, order) => {
  var fragment
  if ($215521817_$2307634410_isFragment(pnode)) {
    fragment = pnode
    pnode = $215521817_$2307634410_findParent(pnode)
  }
  if (order !== void 0) {
    const next = $215521817_$2716462886_findNode(order, pnode)
    node._order = order
    // console.log(next, order)
    if (next) {
      if (fragment) { fragment.push(node) }
      pnode.insertBefore(node, next)
    } else {
      pnode._last = order
      if (fragment) { fragment.push(node) }
      pnode.appendChild(node)
    }
  } else {
    if (fragment) { fragment.push(node) }
    pnode.appendChild(node)
  }
}

function $215521817_$2716462886_findNode (order, pnode) {
  const last = pnode._last
  if (order < last) {
    const c = pnode.childNodes
    let i = c.length
    while (i--) {
      if (c[i] && c[i]._order > order && (!c[i - 1] || c[i - 1]._order <= order)) {
        return c[i]
      }
    }
  }
}

;





const $215521817_$3891062678_renderStatic = $215521817_$2156255699.static
const $215521817_$3891062678_renderState = $215521817_$2156255699.state
const $215521817_$3891062678_appendStatic = $215521817_$2716462886.static
const $215521817_$3891062678_appendState = $215521817_$2716462886.state
const $215521817_$3891062678_injectable = {}

var $215521817_$3891062678 = $215521817_$3891062678_injectable

$215521817_$3891062678_injectable.static = (t, pnode) => {
  const node = $215521817_$3891062678_renderStatic(t, pnode)
  // dont append if you allrdy have a pnode
  if (!node.parentNode) {
    $215521817_$3891062678_appendStatic(t, pnode, node)
  }
  if (t.hasEvents) { node._ = t }
  return node
}

$215521817_$3891062678_injectable.state = (t, state, type, subs, tree, id, pid, order) => {
  const pnode = $215521817_$1908772127(tree, pid)
  const node = $215521817_$3891062678_renderState(t, type, subs, tree, id, pnode, state)
  if (pnode) { // remove this
    if ($215521817_$61209465_tag(t) !== 'fragment' && !node.parentNode) {
      $215521817_$3891062678_appendState(t, pnode, node, subs, tree, id, order)
    } else if ($215521817_$2307634410_isFragment(pnode)) {
      pnode.push(node)
    }
  }
  return node
}

;




const $215521817_$148791133_createStatic = $215521817_$3891062678.static
const $215521817_$148791133_createState = $215521817_$3891062678.state

// check for null as well -- move this to get
const $215521817_$148791133_getRemove = t => t.remove || t.inherits && $215521817_$148791133_getRemove(t.inherits)

const $215521817_$148791133_hasRemove = t => t.emitters && $215521817_$148791133_getRemove(t.emitters) ||
  t.inherits && $215521817_$148791133_hasRemove(t.inherits)

const $215521817_$148791133_removeFragmentChild = (node, pnode) => {
  for (let i = 1, len = node.length; i < len; i++) {
    if ($215521817_$2307634410_isFragment(node[i])) {
      $215521817_$148791133_removeFragmentChild(node[i], pnode)
    } else {
      pnode.removeChild(node[i])
    }
  }
}

const $215521817_$148791133_injectable = {}

var $215521817_$148791133 = $215521817_$148791133_injectable

$215521817_$148791133_injectable.props = {
  staticIndex: true,
  _cachedNode: true
}

$215521817_$148791133_injectable.render = {
  static: $215521817_$148791133_createStatic,
  state (t, s, type, subs, tree, id, pid, order) {
    var node = tree._ && tree._[id]
    var pnode
    if (type === 'remove') {
      if (node) {
        pnode = $215521817_$1908772127(tree, pid)
        if (pnode) {
          if ($215521817_$61209465_tag(t) === 'fragment') {
            if ($215521817_$2307634410_isFragment(pnode)) {
              pnode = $215521817_$2307634410_findParent(pnode)
            }
            $215521817_$148791133_removeFragmentChild(node, pnode)
          } else if (!$215521817_$148791133_hasRemove(t)) {
            if ($215521817_$2307634410_isFragment(pnode)) {
              // add tests for this
              for (let i = 0, len = pnode.length; i < len; i++) {
                if (pnode[i] === node) {
                  pnode.splice(i, 1)
                  break
                }
              }
              pnode = pnode[0]
            }
            if ($215521817_$2307634410_isFragment(pnode)) {
              pnode = $215521817_$2307634410_findParent(pnode)
            }
            pnode.removeChild(node)
          }
        }
        delete tree._[id]
      }
    } else if (!node) {
      node = $215521817_$148791133_createState(t, s, type, subs, tree, id, pid, order)
    }
    return node
  }
}

;


const $215521817_$4188164346_appendStatic = $215521817_$2716462886.static
const $215521817_$4188164346_appendState = $215521817_$2716462886.state
const $215521817_$4188164346_injectable = {}

var $215521817_$4188164346 = $215521817_$4188164346_injectable

// little bit harder with overtake since you need to check if there is a text value
// if resolve true

$215521817_$4188164346_injectable.types = {
  text: {
    define: { isText: true },
    subscriptionType: 'shallow',
    render: {
      static (t, pnode) {
        $215521817_$4188164346_appendStatic(t, pnode, document.createTextNode(t.compute()))
      },
      state  (t, s, type, subs, tree, id, pid, order) {
        const val = t.compute(s, s)
        var node = tree._[id]
        var pnode
        if (!node) {
          if (typeof val !== 'object' && val !== void 0) {
            pnode = $215521817_$1908772127(tree, pid)
            if (t.resolve) {
              let i = pnode.childNodes.length
              while (i--) {
                if (pnode.childNodes[i].nodeType === 3) {
                  node = tree._[id] = pnode.childNodes[i]
                  if (node.nodeValue !== val) {
                    node.nodeValue = val
                  }
                  break
                }
              }
            }
            if (!node) {
              node = tree._[id] = document.createTextNode(val)
              $215521817_$4188164346_appendState(t, pnode, node, subs, tree, id, order)
            }
          }
        } else {
          // remove is overhead here (extra compute)
          if (type && type === 'remove' || typeof val === 'object' || val === void 0) {
            pnode = $215521817_$1908772127(tree, pid) || node.parentNode
            if (pnode) { pnode.removeChild(node) }
          } else {
            if (val && typeof val !== 'object' || val === 0) {
              node.nodeValue = val
            }
          }
        }
      }
    }
  }
}

$215521817_$4188164346_injectable.props = { text: { type: 'text' } }

;

const $215521817_$390291418_injectable = {}

var $215521817_$390291418 = $215521817_$390291418_injectable

$215521817_$390291418_injectable.types = {
  html: {
    type: 'property',
    render: {
      static (t, node) {
        const val = t.compute()
        node.innerHTML = val === void 0 ? '' : val
      },
      state  (t, s, type, subs, tree, id, pid) {
        const node = $215521817_$1908772127(tree, pid)
        if (type === 'remove') {
          if (node) {
            const nodes = node.childNodes
            let i = nodes.length
            while (i--) {
              node.removeChild(nodes[i])
            }
          }
        } else {
          const val = t.compute(s, s)
          if (val === void 0 || typeof val === 'object') {
            const nodes = node.childNodes
            let i = nodes.length
            while (i--) {
              node.removeChild(nodes[i])
            }
          } else {
            node.innerHTML = val
          }
        }
      }
    }
  }
}

$215521817_$390291418_injectable.props = {
  html: { type: 'html' }
}

;var $215521817_$826337949 = $826337949
;




const $215521817_$2824643288_injectable = {}

// use * to import
var $215521817_$2824643288 = $215521817_$2824643288_injectable

$215521817_$2824643288_injectable.types = {
  group: {
    type: 'property',
    subscriptionType: 1,
    define: {
      render: {
        static (t, pnode) {
          const store = {}
          const parsed = '_' + t.key + 'StaticParsed'
          if (pnode) {
            $215521817_$1039077650_property(t, pnode, store)
            pnode[parsed] = true
          }
          t.groupRender.static(t, pnode, store)
        },
        state (t, s, type, subs, tree, id, pid, order, store) {
          let storeId = pid + t.key
          if (!store) { store = tree._[storeId] || (tree._[storeId] = {}) }
          const pnode = $215521817_$1908772127(tree, pid)
          if (pnode) {
            const parsed = '_' + t.key + 'StaticParsed'
            if (!pnode[parsed]) {
              $215521817_$1039077650_property(t, pnode, store)
              pnode[parsed] = true
            }
            if (!store.inProgress) {
              store.inProgress = true
              $215521817_$826337949.on(() => {
                delete store.inProgress
                t.groupRender.state(t, s, type, subs, tree, id, pid, store)
              })
            }
          }
        }
      }
    },
    props: {
      render (t, val) {
        t.set({ define: { groupRender: val } })
      },
      default: {
        define: {
          getStore (tree, id) {
            const $ = $215521817_$61209465_get$(this)
            if ($) {
              let length = $.length
              // why any lets make a test for this!
              if (this.$any) {
                length--
              }
              while (length) {
                length--
                tree = tree._p
              }
            }
            const _ = tree._ || (tree._ = {})
            const store = _[id] || (_[id] = {})
            return store
          }
        },
        render: {
          static (t, node, store) {
            store[t.key] = t.compute()
          },
          state (t, s, type, subs, tree, id, pid, order) {
            const p = t._p
            const key = p.key
            const store = t.getStore(tree, pid + key)
            if (!s || s.val === null || type === 'remove') {
              if (t.key in store) {
                delete store[t.key]
              }
            } else {
              store[t.key] = t.compute(s, s)
            }
            p.render.state(p, s, type, subs, tree, id, pid, order, store)
          }
        }
      }
    }
  }
}

;


const $215521817_$2300670804_injectable = {}

var $215521817_$2300670804 = $215521817_$2300670804_injectable

if (typeof window === 'undefined') {
  Object.defineProperty(global.Element.prototype, 'value', {
    configurable: true,
    get () { return this.getAttribute('value') },
    set (val) { this.setAttribute('value', val) }
  })
}

$215521817_$2300670804_injectable.props = {
  attr: {
    type: 'property',
    render: {
      static: $215521817_$1039077650_property,
      state (t, state, type, subs, tree, id, pid) {
        const pnode = $215521817_$1908772127(tree, pid)
        if (pnode && !pnode._propsStaticParsed) {
          $215521817_$1039077650_property(t, pnode)
          pnode._propsStaticParsed = true
        }
      }
    },
    props: {
      type: null, // default to wrong one --- it defaults to element....
      default: {
        props: { name: true },
        render: {
          static (t, pnode) {
            const val = t.compute()
            if (val === t || val === void 0) {
              pnode.removeAttribute(t.name || t.key)
            } else {
              pnode.setAttribute(t.name || t.key, val)
            }
          },
          state (t, state, type, subs, tree, id, pid) {
            const pnode = $215521817_$1908772127(tree, pid)
            const key = t.name || t.key
            if (type === 'remove') {
              if (pnode) {
                pnode.removeAttribute(key)
              }
            } else {
              let val = t.compute(state, state)
              const type = typeof val
              if (type === 'boolean') { val = val + '' }
              if ((type === 'object' && val.inherits) || val === void 0) {
                if (pnode.getAttribute(key)) {
                  pnode.removeAttribute(key) // missing
                }
              } else {
                if (pnode.getAttribute(key) != val) { // eslint-disable-line
                  pnode.setAttribute(key, val)
                }
              }
            }
          }
        }
      },
      value: {
        render: {
          static (t, pnode) {
            const val = t.compute() // missing
            pnode.value = val // missing (needs a way on server this does not work)
          },
          state (t, state, type, subs, tree, id, pid) {
            const pnode = $215521817_$1908772127(tree, pid)
            if (type === 'remove') {
              if (pnode) { pnode.value = '' } // missing
            } else {
              const val = t.compute(state, state)
              if (val != pnode.value) { // eslint-disable-line
                pnode.value = val === t ? '' : val
              }
            }
          }
        }
      }
    }
  }
}

;



const $215521817_$2079359529_injectable = {}

var $215521817_$2079359529 = $215521817_$2079359529_injectable

$215521817_$2079359529_injectable.props = {
  class: {
    type: 'group',
    storeContextKey: true,
    subscriptionType: 'shallow',
    render: {
      static (t, node, store) {
        var val = t.compute()
        if (typeof val === 'object') val = ''
        if ($215521817_$1662971556.getKeys(t)) val = $215521817_$2079359529_parseStore(val, store)
        $215521817_$2079359529_setClassName(val, node)
      },
      state (t, s, type, subs, tree, id, pid, store) {
        const node = $215521817_$1908772127(tree, pid)
        if (node) {
          let val = s && $215521817_$61209465_get$(t) ? t.compute(s, s) : t.compute()
          if (typeof val === 'object') val = ''
          if ($215521817_$1662971556.getKeys(t)) val = $215521817_$2079359529_parseStore(val, store)
          $215521817_$2079359529_setClassName(val, node)
        }
      }
    }
  }
}

const $215521817_$2079359529_parseStore = (val, store) => {
  for (let key in store) {
    let fieldval = store[key]
    if (fieldval !== false) {
      if (val) {
        val += ' ' + fieldval
      } else {
        val = fieldval
      }
    }
  }
  return val
}

const $215521817_$2079359529_setClassName = (val, node) => {
  const tron = node.getAttribute('data-style')
  if (val) {
    if (tron) val = val + tron
    node.className = val
  } else if ('className' in node) {
    if (tron) {
      node.className = tron
    } else {
      node.removeAttribute('class')
    }
  }
}

;var $215521817_$3514902010 = node => {
  if (node && node.tagName && node.tagName.toLowerCase() === 'html') { // tmp fix for node.js
    let head
    const children = node.childNodes
    for (let i = 0, len = children.length; i < len; i++) {
      if (children[i].tagName && children[i].tagName.toLowerCase() === 'head') {
        head = children[i]
        break
      }
    }
    if (!head) {
      head = document.createElement('head')
      node.appendChild(head)
    }
    return head
  }
  return node
}

;

var $215521817_$2447655140 = class StyleSheet {
  constructor (t) {
    this.map = {}
    this.mediaMap = { count: 0 }
    this.parsed = false
    this.elem = t
    t.stylesheet = this
  }
  parse () {
    const mediaMap = this.mediaMap
    var media = ''
    var str = ''
    for (const i in this.map) {
      str += ` .${this.map[i]} {${i};}`
    }
    for (const key in mediaMap) {
      if (key !== 'count') {
        const mmap = mediaMap[key]
        media += ` ${key} {`
        for (const style in mmap) {
          if (style !== 'count' && style !== 'id') {
            if (style === 'state') {
              for (const id in mmap.state) {
                media += ` .${id} {${mmap.state[id]};}`
              }
            } else {
              media += ` .${mmap[style]} {${style};}`
            }
          }
        }
        media += ' }'
      }
    }
    if (media) str += ' ' + media
    return str + ' '
  }
  exec (node, resolve) {
    if (!this.parsed) {
      const style = document.createElement('style')
      style.setAttribute('data-style', true)
      style.innerHTML = this.parse()
      $215521817_$3514902010(node).appendChild(style)
      this.parsed = style
      return style
    }
  }
  update () {
    if (this.parsed) {
      this.parsed.innerHTML = this.parse()
    }
  }
}

;var $215521817_$2244796395 = $2244796395
;// src: http://shouldiprefix.com


const $215521817_$2360589662_prefix = {}

if ($215521817_$2244796395.prefix === 'moz') {
  $215521817_$2360589662_prefix.appearance = 'MozAppearance'
} else if (
  $215521817_$2244796395.prefix === 'webkit' ||
  $215521817_$2244796395.browser === 'ie' ||
  $215521817_$2244796395.browser === 'edge'
) {
  $215521817_$2360589662_prefix.appearance = 'WebkitAppearance'
}

if ($215521817_$2244796395.browser === 'chrome' || $215521817_$2244796395.browser === 'safari') {
  $215521817_$2360589662_prefix.filter = 'WebkitFilter'
}

if ($215521817_$2244796395.platform === 'ios' || $215521817_$2244796395.browser === 'safari') {
  $215521817_$2360589662_prefix.flex = 'WebkitFlex'
} else if ($215521817_$2244796395.browser === 'ie') {
  $215521817_$2360589662_prefix.flex = 'msFlex'
  if ($215521817_$2244796395.version === 10) {
    $215521817_$2360589662_prefix.order = 'msFlexOrder'
  }
}

if (
  ($215521817_$2244796395.browser === 'chrome' && $215521817_$2244796395.version < 36) ||
  ($215521817_$2244796395.browser === 'safari' && $215521817_$2244796395.version > 5.1) ||
  ($215521817_$2244796395.platform === 'ios' && $215521817_$2244796395.version < 9.2) ||
  ($215521817_$2244796395.platform === 'android' && $215521817_$2244796395.version <= 4.5)// 4.4.4
) {
  console.log('wuuut')
  $215521817_$2360589662_prefix.transformOrigin = 'WebkitTransformOrigin'
  $215521817_$2360589662_prefix.transform = 'WebkitTransform'
}

var $215521817_$2360589662 = $215521817_$2360589662_prefix

;// src: http://shouldiprefix.com
// import ua from 'vigour-ua/navigator'


const $215521817_$3236326699_prefix = {}

// if (ua.browser === 'safari' || ua.platform === 'ios') {
//   prefix.display = val => val === 'flex' ? '-webkit-flex' : val
// }

if ($215521817_$2360589662.transform === 'webkitTransform') {
  $215521817_$3236326699_prefix.transition = val => val.replace(/\btransform\b/, 'webkit-transform')
}

var $215521817_$3236326699 = $215521817_$3236326699_prefix

;







var $215521817_$1567623425_inProgress

const $215521817_$1567623425_globalSheet = {
  map: {},
  count: 0
}

const $215521817_$1567623425_isNotEmpty = store => {
  for (let i in store) return true
}

const $215521817_$1567623425_toDash = key => key.replace(/([A-Z])([a-z]|$)/g, '-$1$2').toLowerCase()

const $215521817_$1567623425_uid = num => {
  const div = num / 26 | 0
  var str = String.fromCharCode(97 + num % 26)
  if (div) {
    if (div / 26 | 0) {
      str = str + $215521817_$1567623425_uid(div)
    } else {
      str = str + String.fromCharCode(97 + div % 26)
    }
  }
  return str
}

const $215521817_$1567623425_setStyle = (t, store, elem, pid) => {
  var className = ''
  const style = elem.stylesheet || new $215521817_$2447655140(elem, $215521817_$1567623425_globalSheet)
  const map = style.map
  const mediaMap = style.mediaMap
  var mc = 0
  // console.log('DOOO', store)
  for (let key in store) {
    if (key.indexOf('@media') === 0) {
      if (!mediaMap[key]) mediaMap[key] = { id: ++mediaMap.count, count: 0, state: {} }
      const mmap = mediaMap[key]
      const parsed = store[key]
      for (let style in parsed) {
        const value = parsed[style]
        if (typeof value === 'object' && 'inherits' in value) {
          const id = $215521817_$1567623425_uid(++mc) + ((pid * 33 ^ $215521817_$1662971556.puid(value)) >>> 0)
          mmap.state[id] = $215521817_$1567623425_toDash(style) + ':' + t.get([key, style]).compute(value, value)
          className += ` ${id}`
        } else {
          const s = $215521817_$1567623425_toDash(style) + ':' + value
          if (!mmap[s]) mmap[s] = $215521817_$1567623425_uid(mmap.count++) + mmap.id
          className += ` ${mmap[s]}`
        }
        // this also has to be resolved of course....
      }
    } else {
      if (store[key] === '0px') store[key] = 0
      let s = $215521817_$1567623425_toDash(key) + ':' + store[key]
      if (!map[s]) {
        let id
        id = $215521817_$1567623425_uid($215521817_$1567623425_globalSheet.count++)
        if (!$215521817_$1567623425_globalSheet.map[s]) $215521817_$1567623425_globalSheet.map[s] = id
        const rule = $215521817_$1567623425_globalSheet.map[s]
        map[s] = rule
      }
      className += ' ' + map[s]
    }
  }
  if (style.parsed) {
    style.update()
  } else if (!$215521817_$1567623425_inProgress) {
    style.exec(elem.node)
  }
  return className
}

const $215521817_$1567623425_setClass = (node, newStyle, style) => {
  if (style) {
    if (newStyle !== style) {
      node.className = node.className.replace(style, newStyle)
    }
  } else {
    node.className = (node.className || '') + newStyle
  }
  node.setAttribute('data-style', newStyle)
}

const $215521817_$1567623425_sheet = {
  type: 'group',
  render: {
    state (t, s, type, subs, tree, id, pid, store) {
      const node = $215521817_$1908772127(tree, pid)
      if (node) t.groupRender.static(t, node, store, pid)
    },
    static (t, node, store, pid) { // state gets passed by render.state
      const elem = $215521817_$1567623425_inProgress || t.root()
      if (!$215521817_$61209465_getClass(t._p._p)) {
        if ($215521817_$1567623425_isNotEmpty(store)) {
          node.className = $215521817_$1567623425_setStyle(t, store, elem, pid)
        }
      } else {
        const style = node.getAttribute('data-style')
        if ($215521817_$1567623425_isNotEmpty(store)) {
          const newStyle = t._cachedNode = $215521817_$1567623425_setStyle(t, store, elem, pid)
          if (newStyle) {
            $215521817_$1567623425_setClass(node, newStyle, style)
            return
          }
        }
        if (style) node.removeAttribute('data-style')
      }
    }
  },
  props: {
    default: {
      render: {
        static (t, node, store) {
          const val = t.compute()
          const key = t.key
          if (val === void 0) {
            $215521817_$1039077650_property(t, node, store[key] = {})
          } else {
            store[key] = $215521817_$3236326699[key] ? $215521817_$3236326699[key](val) : val
          }
        },
        state (t, s, type, subs, tree, id, pid, order) {
          const p = t._p
          const store = t.getStore(tree, pid + p.key)
          if (!s || s.val === null || type === 'remove') {
            if (t.key in store) {
              delete store[t.key]
            }
          } else {
            const val = t.compute(s, s)
            if (val !== void 0 && typeof val !== 'object') {
              store[t.key] = val
              p.render.state(p, s, type, subs, tree, id, pid, order, store)
            } else {
              $215521817_$1039077650_property(t, false, store[t.key] || (store[t.key] = {}))
            }
          }
        }
      },
      props: {
        default: {
          render: {
            static (t, node, store) {
              const key = t.key
              store[$215521817_$2360589662[key] || key] = $215521817_$3236326699[key]
                ? $215521817_$3236326699[key](t.compute())
                : t.compute()
            },
            state (t, s, type, subs, tree, id, pid, order) {
              const p = t._p
              const path = [ t.key, p.key ]
              const pp = p._p
              const pstore = p.getStore.call(t, tree, pid + pp.key)
              var store = pstore
              var i = path.length - 1
              for (; i >= 1; i--) {
                store = store[path[i]]
              }
              var key = path[i]
              if (key in $215521817_$2360589662) {
                key = $215521817_$2360589662[key]
              }
              if (!s || s.val === null || type === 'remove') {
                if (key in store) {
                  delete store[key]
                }
              } else {
                store[key] = s
              }
              pp.render.state(pp, s, type, subs, tree, id, pid, order, pstore)
            }
          }
        }
      }
    }
  }
}

const $215521817_$1567623425_clear = () => {
  $215521817_$1567623425_globalSheet.count = 0
  $215521817_$1567623425_globalSheet.map = {}
}

const $215521817_$1567623425_done = (elem, resolve, create) => {
  if (create) elem.stylesheet = new $215521817_$2447655140(elem, $215521817_$1567623425_globalSheet)
  if (elem.stylesheet) elem.stylesheet.exec(elem.node, resolve)
  $215521817_$1567623425_inProgress = void 0
}

const $215521817_$1567623425_render = t => { $215521817_$1567623425_inProgress = t }



var $215521817_$1567623425_$ALL$ = {
  sheet: $215521817_$1567623425_sheet,
  clear: $215521817_$1567623425_clear,
  render: $215521817_$1567623425_render,
  done: $215521817_$1567623425_done
}
;



const $215521817_$2061619571_transform = $215521817_$2360589662.transform || 'transform'

const $215521817_$2061619571_setTransform = (val, store, node) => {
  if ('x' in store || 'y' in store) {
    const translate3d = `translate3d(${(store.x
      ? $215521817_$2061619571_unit(store.x, 'px')
      : '0px')}, ${(store.y
        ? $215521817_$2061619571_unit(store.y, 'px')
        : '0px')}, 0px)`
    val = val ? (val + ' ' + translate3d) : translate3d
  }

  if ('scale' in store) {
    const scale = `scale(${store.scale})`
    val = val ? (val + ' ' + scale) : scale
  }

  if ('rotate' in store) {
    const rotate = `rotate(${store.rotate}deg)`
    val = val ? (val + ' ' + rotate) : rotate
  }

  node.style[$215521817_$2061619571_transform] = val
}

const $215521817_$2061619571_unit = (val, unit) => typeof val === 'number' && !isNaN(val)
  ? val + unit
  : val

var $215521817_$2061619571 = {
  type: 'group',
  render: {
    static (t, node, store) {
      var val = t.compute()
      if (!val || typeof val !== 'string') { val = '' }
      $215521817_$2061619571_setTransform(val, store, node)
    },
    state (t, s, type, subs, tree, id, pid, store) {
      var val = s && $215521817_$61209465_get$(t) ? t.compute(s, s) : t.compute()
      if (!val || typeof val !== 'string') { val = '' }
      const node = $215521817_$1908772127(tree, pid)
      if (node) { $215521817_$2061619571_setTransform(val, store, node) }
    }
  }
}

;






const $215521817_$2721196033_inlineStyle = {
  type: 'property',
  props: { name: true },
  render: {
    static (target, node) {
      node.style[target.name || target.key] = target.compute()
    },
    state (t, s, type, subs, tree, id, pid) {
      if (type !== 'remove') {
        const node = $215521817_$1908772127(tree, pid)
        node.style[t.name || (t.key !== 'default' ? t.key : s.key)] = s
        ? t.compute(s, s)
        : t.compute()
      }
    }
  }
}

const $215521817_$2721196033_prefixInlineStyle = {
  type: 'inlineStyle',
  render: {
    static (target, node) {
      const field = target.name || target.key
      node.style[field] = $215521817_$3236326699[field](target.compute())
    },
    state (t, s, type, subs, tree, id, pid) {
      if (type !== 'remove') {
        const node = $215521817_$1908772127(tree, pid)
        const field = t.name || (t.key !== 'default' ? t.key : s.key)
        node.style[field] = $215521817_$3236326699[field](s ? t.compute(s, s) : t.compute()
        )
      }
    }
  }
}

const $215521817_$2721196033_style = {
  type: 'property',
  render: {
    static: $215521817_$1039077650_property,
    state (t, s, type, subs, tree, id, pid) {
      if (type !== 'remove') {
        const pnode = $215521817_$1908772127(tree, pid)
        if (!pnode._styleStaticParsed) {
          $215521817_$1039077650_property(t, pnode)
          pnode._styleStaticParsed = true
        }
      }
    }
  },
  props: {
    sheet: $215521817_$1567623425_sheet,
    transform: $215521817_$2061619571,
    inlineStyle: $215521817_$2721196033_inlineStyle,
    prefixInlineStyle: $215521817_$2721196033_prefixInlineStyle
  },
  inject: t => {
    const inlineStyle = t.props.inlineStyle
    const prefixInlineStyle = t.props.prefixInlineStyle
    const props = {
      default (t, val, key, stamp) {
        if (key in $215521817_$2360589662) {
          key = $215521817_$2360589662[key]
        }
        if (val && val.$ || t.get([key, '$'])) {
          if ($215521817_$3236326699[key]) {
            return prefixInlineStyle(t, val, key, stamp)
          } else {
            return inlineStyle(t, val, key, stamp)
          }
        } else {
          t.set({ sheet: { [key]: val } }, stamp)
        }
      }
    }
    t.set({ props }, false)
  }
}

var $215521817_$2721196033 = {
  types: { inlineStyle: $215521817_$2721196033_inlineStyle, style: $215521817_$2721196033_style },
  props: { style: { type: 'style' } }
}

;

const $215521817_$607912786_injectable = {}

var $215521817_$607912786 = $215521817_$607912786_injectable

$215521817_$607912786_injectable.props = {
  isWidget: {
    type: 'property',
    subscriptionType: 1,
    $: true,
    render: {
      state (target, s, type, subs, tree, id, pid) {
        if (type === 'new') {
          $215521817_$834129491.push(target.parent(), pid, tree)
        }
      }
    }
  }
}

;var $215521817_$1876423860 = (e, data) => {
  const touch = e.changedTouches
  const ev = touch ? touch[0] : e
  if (data.x !== void 0) {
    data.prevX = data.x
  }
  if (data.y !== void 0) {
    data.prevY = data.y
  }
  if (ev.clientX !== void 0) {
    data.x = ev.clientX
  }
  if (ev.clientY !== void 0) {
    data.y = ev.clientY
  }
  data.event = e
  return data
}

function $215521817_$1876423860_attachStartPos (data) {
  data.startX = data.x
  data.startY = data.y
  return data
}

var $215521817_$1876423860_$ALL$ = {
  attachStartPos: $215521817_$1876423860_attachStartPos
}
;var $215521817_$4038664887 = data => {
  var target = data.target
  var state = target._s
  if (state) {
    const resolved = state.applyContext(target._sc)
    if (resolved) {
      target._s = state = resolved
      target._sc = state.storeContext()
    } else if (resolved === null) {
      target._s = null
      delete target._sc
      state = null
    }
    data.state = state
  }
}

;



const $215521817_$1472074048_emitter = (t, key) => t.emitters && t.emitters[key] ||
  t.inherits && $215521817_$1472074048_emitter(t.inherits, key)

var $215521817_$1472074048 = (key, e) => {
  var t = e.target
  var stamp
  do {
    let elem = t._
    if (elem) {
      let listener = $215521817_$1472074048_emitter(elem, key)
      if (listener) {
        if (!stamp) stamp = $215521817_$826337949.create()
        let data = { target: t }
        $215521817_$4038664887(data)
        elem.emit(key, $215521817_$1876423860(e, data), stamp)
        if (data.prevent) {
          break
        }
      }
    }
    if (stamp) $215521817_$826337949.close()
  } while ((t = t.parentNode))
}

;var $215521817_$3345421700 = {}

; // again scope it differently this is bit dirty

// just use hasTouch
const $215521817_$2280123504_touch = typeof window !== 'undefined' && ((('ontouchstart' in global) ||
  global.DocumentTouch &&
  document instanceof global.DocumentTouch) ||
  navigator.msMaxTouchPoints)

// super unreliable check for chrome emulator for development (on mac only)
// const isChromeEmulator = touch &&
//   navigator.vendor === 'Google Inc.' &&
//   navigator.platform === 'MacIntel'

if ($215521817_$2244796395.platform === 'ios' && $215521817_$2280123504_touch) {
  document.documentElement.style.cursor = 'pointer' // ios test...
  document.body.style.cursor = 'pointer'
}

var $215521817_$2280123504 = $215521817_$2280123504_listen

function $215521817_$2280123504_listen () {
  const l = arguments.length
  const a = []
  for (let i = 0; i < l; i++) {
    let key = arguments[i]
    let listener = arguments[++i]
    $215521817_$2280123504_addEventListener(
      key,
      listener,
      key === 'focus' ||
      key === 'scroll' ||
      key === 'blur' ||
      key === 'mouseenter'
    )
    a.push(key, listener)
  }
  return () => {
    for (let i = 0; i < l; i++) { // remove listeners test!
      document.removeEventListener(a[i], a[++i])
    }
  }
}

const $215521817_$2280123504_addEventListener = function addEventListener (key, listener, capture) {
  document.addEventListener(key, listener, capture)
}
// : function addEventListener (key, listener, capture) { // chrome emulator tests
//   const touchEvent = key.indexOf('mouse') === -1
//   if (touchEvent) { document.addEventListener(key, listener, capture) }
// }

;

function $215521817_$2852793488_Event (type) {
  this.type = type
}

$215521817_$2852793488_Event.prototype.preventDefault = function () {
  console.log('WARN - prevent default - not implemented in node.js yet!')
}

Object.defineProperty(global.Element.prototype, 'dispatchEvent', {
  configurable: true,
  value: function (event) {
    $215521817_$2852793488_exec(this, event)
  }
})

function $215521817_$2852793488_exec (node, event) {
  var store = $215521817_$3345421700[event.type]
  event.target = node
  if (store) {
    for (let i = 0; i < store.length; i++) {
      store[i].call(node, event)
    }
  }
}

global.Event = $215521817_$2852793488_Event

global.document.addEventListener = function (key, fn) {
  var store = $215521817_$3345421700[key]
  if (!store) {
    store = $215521817_$3345421700[key] = []
  }
  store.push(fn)
}

global.document.removeEventListener = function (key, fn) {
  const store = $215521817_$3345421700[key]
  if (store) {
    for (let i = 0, len = store.length; i < len; i++) {
      if (store[i] === fn) {
        store.splice(i, 1)
        break
      }
    }
  }
}

var $215521817_$2852793488 = $215521817_$2280123504

;




const $215521817_$985981857_emitterProperty = $215521817_$1662971556.struct.props.on.struct.props.default
const $215521817_$985981857_cache = {}
const $215521817_$985981857_injectable = {}

var $215521817_$985981857 = $215521817_$985981857_injectable

$215521817_$985981857_injectable.on = {
  props: {
    error: {},
    remove: {},
    default: (t, val, key) => {
      if (!$215521817_$985981857_cache[key]) {
        $215521817_$985981857_cache[key] = true
        $215521817_$2852793488(key, (e) => $215521817_$1472074048(key, e))
      }
      t._p.set({ hasEvents: true }, false)
      $215521817_$985981857_emitterProperty(t, val, key)
    },
    move: (t, val) => {
      // add some checks perhaps?
      t.set({
        mousemove: val,
        touchmove: val
      })
    },
    down: (t, val) => {
      t.set({
        mousedown: val,
        touchstart: val
      })
    },
    up: (t, val) => {
      t.set({
        touchend: val,
        mouseup: val
      })
    }
  }
}

$215521817_$985981857_injectable.props = {
  hasEvents: {
    type: 'property',
    // sync: false,
    // this is the time for sync: false....
    subscriptionType: 'switch',
    $: true,
    render: {
      state (target, s, type, subs, tree, id, pid) {
        const node = $215521817_$1908772127(tree, pid)
        if (node) {
          if (s) {
            node._sc = s.storeContext()
            node._s = s
          }
          if (!('_' in node)) {
            node._ = target.parent()
          }
        }
      }
    }
  }
}

;

const $215521817_$3443299464_emitterProperty = $215521817_$1662971556.struct.props.on.struct.props.default

const $215521817_$3443299464_props = {
  tab: [ 9, 'Tab', 'U+0009' ],
  enter: [ 13, 'Enter' ],
  escape: [ 27, 'Escape', 'U+001B' ],
  space: [ 32, 'Space', 'U+0020' ],
  arrowleft: [ 37, 'ArrowLeft', 'Left' ],
  arrowup: [ 38, 'ArrowUp', 'Up' ],
  arrowright: [ 39, 'ArrowRight', 'Right' ],
  arrowdown: [ 40, 'ArrowDown', 'Down' ]
}

for (let key in $215521817_$3443299464_props) {
  const ids = new RegExp(`(^${$215521817_$3443299464_props[key].join('$|^')}$)`)
  $215521817_$3443299464_props[key] = (t, val) => {
    t.set({
      keydown: {
        [key] (e, stamp, elem) {
          if (
            ids.test(e.event.keyCode) ||
            ids.test(e.event.key) ||
            ids.test(e.event.keyIdentifier)
          ) {
            elem.emit(key, e, stamp)
          }
        }
      }
    })
    $215521817_$3443299464_emitterProperty(t, val, key)
  }
}

var $215521817_$3443299464 = { on: { props: $215521817_$3443299464_props } }

;



var $215521817_$2380829049 = $215521817_$1662971556.create({
  type: 'property',
  inject: [
    $215521817_$2365388884,
    $215521817_$4133454486
  ],
  instances: false,
  props: {
    storeContextKey: true,
    default: 'self'
  },
  on: {
    data: (val, stamp, t) => {
      if (t._p && t._p._cachedNode === void 0) {
        t._p._cachedNode = null
      }
    }
  },
  subscriptionType: 'shallow'
  // noReference: true,
}, false)

;














const $215521817_$2216717553_element = $215521817_$1662971556.create({
  type: 'element',
  types: {
    property: $215521817_$2380829049,
    element: 'self'
  },
  instances: false,
  define: {
    isElement: true,
    resolve: false,
    noResolve (val = true) {
      $215521817_$2216717553_element._c = null
      $215521817_$2216717553_element._cLevel = null
      $215521817_$2216717553_element.set({ define: { _noResolve_: val } })
    },
    resolveNodes () {
      // find real inherits
      $215521817_$2216717553_element._c = null
      $215521817_$2216717553_element._cLevel = null
      $215521817_$2216717553_element.set({ define: { resolve: true } })
    },
    removeUnresolved () {
      if (typeof window !== 'undefined') {
        var d = Date.now()
        // has to work better of course
        // will fix this up beter later...
        const elems = this.node.querySelectorAll('[id]')

        // console.log('???', elems)

        // not supported in html element will become different
        var i = elems.length
        var l = 0
        // measure this function
        while (i--) {
          if (elems[i].id > 1e6) {
            l++
            elems[i].parentNode.removeChild(elems[i])
          }
        }
        $215521817_$2216717553_element._c = null
        $215521817_$2216717553_element._cLevel = null
        $215521817_$2216717553_element.set({ define: { resolve: false } })

        // global.ms += Date.now() - d
        console.log(`REMOVE ${l} UN-RESOLVED`, Date.now() - d, 'ms')
      }
    }
  }, // unnesecary code
  props: {
    resolveAttr: (t, val, key, stamp) => {
      var props = t.props
      while (!props) {
        props = t.inherits.props
      }
      const set = {}
      for (let key in val) {
        if (key in props) {
          set[key] = val[key]
        } else {
          if (!set.attr) set.attr = {}
          set.attr[key] = val[key]
        }
      }
      t.set(set, stamp)
    },
    tag: true,
    resolveHash: true,
    default: 'self'
  },
  on: {
    resolve: (val, stamp, element) => {
      if (val) {
        element.resolveNodes()
      } else {
        // element.removeUnresolved()
      }
    }
  },
  tag: 'div',
  inject: [
    $215521817_$4133454486,
    $215521817_$2365388884,
    $215521817_$148791133,
    $215521817_$4188164346,
    $215521817_$390291418,
    $215521817_$2824643288,
    $215521817_$2300670804,
    $215521817_$2079359529,
    $215521817_$2721196033,
    $215521817_$607912786,
    $215521817_$985981857,
    $215521817_$3443299464
  ]
}, false)

$215521817_$2216717553_element.set({
  props: {
    // with a subs ? not rly nessecary
    resolve: val => {
      console.log('lets go prerender!')
    }
  }
}, false)

var $215521817_$2216717553 = $215521817_$2216717553_element

;






const $215521817_$3307881524_renderStyle = $215521817_$1567623425_render

var $215521817_$3307881524 = (elem, state, cb, cb2) => {
  var dom, node, t
  if (elem instanceof global.Element) {
    dom = elem
    elem = state
    state = cb
    cb = cb2
  }

  if (!elem.inherits) {
    elem = $215521817_$2216717553.create(elem)
  }

  if (dom) {
    elem.node = dom
    $215521817_$1567623425_done(elem, true, true)
    elem.emit('resolve', true)
  }

  $215521817_$3307881524_renderStyle(elem)

  const subs = elem.$map()
  const tree = t = {}
  const uid = $215521817_$1662971556.puid(elem)

  if (state === void 0) {
    $215521817_$3029535488(state, 'new', subs, tree)
    if (cb) { cb(subs, tree, elem) }
  } else {
    if (!state || !state.inherits) { state = $215521817_$1662971556.create(state) }
    $215521817_$3029535488(state, 'new', subs, tree)
    if (cb) {
      $215521817_$1662971556.subscribe(state, subs, (s, type, su, t) => {
        $215521817_$3029535488(s, type, su, t)
        cb(subs, tree, elem, s, type, su, t)
      }, tree)
      cb(subs, tree, elem)
    } else {
      state.subscribe(subs, $215521817_$3029535488, true, tree)
    }
  }

  $215521817_$826337949.close()

  const $ = $215521817_$61209465_get$(elem)

  if ($) {
    // need to do this as well
    let path = $
    if ($215521817_$61209465_get$any(elem)) {
      if (elem.$.length === 1) {
        path = []
        t = tree
      } else {
        path = $.slice(0, -1)
        t = tree
        t = $215521817_$61209465_getPath(tree, path)
      }
    } else {
      t = $215521817_$61209465_getPath(tree, $)
    }
    if (!t) {
      const obj = {}
      let len = path.length
      let i = 0
      let s = obj
      while (i < len && (s = s[path[i++]] = {}));
      state.set(obj)
      t = $215521817_$61209465_getPath(tree, path)
    }
  }

  // make setting resolve optional
  node = elem.node = t._[uid]
  $215521817_$1567623425_done(elem, node)
  if (dom) elem.emit('resolve', false)
  return node
}

;






if (typeof __filename !== 'undefined') console.log('brisky-render:', __filename)



var $215521817_$4202851505_$ALL$ = {
  render: $215521817_$3307881524,
  element: $215521817_$2216717553,
  parent: $215521817_$1908772127,
  attr: $215521817_$2300670804,
  clearStyleCache: $215521817_$1567623425_clear,
  prefix: $215521817_$2360589662
}

var $215521817 = $215521817_$4202851505_$ALL$
;


if ($2244796395.device === 'phone' || $2244796395.device === 'tablet' || ($2244796395.device === 'tv' && $2244796395.platform === 'tizen')) {
  console.log('phone or tablet')
} else if ($2244796395.platform === 'windows' && $2244796395.browser === 'firefox') {
  console.log('firefox on windows non phone or tablet or tv')
  console.log($2244796395.version > 20 ? '20+' : '20-')
} else {
  console.log('other')
  console.log($2244796395.version < 30 ? '30-' : '30+')
}

if ($2244796395.device === 'tablet') {
  console.log('any tablet')
  if ($2244796395.browser === 'chrome' && $2244796395.version >= 40) {
    console.log('chrome 40+ on any tablet')
  }
}

console.log('all')

// == step 1

// 1. device===phone||device===tablet||device===tv
// 2. (device[$nin=phone,tablet,tv])&&(platform===windows&&browser===firefox)&&version>20
// 3. (device[$nin=phone,tablet,tv])&&(platform===windows&&browser===firefox)&&version<=20
// 4. (device[$nin=phone,tablet,tv])&&(platform!==windows||browser!==firefox)&&version<30
// 5. (device[$nin=phone,tablet,tv])&&(platform!==windows||browser!==firefox)&&version>=30

// 1. (device===tablet)&&(browser===chrome&&version>=40)
// 2. (device===tablet)&&(browser!==chrome||version<40)
// 3. (device!==tablet)

// == step 2

// 1. (device===tablet)&&(browser===chrome&&version>=40)
// 2. (device===tablet)&&(browser!==chrome||version<40)
// 3. (device===phone||device===tv)
// 4. (device[$nin=phone,tablet,tv])&&(platform===windows&&browser===firefox)&&version>20
// 5. (device[$nin=phone,tablet,tv])&&(platform===windows&&browser===firefox)&&version<=20
// 6. (device[$nin=phone,tablet,tv])&&(platform!==windows||browser!==firefox)&&version<30
// 7. (device[$nin=phone,tablet,tv])&&(platform!==windows||browser!==firefox)&&version>=30

// browser, version, prefix, platform, device, webview
