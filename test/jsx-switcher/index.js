export default state => <form>
  <div>
    { state.items.map(s => s.type.compute() === 'Submit'
      ? <input />
      : <div />
    ) }
  </div>
</form>
