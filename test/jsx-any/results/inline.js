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
}
var $1293301303_LoginModal = {
  tag: 'div',
  child0: {
    tag: 'div',
    child0: {
      tag: 'div',
      child0: {
        type: 'ModalBg',
        resolveAttr: {
          $: 'img'
        }
      },
      resolveAttr: {
        style: {
          width: width + 'rem',
          height: height + 'rem',
          position: 'absolute'
        }
      }
    },
    child1: {
      tag: 'div',
      child0: {
        tag: 'div',
        child0: {
          tag: 'div',
          child0: {
            type: 'text',
            $: 'title',
            $transform: function ($val, props) {
              return props.compute()
            }
          },
          resolveAttr: {
            style: {
              paddingLeft: '15rem',
              display: 'table-cell',
              verticalAlign: 'middle',
              fontSize: '20rem',
              fontWeight: 100
            }
          }
        },
        child1: {
          tag: 'div',
          child0: {
            type: 'IconClose',
            resolveAttr: {
              $: 'root.modalColor'
            },
            on: {
              click: close
            }
          },
          resolveAttr: {
            style: {
              display: 'table-cell',
              width: navBarHeight,
              height: navBarHeight
            }
          }
        },
        resolveAttr: {
          style: {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed'
          }
        }
      },
      child1: {
        tag: 'fragment',
        $: '$any',
        props: {
          default: {
            type: 'Button'
          }
        }
      },
      resolveAttr: {
        style: {
          width: width + 'rem',
          height: height + 'rem',
          position: 'absolute',
          color: {
            $: 'root.modalColor',
            $transform: function ($val, props) {
              return props.compute()
            }
          }
        }
      }
    },
    resolveAttr: {
      style: style
    }
  },
  resolveAttr: {
    style: bg
  }
};
 })(window, {})