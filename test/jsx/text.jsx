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
//   transition: 'filter 0.5s',
//   filter: {
//     $: 'active',
//     $transform: (val, state) => val ? 'grayscale(100%) invert(75%)' : 'grayscale(100%)'
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

const Blurfxx = s => <h1>
  {s.title.compute() + s.nested.blurf.compute()}
</h1>


// need to be able to change inheritance as well...
// can do multiple things

// first -- add the type when you use it and its within scope
      // probably easiest

// allways add { type }
// second -- when not in scope add type: { }

// later opt can be to not use type when it does nto change stuff
// can also add it to props when tis local

// import Bla from './yuz'

const Bla = <div></div>

const Blurfx = s => s.title.compute() && <Bla yuz='true'/>

// const Blurfx = s => <ul>
//   <h1>header</h1>
//   <hr/>
//     {s.title.compute().toUpperCase()}
//   <hr/>
//     {s.list.map(s => !s.compute() && <li>{s.title.compute()}</li>)}
//   <hr/>
//   footer
// </ul>

//  pavel {s.title.compute().toUpperCase()} pavel
//   <hr/>

    // .filter(x => x.emoji.compute() && x.blurf.real.compute())
    // .sort((a, b) => a.order.compute() > b.order.compute() ? -1 : 1)

// const Blurfx = s => <ul style={{
//     fontFamily: 'Andale Mono',
//     listStyleType: 'none'
//   }}>
//   {s.list
//     .sort((a, b) => a.order.compute() > b.order.compute() ? 1 : -1)
//     .map(s =>
//       s.title.compute() === 'yes' && s.order.compute() > -1
//       ? <li>
//         {s.emoji.compute()}
//         <button>
//           order
//         </button>
//         </li>
//       : <div>the ballz</div>
//     )}
// </ul>

// onClick={({ state }) => state.set({ order: Math.random() * 99 }) }


//<li style={liStyle} onClick={click} onMouseenter={hover}>
//        fun {yuz.emoji.compute()} fun
// <span> {yuz.order.compute()}</span>
// <button onClick={inc} style={buttonStyle}>+</button>
// <button onClick={dec} style={buttonStyle}>-</button>
// </li>

// const badge = {
//   display: 'inline-block',
//   padding: '15px',
//   width: '125px',
//   margin: '15px',
//   fontSize: '100px',
//   height: '125px',
//   overflow: 'hidden',
//   background: '#ebebeb',
//   transition: 'transform 5s',
//   borderRadius: '50%',
//   filter: 'grayscale(100%) invert(75%)',
//   userSelect: 'none',
//   boxShadow: '0px 0px 30px #ebebeb'
// }

// // its the nested exptession...
// const Gurk = state => <div style={{
//     textAlign: 'center',
//     fontFamily: 'Andale Mono'
//   }}>{
//   state.list
//     .sort((a, b) => a.order.compute() > b.order.compute() ? 1 : -1)
//     .map(state => state.title.compute() !== 'yes'
//       ? <div><hr/><div style={badge}>🙊</div><hr/></div>
//       : <div style={badge}>{state.emoji.compute()}</div>
//     )
//   }</div>

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

// a: Gurk, c: Blurfxxx

var $615976759 = { b: Blurfx }

// const Blurfxx = state => state.condition.compute() !== 'ballz' && <div>👃</div>