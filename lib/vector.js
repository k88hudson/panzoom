/**
 * Create a vector containing three values
 */
function Vector(x, y, z) {
  this.elements = [ x, y, z ];
}

  /**
 * Get the element at zero-indexed index i
 * @param {Number} i
 */
Vector.prototype.e = function(i) {
  return this.elements[i];
};

module.exports = Vector;
