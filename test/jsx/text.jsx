const cat = 'https://media1.popsugar-assets.com/files/thumbor/EYb5dO2AAuFKts5Vj6o8wUPLV_E/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/08/08/878/n/1922507/caef16ec354ca23b_thumb_temp_cover_file32304521407524949/i/Funny-Cat-GIFs.jpg'

const flurps = 'hahahahahaha'

const id = 'bye'

const Blurfx = state => <div>
  <div>static boy
    <div style={{
      color: 'pink',
      // background: state.color.compute()
    }}>haha</div>
    <img src={cat}/>
  </div>
  <div>---{state.nested.blurf.compute() + '!!!!'}----</div>
  <div key={id}>
    hello: {flurps} !!!!!
  </div>
  <a key='hello' />
  <button onClick={({ state }) => {
    state.nested.blurf.set(Math.random())
    console.log('CLICK', state)
  }}>click me!</button>
  <div>
  {{
    blabs: <div>WOW MIND IS BLOWN</div>,
    blurf: <div>WOW MIND IS BLOWN2</div>
  }}
  </div>
</div>

var $615976759 = Blurfx
