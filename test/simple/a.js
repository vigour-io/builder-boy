// import { set } from '../manipulate'
const val = () => {}
const set = () => {}

const inject = (t, val, stamp) => typeof val === 'function'
  ? val(t, val, stamp)
  : set(t, val, stamp)

// export default
const bla = (t, val, key, stamp) => {
  var changed
  if (Array.isArray(val)) {
    for (let i = 0, len = val.length; i < len; i++) {
      if (inject(t, val[i], stamp)) {
        changed = true
      }
    }
  } else {
    changed = inject(t, val, stamp)
  }
  return changed
}
