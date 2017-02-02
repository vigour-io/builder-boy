const { struct } = require('brisky-struct')
const boy = struct({
  props: {
    default: {
      on: val => {
        if (val !== null) {
          // start watching this file
        } else {
          // remove the watcher
        }
      }
    }
  }
})