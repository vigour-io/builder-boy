(function (global, process) { 
var $2683063157_Page = {
  tag: 'div',
  resolveAttr: {
    style: {
      backgroundColor: {
        $: 'page.style.background',
        $transform: function ($val, props) {
          return props.compute()
        }
      }
    }
  }
}
var $2683063157 = {
  tag: 'div',
  child0: {
    tag: 'div',
    child0: {
      type: $2683063157_Page,
      $: 'page.current.$any',
      $any: {
        component: {
          val: 'shallow'
        },
        order: {
          val: 'shallow'
        },
        val: function (keys, $state) { return keys.sort(function (keya, keyb) {
          var a = $state.get(keya);
          var b = $state.get(keyb);
          var $state0, $state1, $state2, $state3;
          if (
            (($state0 = a.get(['component'])) && $state0.compute()) === 'Img') {
            return -1
          } else if (
            (($state1 = b.get(['component'])) && $state1.compute()) === 'Img') {
            return 1
          } else {
            return (($state2 = a.get(['order'])) && $state2.compute()) >
            (($state3 = b.get(['order'])) && $state3.compute()) ? 1: -1
          }
        }); }
      },
      props: {
        default: {
          $switch: {
            val: function (s) {
              var $state0;
              var component =
                (($state0 = s.get(['component'])) && $state0.compute())
              if (component === 'HorizontalList') {
                return "child0"
              } else if (component === 'Grid') {
                return "child1"
              }
            },
            component: {
              val: 'shallow'
            }
          },
          $: '$switch',
          props: {
            child0: {
              tag: 'div',
              child0: {
                type: 'text',
                $: 'title',
                $transform: function ($val, s) {
                  return s.compute()
                }
              }
            },
            child1: {
              tag: 'div'
            }
          }
        }
      }
    },
    resolveAttr: {
      style: {
        backgroundColor: {
          $: 'bgColor',
          $transform: function ($val, props) {
            return props.compute()
          }
        }
      }
    }
  }
};
 })(window, {})