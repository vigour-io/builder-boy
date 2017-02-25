
const style = {
  padding: '10px',
  background: '#eee',
  margin: '0 auto',
  width: '100px',
  height: '100px',
  borderRadius: '50%'
}

const style2 = {
  background: 'blue',
  color: 'white',
  margin: '0 auto',
  width: '20px',
  height: '20px',
  textAlign: 'center',
  padding: '10px'
}

const Blurfx = state => {
  console.log('lets add some swithcin\'')
  if (state.condition.compute() === 'ballz') {
    return <div style={style} onClick={({ state }) => state.set({
      condition: 'no-ballz'
    })}></div>
  } else {
    return <div style={style2} onClick={({ state }) => state.set({
      condition: 'ballz'
    })}>x</div>
  }
}


// const Blurfx = state => state.condition.compute() === 'ballz' && <div>X</div>

var $615976759 = Blurfx
