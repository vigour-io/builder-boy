(function (global, process) { 
var $2579574009_HorizontalListItem = {
  tag: 'div',
  'img': {
    tag: 'div',
    resolveAttr: {
      style: {
        height: '188rem',
        position: 'relative'
      },
      resize: {
        width: 250,
        height: 188
      }
    }
  },
  resolveAttr: {
    style: {
      display: 'inline-block',
      width: '250rem'
    }
  }
}
var $2579574009_HorizontalList = {
  tag: 'div',
  'title': {
    tag: 'div',
    child0: {
      type: 'text',
      $: 'title',
      $transform: function ($val, state) {
        return state.compute()
      }
    },
    resolveAttr: {
      style: {
        color: {
          $: 'style.titleColor',
          $transform: function ($val, state) {
            return state.compute()
          }
        },
        textOverflow: 'ellipsis',
        fontSize: '22rem',
        fontWeight: 500,
        marginBottom: '10rem'
      }
    }
  },
  'body': {
    tag: 'div',
    'items': {
      tag: 'div',
      $: 'items.$any',
      props: {
        default: {}
      },
      resolveAttr: {
        style: {
          whiteSpace: 'nowrap'
        }
      }
    },
    resolveAttr: {
      focusGroup: {
        scroll: 'x',
        $: 'items'
      },
      style: {
        position: 'relative',
        overflowX: 'auto',
        WebkitTransform: 'translateZ(0)'
      }
    }
  }
};
 })(window, {})