const flurps = 'hahahahahaha'

const id = 'bye'

const click = ({ state }) => state.set({ blurf: { real: false } })

const Blurfx = state => <ul>
  {state.nested.blurf.compute().toUpperCase()}
  <hr/>
  {state.list
    .filter(state =>
      state.blurf.real.compute() &&
      state.title.compute() === 'yes'
    )
    .slice(0, 3)
    .map(state => {
      return <li onClick={click}>
        yes: {state.emoji.compute()}
      </li>
    }
  )}
</ul>

var $615976759 = Blurfx
