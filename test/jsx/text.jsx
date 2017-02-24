const flurps = 'hahahahahaha'

const id = 'bye'

const Blurfx = state => <div>
  <div>static boy
    <div style={{
      color: 'pink',
      background: state.color.compute(),
      transform: {
        x: state.nested.blurf.compute() + 20
      }
      // nested as well!
    }}>haha</div>
    <img src={state.cat.compute()}/>
  </div>
  <div>--- {'!!!' + state.nested.blurf.compute() + '!!!!'} ----</div>
  <div key={id}>hello: {flurps} !!!!!</div>
  <a key='hello' />
  <button onClick={({ state }) => state.nested.blurf.set((Math.random() * 500) | 0)}>
    click me!
  </button>
  <div>
  {{
    blabs: <div>WOW MIND IS BLOWN</div>,
    blurf: <div>WOW MIND IS BLOWN2</div>
  }}
  </div>
</div>

var $615976759 = Blurfx

// transpile objects in a fn with capitall as well then its complete
// then you an mix everythign up
