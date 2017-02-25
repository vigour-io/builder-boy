const flurps = 'hahahahahaha'

const id = 'bye'

const click = ({ state }) => state.set({ blurf: { real: false } })

const Blurfx = s => <ul>
  {s.nested.blurf.compute().toUpperCase()}
  <hr/>
  {s.list
    .filter(s =>
      s.blurf.real.compute() &&
      s.title.compute() === 'yes'
    )
    .slice(0, 3)
    .sort((a, b) => {
      return a.title.compute() > b.title.compute() ? -1 : 1
    })
    .map(state => {
      return <li onClick={click}>
        yes: {s.emoji.compute()}
      </li>
    }
  )}
</ul>

var $615976759 = Blurfx
