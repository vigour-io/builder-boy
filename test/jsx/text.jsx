// const click = ({ state }) => state.set({ blurf: { real: false } })

// const buttonStyle = {
//   border:'1px solid #ccc',
//   background: '#333',
//   color: 'white',
//   borderRadius: '50%',
//   height: '25px',
//   marginLeft: '5px',
//   width: '25px',
//   float: 'right'
// }

// const liStyle = {
//   background: '#eee',
//   padding: '5px',
//   borderBottom: '1px solid #ccc',
//   transition: 'margin 0.2s',
//   margin: {
//     $: 'active',
//     $transform: (val, state) => val ? '10px' : ''
//   }
// }

// const hover = ({ state }) => {
//   state.set({ active: true })
// }

// const inc = e => {
//   e.prevent = true
//   e.state.set({ order: e.state.get('order').compute() + 1})
// }

// const dec = e => {
//   e.prevent = true
//   e.state.set({ order: e.state.get('order').compute() - 1})
// }

// const Blurfx = yuz => <ul style={{ fontFamily: 'courier' }}>
//   ----{yuz.title.compute().toUpperCase()}----
//   <hr/>
//   {yuz.list
//     .filter(x => x.emoji.compute() && x.blurf.real.compute())
//     .sort((a, b) => a.order.compute() > b.order.compute() ? -1 : 1)
//     .map(yuz => {
//       return <li style={liStyle} onClick={click} onMouseenter={hover}>
//         fun {yuz.emoji.compute()} fun
//         <span> {yuz.order.compute()}</span>
//         <button onClick={inc} style={buttonStyle}>+</button>
//         <button onClick={dec} style={buttonStyle}>-</button>
//       </li>
//     }
//   )}
// </ul>

// const style = {
//   padding: '10px',
//   background: '#eee',
//   margin: '0 auto',
//   width: '100px',
//   height: '100px',
//   borderRadius: '50%'
// }

// const style2 = {
//   background: 'blue',
//   color: 'white',
//   margin: '0 auto',
//   width: '20px',
//   height: '20px',
//   textAlign: 'center',
//   userSelect: 'none',
//   padding: '10px'
// }

// const Blurfxxx = state => {
//   console.log('lets add some swtichin\'')
//   if (state.condition.compute() === 'ballz') {
//     return <div style={style} onClick={({ state }) => state.set({
//       condition: 'no-ballz'
//     })}></div>
//   } else if (state.root().title.parent().compute() === 'top dog') {
//     return <div style={style2} onClick={({ state }) => state.set({
//       condition: 'ballz'
//     })}>x</div>
//   }
// }

// const Blurfxx = state => state.condition.compute() !== 'ballz' && <div>👃</div>

// its the nested exptession...
const Gurk = state => <div>{state.list.map(state => state.title.compute() !== 'yes'
  ? <div>1</div>
  : <span>{state.emoji.compute()}</span>
)}</div>

var $615976759 = Gurk
