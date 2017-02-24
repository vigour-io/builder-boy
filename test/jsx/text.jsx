const flurps = 'hahahahahaha'

const id = 'bye'

const Blurfx = state => <ul>
  {state.nested.blurf.compute().toUpperCase()}
  <hr/>
  {state.list.slice(0, 3)
    .filter(state => state.blurf.compute() && state.title.burf.compute() === 'yes')
    .map(state =>
      <li onClick={({ state }) => state.set({ blurf: false })}>yes</li>
  )}
</ul>

var $615976759 = Blurfx
