var Pinch = require('../pinch');
var el = document.querySelector('.demo');
window.startDemo = function(options) {
  var pinch = new Pinch(el, options);
  return pinch;
};

