const generator = (t, val, stamp) => iterator(t, val(t, stamp), stamp)

const iterator = (t, iteratee, stamp, val) => {
  const id = ++uid
  if (!t.async) {
    t.async = [ iteratee, stamp, id ]
    // time out is a temp solution
    // should work with bs.on ofcourse....
    // bs.on(() => {
    //   console.log('DO QUEUE')
    //   queue(t)
    // })
    setTimeout(() => {
      // console.log('DO QUEUE')
      queue(t)
    })
  } else {
    t.async.push(iteratee, stamp, id)
  }
}

// this is the probelmo
export { iterator }
