// const Text = ({ state }) => <button>{
//   state.title.compute() + '!'
// }</button>

// const Blurf = ({ state }) => <pre>{`----${state.title.computex()}----`}</pre>

// const Blurf = ({ state }) => <pre>---{state.title.compute() + '💩'}---</pre>
//  <-- need to support this ofc

// state needs to become like 10000x better

// const Blurfxxx = ({ state }) => {
//   const style = {
//     color: 'pink',
//     padding: '20px',
//     background: 'red',
//     textAlign: 'center'
//     // background: state.color.compute() + 20
//   }
//   return <div style={style}>--- {'!' + state.title.compute()} ---</div>
// }


const style = {
  color: 'pink',
  padding: '20px',
  background: 'red',
  textAlign: 'center'
  // background: state.color.compute() + 20
}

// can also do props.state -- need support
// so need some kind of mapper on run time else you dont know which attr actual attr
// other solution is default keys map them to attr ?

// -- attr={{data: 'dirt'}}

// also need props definitions of course

// const Killer = state => {
//   console.log('???')
//   if (state.type.compute() === 'durk') {
//     return <div>{state.blurf.bla.bla.bla.compute() + Math.random()}</div>
//   } else if (state.type) {
//     return <div>FLUPS</div>
//   }
// }

// const Blurfx = ({ state }) => <div style={style}>hahaha yuzi jurk {
//   '!' + state.title.compute() + 'hahaha ' // so compute will be evalt to html if inline
// } ---</div>

const X = state => <div>{state.bla.todo.slice(0, 3).map(state => {
  if (state.type.compute() === 'flurps') return <div>{state.title.compute()}</div>
}</div>


const Image = state => <img src={state.img.compute()}></img>

const bla = state => {
  if (state.flurps.compute() === true && state.root().query.compute()) {
    // if (state.root().smootieballz === true) {
      return <div></div>
    }
  }
}

const X = state => <div>
  <div>
    {state.foo.compute()}
    <Image $={state.img.root().blurf}></Image>
  </div>
</div>

{
  $: 'bla.todo.$any',
  $any: keys => keys.slice(0, 3),
  props: {
    default: {
      html: { $: 'title' },
      $switch: {
        type: 'shallow',
        val: state => {
          if (state.type.compute() === 'flurps') {
            return true
          }
        }
      }
    }
  }
}

 // <div $="$any" props={{default: <div bla=></div> }}></div>

// const Killer = state => {
//   console.log('???')
//   if (state.type.compute() === 'durk') {
//     return <div state={state.foo}>{state.blurf.compute() + Math.random()}</div>
//   } else if (state.type) {
//     return <div>FLUPS</div>
//   }
// }

// const Blax = state => {
//   return <div style={style}> {state.repeat.map(state => <div>{state.title.compute()}</div>)} </div>
// }


// const Blurfx = (state) => <div style={style}> {
//   state.repeat.map(state => <div>{state.title.compute()}</div>)
// } </div>

  // easier ===> just eval whole expression put it in and skip the state part replace that


// tmp need to fix this later (that it gets transpiled using the normal transpiler)
var $615976759 = Blurfx
