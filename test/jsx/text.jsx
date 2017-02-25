const flurps = 'hahahahahaha'

const id = 'bye'

const click = ({ state }) => state.set({ blurf: { real: false } })

// need to make support for variables etc
//   {yuz.nested.blurf.compute().toUpperCase()}

const Blurfx = yuz => <ul>
  <hr/>
  {yuz.list
    .filter(x => x.blurf.real.compute())
    // .sort((a, b) => {
    //   return a.key > b.key ? -1 : 1
    // })
    .map(yuz => {
      return <li onClick={click}>
        yes: {yuz.emoji.compute()}
      </li>
    }
  )}
</ul>

var $615976759 = Blurfx

/*
    // .slice(0, 3)
    // .sort((a, b) => {
    //   return a.order.compute() > b.order.compute() ? -1 : 1
    // })
*/

