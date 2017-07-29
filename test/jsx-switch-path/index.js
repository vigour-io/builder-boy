const Div = props => props.title[0].compute() === 'bla'
  ? <div>ha!</div>
  : <span>ho!</span>

const ActionButtonTv = props => <div style={{
  backgroundColor: !props.root().menu.open.compute() && props.root().layer[0].items.columnFocusKey.compute() == 0 //eslint-disable-line
  ? 'white'
  : backgroundColor,
  color: !props.root().menu.open.compute() && props.root().layer[0].items.columnFocusKey.compute() == 0 //eslint-disable-line
  ? backgroundColor
  : 'white',
  display: 'table',
  borderSpacing: '15rem',
  fontSize: '24rem',
  marginTop: '15rem'
}} />
