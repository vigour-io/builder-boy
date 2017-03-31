(function (global, process) { 
var $3475353448_MenuItem = {
  type: 'Link',
  child0: {
    type: 'text',
    $: 'title',
    $transform: function ($val, state) {
      return state.compute()
    }
  },
  resolveAttr: {
    style: {
      display: 'table',
      width: '100%',
      borderSpacing: '15rem',
      color: 'inherit',
      border: {
        $: {
          focus: {
            val: 'shallow'
          },
          style: {
            focusBorder: {
              val: 'shallow'
            }
          }
        },
        $transform: function ($val, state) {
          var $state0, $state1;
          return (($state0 = state.get(['focus'])) && $state0.compute()) === 'active' ? ("5rem solid " + ((($state1 = state.get([ 'style','focusBorder' ]) ) && $state1.compute()))) : '5rem solid transparent'
        }
      },
      backgroundColor: {
        $: {
          active: {
            val: 'shallow'
          },
          style: {
            activeBackground: {
              val: 'shallow'
            }
          }
        },
        $transform: function ($val, state) {
          var $state0, $state1;
          return (($state0 = state.get(['active'])) && $state0.compute()) ?
          (($state1 = state.get(['style', 'activeBackground'])) && $state1.compute()) : 'transparent'
        }
      }
    },
    on: {
      arrowup: function (ref, stamp) {
        var target = ref.target;

        return focus(target.previousSibling, stamp);
},
      arrowdown: function (ref, stamp) {
        var target = ref.target;

        return focus(target.nextSibling, stamp);
}
    }
  }
}
console.log($3475353448_MenuItem);
 })(window, {})