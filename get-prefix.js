// from http://davidwalsh.name/vendor-prefix
module.exports = function getPrefix() {
  var styles = window.getComputedStyle(document.documentElement, '');
  var pre = (Array.prototype.slice
    .call(styles)
    .join('')
    .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
  )[1];
  return pre ? '-' + pre + '-' : '';
};
