const flurps = 'hahahahahaha'

const id = 'bye'

const click = ({ state }) => state.set({ blurf: { real: false } })

// need to make support for variables etc
//   {yuz.nested.blurf.compute().toUpperCase()}

const buttonStyle = {
  border:'1px solid #ccc',
  background: '#333',
  color: 'white',
  borderRadius: '50%',
  height: '25px',
  marginLeft: '5px',
  width: '25px',
  float: 'right'
}

const liStyle = {
  background: '#eee',
  padding: '5px',
  borderBottom: '1px solid #ccc',
  transition: 'margin 0.2s',
  margin: {
    $: 'active',
    $transform: (val, state) => val ? '10px' : ''
  }
}

const hover = ({ state }) => {
  state.set({ active: true })
}

const inc = e => {
  e.prevent = true
  e.state.set({ order: e.state.get('order').compute() + 1})
}

const dec = e => {
  e.prevent = true
  e.state.set({ order: e.state.get('order').compute() - 1})
}

const Blurfx = yuz => <ul style={{ fontFamily: 'courier' }}>
  <hr/>
  {yuz.list
    .filter(x => x.emoji.compute() && x.blurf.real.compute())
    .sort((a, b) => a.order.compute() > b.order.compute() ? -1 : 1)
    .map(yuz => {
      return <li style={liStyle} onClick={click} onMouseenter={hover}>
        fun {yuz.emoji.compute()} fun
        <span> {yuz.order.compute()}</span>
        <button onClick={inc} style={buttonStyle}>+</button>
        <button onClick={dec} style={buttonStyle}>-</button>
      </li>
    }
  )}
</ul>

// const Blurfx = yuz => <div>  </div>

var $615976759 = Blurfx

//         <span>{' ' + yuz.order.compute()}</span>
// maybe dont shave of the white space at the start

/*
    // .slice(0, 3)
    // .sort((a, b) => {
    //   return a.order.compute() > b.order.compute() ? -1 : 1
    // })

        // .sort((a, b) => {
    //   return a.key > b.key ? -1 : 1
    // })
*/

