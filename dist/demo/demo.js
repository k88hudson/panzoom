var Pinch = require('../../panzoom');
var el = document.querySelector('.demo');
window.startDemo = function(options) {
  var pinch = new Pinch(el, options);
  return pinch;
};

