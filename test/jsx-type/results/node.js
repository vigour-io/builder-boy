const $2579574009_HorizontalListItem = {
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
const $2579574009_HorizontalList = {
  tag: 'div',
  'title': {
    tag: 'div',
    child0: {
      type: 'text',
      $: 'title',
      $transform: ($val, state) => {
        return state.compute()
      }
    },
    resolveAttr: {
      style: {
        color: {
          $: 'style.titleColor',
          $transform: ($val, state) => {
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
        default: {
          type: $2579574009_HorizontalListItem
        }
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
}