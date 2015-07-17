var Vector = require('./vector');

/**
 * Represent a transformation matrix with a 3x3 matrix for calculations
 * Matrix functions adapted from Louis Remi's jQuery.transform (https://github.com/louisremi/jquery.transform.js)
 * @param {Array|Number} a An array of six values representing a 2d transformation matrix
 */
function Matrix(a, b, c, d, e, f, g, h, i) {
  if (a.length) {
    this.elements = [
      +a[0], +a[2], +a[4],
      +a[1], +a[3], +a[5],
          0,     0,     1
    ];
  } else {
    this.elements = [
      +a, +b, +c,
      +d, +e, +f,
      +g || 0, +h || 0, +i || 1
    ];
  }
};

Matrix.prototype = {

  /**
   * Get the element at zero-indexed index i
   * @param {Number} i
   */
  e: function(i) {
    return this.elements[i];
  },

  /**
   * Multiply a 3x3 matrix by a similar matrix or a vector
   * @param {Matrix|Vector} matrix
   * @return {Matrix|Vector} Returns a vector if multiplying by a vector
   */
  x: function(matrix) {
    var isVector = matrix instanceof Vector;

    var a = this.elements,
      b = matrix.elements;

    if (isVector && b.length === 3) {
      // b is actually a vector
      return new Vector(
        a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
        a[3] * b[0] + a[4] * b[1] + a[5] * b[2],
        a[6] * b[0] + a[7] * b[1] + a[8] * b[2]
      );
    } else if (b.length === a.length) {
      // b is a 3x3 matrix
      return new Matrix(
        a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
        a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
        a[0] * b[2] + a[1] * b[5] + a[2] * b[8],

        a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
        a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
        a[3] * b[2] + a[4] * b[5] + a[5] * b[8],

        a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
        a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
        a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
      );
    }
    return false; // fail
  },
  /**
   * Generates an inverse of the current matrix
   * @returns {Matrix}
   */
  inverse: function() {
    var d = 1 / this.determinant(),
      a = this.elements;
    return new Matrix(
      d * ( a[8] * a[4] - a[7] * a[5]),
      d * (-(a[8] * a[1] - a[7] * a[2])),
      d * ( a[5] * a[1] - a[4] * a[2]),

      d * (-(a[8] * a[3] - a[6] * a[5])),
      d * ( a[8] * a[0] - a[6] * a[2]),
      d * (-(a[5] * a[0] - a[3] * a[2])),

      d * ( a[7] * a[3] - a[6] * a[4]),
      d * (-(a[7] * a[0] - a[6] * a[1])),
      d * ( a[4] * a[0] - a[3] * a[1])
    );
  },
  /**
   * Calculates the determinant of the current matrix
   * @returns {Number}
   */
  determinant: function() {
    var a = this.elements;
    return a[0] * (a[8] * a[4] - a[7] * a[5]) - a[3] * (a[8] * a[1] - a[7] * a[2]) + a[6] * (a[5] * a[1] - a[4] * a[2]);
  }
};


module.exports = Matrix;
