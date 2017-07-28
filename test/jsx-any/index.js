const Div = s => <div>{s.list.map(s => s.title
  ? <div>{s.title.compute()}</div>
  : <span>{s.compute()}</span>
)}</div>
