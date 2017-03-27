const MenuItem = state => <Link style={{
  display: 'table',
  width: '100%',
  borderSpacing: '15rem',
  color: 'inherit',
  border: state.focus.compute() === 'active' ? `5rem solid ${state.style.focusBorder.compute()}` : '5rem solid transparent',
  backgroundColor: state.active.compute() ? state.style.activeBackground.compute() : 'transparent'
}} on={{
  arrowup: ({ target }, stamp) => focus(target.previousSibling, stamp),
  arrowdown: ({ target }, stamp) => focus(target.nextSibling, stamp),
}}>{ state.title.compute() }</Link>

console.log(MenuItem)
