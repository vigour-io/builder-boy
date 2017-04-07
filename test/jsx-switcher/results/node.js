var $2131663140 = {
  tag: 'form',
  child0: {
    tag: 'div',
    $: 'items.$any',
    props: {
      default: {
        $switch: {
          val: (s) => {
            var $state0;
            return (($state0 = s.get(['type'])) && $state0.compute()) === 'Submit' ?
            "child0" :
            "child1"
          },
          type: {
            val: 'shallow'
          }
        },
        $: '$switch',
        props: {
          child0: {
            tag: 'input'
          },
          child1: {
            tag: 'div'
          }
        }
      }
    }
  }
}

module.exports = $2131663140