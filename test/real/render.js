import br from 'brisky-render'
const bla = require('./bla.json')


// // const fs = require('fs')

const state = {
  hello: 'hello what?'
}

// const state = {
//   hello: 'HELLO!1'
// }

// // // console.log(state

document.body.appendChild(br.render({
  text: { $: 'hello' },
  bla: {
    text: JSON.stringify(bla, false, 2),
    style: {
      marginTop: '15px',
      fontSize: '20px'
    }
  },
  style: {
    color: 'rgb(20, 20, 20)',
    padding: '15px',
    margin: '0 auto',
    marginTop: '150px',
    background: '#ee',
    borderRadius: '15px',
    transform: {
      rotate: 0
    },
    fontSize: '50px',
    textAlign: 'center',
    fontFamily: 'helvetica'
  },
  on: {
    click: () => {
      console.log('do it!')
    }
  }
}, state))

// // // setInterval(() => {
// // //   window.location.reload()
// // // }, 200)
// import { struct } from 'brisky-struct'
