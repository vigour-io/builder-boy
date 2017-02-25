const flurps = 'hahahahahaha'

const id = 'bye'

const click = ({ state }) => state.set({ blurf: { real: false } })

// need to make support for variables etc
//   {yuz.nested.blurf.compute().toUpperCase()}

const Blurfx = yuz => <ul>
  <hr/>
  {yuz.list
    // .filter(x =>
    //   x.blurf.real.compute() &&
    //   x.title.compute() === 'yes'
    // )
    // .slice(0, 3)
    // .sort((a, b) => {
    //   return a.order.compute() > b.order.compute() ? -1 : 1
    // })
    .sort((a, b) => {
      return a.key > b.key ? -1 : 1
    })
    .map(state => {
      return <li onClick={click}>
        yes: {s.emoji.compute()}
      </li>
    }
  )}
</ul>

var $615976759 = Blurfx
