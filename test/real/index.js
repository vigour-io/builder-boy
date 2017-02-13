'use strict';

if (!global.briskystamp) {
  'use strict';
  var exports$1 = {};
  const ts = exports$1.ts = 535673248076;
  var tsInProgress = false;
  var cnt = 0;
  var d;
  var on;

  global.briskystamp = exports$1;
  exports$1.inProgress = false;
  exports$1.offset = 0;

  const ms = () => {
    if (!tsInProgress) {
      cnt = 0;
      d = Date.now() - ts + exports$1.offset;
      tsInProgress = true;
      setTimeout(() => { tsInProgress = false; });
    } else {
      d += ++cnt / 9999;
    }
    return d
  };

  exports$1.create = override => override || ms();

  exports$1.on = fn => {
    if (!on) {
      on = [ fn ];
    } else {
      on.push(fn);
    }
  };

  exports$1.clear = () => { on = false; }; // rename this to stop

  exports$1.close = () => {
    if (on && !exports$1.inProgress) {
      exports$1.inProgress = true;
      for (let i = 0; i < on.length; i++) { on[i](); }
      exports$1.inProgress = on = false;
    }
  };

  exports$1.parse = stamp => {
    return stamp > 1e6 ? (stamp + ts) : stamp
  };
}

var index = global.briskystamp;

module.exports = index;
