const bla = (fetch) => {
  fetch('https://google.com').then(res => {
    console.log('lullz')
  }).catch(e => {
    console.lor('biurr', e)
  })
}

// bla()