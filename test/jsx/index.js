import { render } from 'brisky-render'
import Text from './text.jsx'

const cat = 'https://media1.popsugar-assets.com/files/thumbor/EYb5dO2AAuFKts5Vj6o8wUPLV_E/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/08/08/878/n/1922507/caef16ec354ca23b_thumb_temp_cover_file32304521407524949/i/Funny-Cat-GIFs.jpg'

document.body.appendChild(render({ smurt: Text }, {
  title: 'hello world!',
  nested: { blurf: 'hello' },
  color: 'blue',
  x: 100,
  cat,
  list: {
    props: {
      default: {
        order: 1,
        active: {
          val: false,
          on: (val, stamp, t) => {
            if (val === true) {
              t.set(new Promise(resolve => {
                setTimeout(() => resolve(false), 5e2)
              }))
            }
          }
        },
        blurf: { real: {
          val: true,
          on: (val, stamp, t) => {
            if (val !== true) {
              t.set(new Promise(resolve => {
                setTimeout(() => resolve(true), 1e3)
              }))
            }
          }
        } }
      }
    },
    inject: [[
      { title: 'lullz' },
      { title: 'blurfff' },
      { title: 'yes', emoji: '👺' },
      { title: 'yes', emoji: '😭' },
      { title: 'yes', emoji: '💩' },
      { title: 'yes', emoji: '🎃' },
      { title: 'yes', emoji: '👼' },
      { title: 'yes', emoji: '👏' },
      { title: 'yes', emoji: '💅' },
      { title: 'yes', emoji: '💃' }
    ]]
  }
}))
