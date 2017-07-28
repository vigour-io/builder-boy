const $1560120814_foo = {
  tag: 'div',
  resolveAttr: {
    value: {
      $: {
        title: {
          val: 'shallow'
        }
      },
      $transform: ($val, state) => {
        return (($state0 = state.get(['title'])) && $state0.compute())
      }
    },
    undefinedAttribute: true,
    falseAttribute: false,
    trueAttribute: true
  }
} // eslint-disable-line