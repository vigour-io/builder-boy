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
};
 })(window, {})