const Page = props => <div style={{
  backgroundColor: props.page.style.background.compute()
}} />

export default props => <div>
  <div style={{ backgroundColor: props.bgColor.compute() }}>
    <Page>
      { props.page.current
      .sort((a, b) => {
        if (a.component.compute() === 'Img') {
          return -1
        } else if (b.component.compute() === 'Img') {
          return 1
        } else {
          return a.order.compute() > b.order.compute() ? 1 : -1
        }
      })
      .map(s => {
        const component = s.component.compute()
        if (component === 'HorizontalList') {
          return <div>{ s.title.compute() }</div>
        } else if (component === 'Grid') {
          return <div />
        }
      })}
    </Page>
  </div>
</div>
