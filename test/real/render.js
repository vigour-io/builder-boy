import br from '../../../brisky-render'

const bla = require('./bla.json')

document.body.appendChild(br.render({
  text: 'hello world',
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
}))

// setInterval(() => {
//   window.location.reload()
// }, 200)
