const Div = s => <div>{s.list.map(s => s.title
  ? <div>{s.title.compute()}</div>
  : <span>{s.compute()}</span>
)}</div>

const LoginModal = props => <div style={bg}><div style={style}>
  <div style={{
    width: width + 'rem',
    height: height + 'rem',
    position: 'absolute'
  }}><ModalBg $='img'/></div>

  <div style={{
    width: width + 'rem',
    height: height + 'rem',
    position: 'absolute',
    color: props.root().modalColor.compute()
  }}>
    <div style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
      <div style={{
        paddingLeft: '15rem',
        display: 'table-cell',
        verticalAlign: 'middle',
        fontSize: '20rem',
        fontWeight: 100
      }}>
        {props.title.compute()}
      </div>
      <div style={{
        display: 'table-cell',
        width: navBarHeight,
        height: navBarHeight
      }}><IconClose onClick={close} $='root.modalColor' /></div>
    </div>
    {
      props.map(s => {
        return <Button/>
      }
    )}
  </div>
</div></div>