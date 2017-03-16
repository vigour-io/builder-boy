(function (global, process) { 
var $1293301303_Div = {
  tag: 'div',
  $: 'list.$any',
  props: {
    default: {
      $switch: {
        val: function (s) {
          return s.title ?
            "child0" :
            "child1"
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
          tag: 'span',
          child0: {
            type: 'text',
            $: true,
            $transform: function ($val, s) {
              return s.compute()
            }
          }
        }
      }
    }
  }
};
 })(window, {})