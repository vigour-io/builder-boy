const HorizontalListItem = state => <div style={{
  display: 'inline-block',
  width: '250rem'
}}><div key='img' style={{
  height: '188rem',
  position: 'relative'
}} resize={{
  width: 250,
  height: 188
}} /></div>

const HorizontalList = state => <div>
  <div key='title' style={{
    color: state.style.titleColor.compute(),
    textOverflow: 'ellipsis',
    fontSize: '22rem',
    fontWeight: 500,
    marginBottom: '10rem'
  }}>{ state.title.compute() }</div>
  <div key='body' focusGroup={{
    scroll: 'x',
    $: 'items'
  }} style={{
    position: 'relative',
    overflowX: 'auto',
    WebkitTransform: 'translateZ(0)'
  }}>
    <div key='items' style={{ whiteSpace: 'nowrap' }}>
      {state.items.map(s => <HorizontalListItem />)}
    </div>
  </div>
</div>
