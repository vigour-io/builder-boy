const $1293301303_Div = {
  tag: 'div',
  $: 'list.$any',
  props: {
    default: {
      $switch: {
        val: (s) => {
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
            $transform: ($val, s) => {
              return s.compute()
            }
          }
        },
        child1: {
          tag: 'span',
          child0: {
            type: 'text',
            $: true,
            $transform: ($val, s) => {
              return s.compute()
            }
          }
        }
      }
    }
  }
}