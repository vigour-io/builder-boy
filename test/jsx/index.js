import { render } from 'brisky-render'
import Text from './text.jsx'

document.body.appendChild(render(Text, {
  title: 'hello world!',
  nested: { blur: 'hello' },
  color: 'blue'
}))
