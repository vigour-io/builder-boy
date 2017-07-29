(function (global, process) { 
var $3484325075_Div = {
  $switch: {
    val: function (props) {
      var $state0;
      return (($state0 = props.get(['title', '0'])) && $state0.compute()) === 'bla' ?
      "child0" :
      "child1"
    },
    title: {
      0: {
        val: 'shallow'
      }
    }
  },
  $: '$switch',
  props: {
    child0: {
      tag: 'div',
      child0: {
        type: 'text',
        val: "ha!"
      }
    },
    child1: {
      tag: 'span',
      child0: {
        type: 'text',
        val: "ho!"
      }
    }
  }
}
var $3484325075_ActionButtonTv = {
  tag: 'div',
  resolveAttr: {
    style: {
      backgroundColor: {
        $: {
          root: {
            menu: {
              open: {
                val: 'shallow'
              }
            },
            layer: {
              0: {
                items: {
                  columnFocusKey: {
                    val: 'shallow'
                  }
                }
              }
            }
          }
        },
        $transform: function ($val, props) {
          var $state0, $state1;
          return !
            (($state0 = props.get(['root', 'menu', 'open'])) && $state0.compute()) &&
            (($state1 = props.get(['root', 'layer', '0', 'items', 'columnFocusKey'])) && $state1.compute()) == 0 //eslint-disable-line
            ?
            'white' :
            backgroundColor
        }
      },
      color: {
        $: {
          root: {
            menu: {
              open: {
                val: 'shallow'
              }
            },
            layer: {
              0: {
                items: {
                  columnFocusKey: {
                    val: 'shallow'
                  }
                }
              }
            }
          }
        },
        $transform: function ($val, props) {
          var $state0, $state1;
          return !
            (($state0 = props.get(['root', 'menu', 'open'])) && $state0.compute()) &&
            (($state1 = props.get(['root', 'layer', '0', 'items', 'columnFocusKey'])) && $state1.compute()) == 0 //eslint-disable-line
            ?
            backgroundColor :
            'white'
        }
      },
      display: 'table',
      borderSpacing: '15rem',
      fontSize: '24rem',
      marginTop: '15rem'
    }
  }
};
 })(window, {})