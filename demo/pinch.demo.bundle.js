/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Pinch = __webpack_require__(1);
	var el = document.querySelector('.demo');
	window.startDemo = function(options) {
	  var pinch = new Pinch(el, options);
	  return pinch;
	};



/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var extend = __webpack_require__(2);
	var getPrefix = __webpack_require__(3);
	var Matrix = __webpack_require__(4);
	var Vector = __webpack_require__(5);

	var DEFAULT_MATRIX = [ 1, 0, 0, 1, 0, 0 ];

	// Regex
	var FLOATING = '(\\-?[\\d\\.e]+)';
	var COMMA_SPACE = '\\,?\\s*';
	var R_MATRIX = new RegExp(
	  '^matrix\\(' +
	  FLOATING + COMMA_SPACE +
	  FLOATING + COMMA_SPACE +
	  FLOATING + COMMA_SPACE +
	  FLOATING + COMMA_SPACE +
	  FLOATING + COMMA_SPACE +
	  FLOATING + '\\)$'
	);
	var R_UPPER = /([A-Z])/g;
	var R_INLINE = /^inline/;

	function Panzoom(elem, options) {
	  var self = this;

	  this.options = options = extend({}, Panzoom.defaults, options);
	  this.elem = elem;
	  this.doc = elem.ownerDocument || global.document;
	  this.parent = elem.parentNode;
	  this.panning = false;
	  this.disabled = false;

	  // store events so we can unregister them as needed
	  this._registeredEvents = [];

	  // Save the original transform value
	  // Save the prefixed transform style key
	  // Set the starting transform
	  this._buildTransform();

	  this._cssPrefix = getPrefix();

	  // Build the appropriately-prefixed transform style property name
	  // De-camelcase
	  this._transform = this._cssPrefix + 'transform';

	  // Build containment dimensions
	  this.resetDimensions();

	  // Zoom in / out / ranges / reset button elements
	  ['$zoomIn', '$zoomOut', '$zoomRange', '$reset'].forEach(function(name) {
	    self[name] = options[name] || document.createElement('div');
	  });

	  this.enable();

	}

	Panzoom.rmatrix = R_MATRIX;

	Panzoom.defaults = {
	  // Should always be non-empty
	  // Used to bind jQuery events without collisions
	  // A guid is not added here as different instantiations/versions of panzoom
	  // on the same element is not supported, so don't do it.
	  eventNamespace: '.panzoom',

	  // Whether or not to transition the scale
	  transition: true,

	  // Default cursor style for the element
	  cursor: 'move',

	  // There may be some use cases for zooming without panning or vice versa
	  disablePan: false,
	  disableZoom: false,

	  // The increment at which to zoom
	  // adds/subtracts to the scale each time zoomIn/Out is called
	  increment: 0.3,

	  minScale: 0.4,
	  maxScale: 5,

	  // The default step for the range input
	  // Precendence: default < HTML attribute < option setting
	  rangeStep: 0.05,

	  // Animation duration (ms)
	  duration: 200,
	  // CSS easing used for scale transition
	  easing: 'ease-in-out',

	  // Indicate that the element should be contained within it's parent when panning
	  // Note: this does not affect zooming outside of the parent
	  // Set this value to 'invert' to only allow panning outside of the parent element (basically the opposite of the normal use of contain)
	  // 'invert' is useful for a large panzoom element where you don't want to show anything behind it
	  contain: false
	};

	/**
	 * Utility for determining transform matrix equality
	 * Checks backwards to test translation first
	 * @param {Array} first
	 * @param {Array} second
	 */
	Panzoom.matrixEquals = function matrixEquals(first, second) {
	  var i = first.length;
	  while(--i) {
	    if (+first[i] !== +second[i]) {
	      return false;
	    }
	  }
	  return true;
	};

	/**
	 * Creates the options object for reset functions
	 * @param {Boolean|Object} opts See reset methods
	 * @returns {Object} Returns the newly-created options object
	 */
	Panzoom.createResetOptions = function createResetOptions(opts) {
	  var options = {
	    range: true,
	    animate: true
	  };

	  if (typeof opts === 'boolean') {
	    options.animate = opts;
	  } else {
	    extend(options, opts);
	  }

	  return options;
	};


	/**
	 * @returns {Boolean} Returns whether the current panzoom instance is disabled
	 */
	Panzoom.prototype.isDisabled = function isDisabled() {
	  return this.disabled;
	};

	/**
	 * Helper utility to get the offset of an element
	 */
	Panzoom.prototype._offset = function _offset(element) {
	  return element.getBoundingClientRect();
	}

	/**
	 * Helper utility to get the document scroll top and left
	 * TODO: not sure if this is right
	 */
	Panzoom.prototype._documentScroll = function () {
	  return {
	    top: this.doc.body.scrollTop,
	    left: this.doc.body.scrollLeft
	  }
	}

	/**
	 * Builds the restricing dimensions from the containment element
	 * Also used with focal points
	 * Call this method whenever the dimensions of the element or parent are changed
	 */
	Panzoom.prototype.resetDimensions =  function resetDimensions() {
	  // Reset container properties
	  // TODO: test with window being parent, or is that needed?
	  this.container = {
	    width: this.parent.clientWidth || this.parent.innerWidth,
	    height: this.parent.clientHeight || this.parent.innerHeight
	  };
	  // TODO: This won't work for scrolled elements
	  var po = this._offset(this.parent);
	  var elem = this.elem;
	  var dims;

	  // TODO: This won't work for scrolled elements
	  var elBounding = elem.getBoundingClientRect();
	  var computedStyle = getComputedStyle(elem);

	  function getStyleInt(name) {
	    var value = computedStyle[name] || '';
	    value = value.replace('px', '');
	    return +value || 0;
	  }

	  dims = {
	    left: elBounding.left || 0,
	    top: elBounding.top || 0,
	    width: elem.clientWidth,
	    height: elem.clientHeight,
	    margin: {
	      top: getStyleInt('marginTop'),
	      left: getStyleInt('marginLeft')
	    }
	  };

	  dims.widthBorder = getStyleInt('borderLeftWidth') + getStyleInt('borderRightWidth');
	  dims.heightBorder = getStyleInt('borderTopWidth') + getStyleInt('borderBottomWidth');

	  this.dimensions = dims;
	};

	/**
	 * Sets a transform on the $set
	 * @param {String} transform
	 */
	Panzoom.prototype.setTransform = function setTransform(transform) {
	  this.elem.style[this._transform] = transform;
	};

	/**
	 * Retrieving the transform is different for SVG
	 *  (unless a style transform is already present)
	 * Uses the $set collection for retrieving the transform
	 * @param {String} [transform] Pass in an transform value (like 'scale(1.1)')
	 *  to have it formatted into matrix format for use by Panzoom
	 * @returns {String} Returns the current transform value of the element
	 */
	Panzoom.prototype.getTransform = function getTransform(transform) {
	  if (transform) {
	    this.setTransform(transform);
	  }
	  try {
	    transform = getComputedStyle(this.elem)[this._transform];
	  } catch (e) {
	    // can't do getComputedStyle on window or document
	  }

	  return transform || 'none';
	};

	/**
	 * Retrieve the current transform matrix for $elem (or turn a transform into it's array values)
	 * @param {String} [transform] matrix-formatted transform value
	 * @returns {Array} Returns the current transform matrix split up into it's parts, or a default matrix
	 */
	Panzoom.prototype.getMatrix = function getMatrix(transform) {
	  var matrix = Panzoom.rmatrix.exec(transform || this.getTransform());
	  if (matrix) {
	    matrix.shift();
	    matrix = matrix.map(function (n) { return +n });
	  }

	  return matrix || DEFAULT_MATRIX;
	};


	/**
	 * Given a matrix object, quickly set the current matrix of the element
	 * @param {Array|String} matrix
	 * @param {Boolean} [animate] Whether to animate the transform change
	 * @param {Object} [options]
	 * @param {Boolean|String} [options.animate] Whether to animate the transform change, or 'skip' indicating that it is unnecessary to set
	 * @param {Boolean} [options.contain] Override the global contain option
	 * @param {Boolean} [options.range] If true, $zoomRange's value will be updated.
	 * @param {Boolean} [options.silent] If true, the change event will not be triggered
	 * @returns {Array} Returns the newly-set matrix
	 */
	Panzoom.prototype.setMatrix = function setMatrix(matrix, options) {
	  if (this.disabled) { return; }
	  if (!options) { options = {}; }
	  // Convert to array
	  if (typeof matrix === 'string') {
	    matrix = this.getMatrix(matrix);
	  }
	  var dims, container, marginW, marginH, diffW, diffH, left, top, width, height;
	  var scale = +matrix[0];
	  var parent = this.parent;
	  var contain = typeof options.contain !== 'undefined' ? options.contain : this.options.contain;

	  // Apply containment
	  if (contain) {
	    dims = this._checkDims();
	    container = this.container;
	    width = dims.width + dims.widthBorder;
	    height = dims.height + dims.heightBorder;
	    // Use absolute value of scale here as negative scale doesn't mean even smaller
	    marginW = ((width * Math.abs(scale)) - container.width) / 2;
	    marginH = ((height * Math.abs(scale)) - container.height) / 2;
	    left = dims.left + dims.margin.left;
	    top = dims.top + dims.margin.top;

	    if (contain === 'invert') {
	      diffW = width > container.width ? width - container.width : 0;
	      diffH = height > container.height ? height - container.height : 0;
	      marginW += (container.width - width) / 2;
	      marginH += (container.height - height) / 2;
	      matrix[4] = Math.max(Math.min(matrix[4], marginW - left), -marginW - left - diffW);
	      matrix[5] = Math.max(Math.min(matrix[5], marginH - top), -marginH - top - diffH + dims.heightBorder);
	    } else {
	      // marginW += dims.widthBorder / 2;
	      marginH += dims.heightBorder / 2;
	      diffW = container.width > width ? container.width - width : 0;
	      diffH = container.height > height ? container.height - height : 0;

	      // If the element is not naturally centered, assume full margin right
	      // TODO: Add this back in, make sure we don't have perf issues
	      // if ($parent.css('textAlign') !== 'center' || !R_INLINE.test($.css(this.elem, 'display'))) {
	      if (true) {
	        marginW = marginH = 0;
	      } else {
	        diffW = 0;
	      }
	      matrix[4] = Math.min(
	        Math.max(matrix[4], marginW - left),
	        -marginW - left + diffW
	      );
	      matrix[5] = Math.min(
	        Math.max(matrix[5], marginH - top),
	        -marginH - top + diffH
	      );
	    }
	  }
	  if (options.animate === false) {
	    this.blockTransition();
	  }

	  // TODO: Update range
	  if (options.range) {
	    // this.$zoomRange.val(scale);
	  }

	  // Set the matrix on this.$set
	  this.setTransform('matrix(' + matrix.join(',') + ')');

	  if (!options.silent) {
	    this._trigger('change', matrix);
	  }

	  if (options.animate === false) {
	    var self = this;
	    // TODO: Better way to do this async?
	    setTimeout(function() {
	      self._resetTransition();
	    }, 10);
	  }

	  return matrix;
	};

	/**
	 * Pan the element to the specified translation X and Y
	 * Note: this is not the same as setting jQuery#offset() or jQuery#position()
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Object} [options] These options are passed along to setMatrix
	 * @param {Array} [options.matrix] The matrix being manipulated (if already known so it doesn't have to be retrieved again)
	 * @param {Boolean} [options.silent] Silence the pan event. Note that this will also silence the setMatrix change event.
	 * @param {Boolean} [options.relative] Make the x and y values relative to the existing matrix
	 */
	Panzoom.prototype.pan = function pan(x, y, options) {
	  if (this.options.disablePan) { return; }
	  if (!options) { options = {}; }
	  var matrix = options.matrix;
	  if (!matrix) {
	    matrix = this.getMatrix();
	  }
	  // Cast existing matrix values to numbers
	  if (options.relative) {
	    x += +matrix[4];
	    y += +matrix[5];
	  }
	  matrix[4] = x;
	  matrix[5] = y;
	  this.setMatrix(matrix, options);
	  if (!options.silent) {
	    this._trigger('pan', matrix[4], matrix[5]);
	  }
	};

	/**
	 * Only reset panning
	 * @param {Boolean|Object} [options] Whether to animate the reset (default: true) or an object of options to pass to pan()
	 */
	Panzoom.prototype.resetPan = function resetPan(options) {
	  var origMatrix = this.getMatrix(this._origTransform);
	  return this.pan(origMatrix[4], origMatrix[5], Panzoom.createResetOptions(options));
	};

	/**
	 * @returns {Boolean} Returns whether the panzoom element is currently being dragged
	 */
	Panzoom.prototype.isPanning = function isPanning() {
	  return this.panning;
	};

	/**
	 * Zoom in/out the element using the scale properties of a transform matrix
	 * @param {Number|Boolean} [scale] The scale to which to zoom or a boolean indicating to transition a zoom out
	 * @param {Object} [opts] All global options can be overwritten by this options object. For example, override the default increment.
	 * @param {Boolean} [opts.noSetRange] Specify that the method should not set the $zoomRange value (as is the case when $zoomRange is calling zoom on change)
	 * @param {jQuery.Event|Object} [opts.focal] A focal point on the panzoom element on which to zoom.
	 *  If an object, set the clientX and clientY properties to the position relative to the parent
	 * @param {Boolean} [opts.animate] Whether to animate the zoom (defaults to true if scale is not a number, false otherwise)
	 * @param {Boolean} [opts.silent] Silence the zoom event
	 * @param {Array} [opts.matrix] Optionally pass the current matrix so it doesn't need to be retrieved
	 * @param {Number} [opts.dValue] Think of a transform matrix as four values a, b, c, d
	 *  where a/d are the horizontal/vertical scale values and b/c are the skew values
	 *  (5 and 6 of matrix array are the tx/ty transform values).
	 *  Normally, the scale is set to both the a and d values of the matrix.
	 *  This option allows you to specify a different d value for the zoom.
	 *  For instance, to flip vertically, you could set -1 as the dValue.
	 */
	Panzoom.prototype.zoom = function zoom(scale, opts) {
	  // Shuffle arguments
	  if (typeof scale === 'object') {
	    opts = scale;
	    scale = null;
	  } else if (!opts) {
	    opts = {};
	  }
	  var options = extend({}, this.options, opts);
	  // Check if disabled
	  if (options.disableZoom) { return; }
	  var animate = false;
	  var matrix = options.matrix || this.getMatrix();
	  var documentScroll = this._documentScroll();

	  // Calculate zoom based on increment
	  if (typeof scale !== 'number') {
	    scale = +matrix[0] + (options.increment * (scale ? -1 : 1));
	    animate = true;
	  }

	  // Constrain scale
	  if (scale > options.maxScale) {
	    scale = options.maxScale;
	  } else if (scale < options.minScale) {
	    scale = options.minScale;
	  }

	  // Calculate focal point based on scale
	  var focal = options.focal;
	  if (focal && !options.disablePan) {
	    // Adapted from code by Florian Günther
	    // https://github.com/florianguenther/zui53
	    var dims = this._checkDims();
	    var clientX = focal.clientX;
	    var clientY = focal.clientY;
	    // Adjust the focal point for default transform-origin => 50% 50%
	    clientX -= (dims.width + dims.widthBorder) / 2;
	    clientY -= (dims.height + dims.heightBorder) / 2;

	    var clientV = new Vector(clientX, clientY, 1);
	    var surfaceM = new Matrix(matrix);
	    // Supply an offset manually if necessary
	    var o = this.parentOffset || this._offset(this.parent);
	    var offsetM = new Matrix(1, 0, o.left - documentScroll.left, 0, 1, o.top - documentScroll.top);
	    var surfaceV = surfaceM.inverse().x(offsetM.inverse().x(clientV));
	    var scaleBy = scale / matrix[0];
	    surfaceM = surfaceM.x(new Matrix([ scaleBy, 0, 0, scaleBy, 0, 0 ]));
	    clientV = offsetM.x(surfaceM.x(surfaceV));
	    matrix[4] = +matrix[4] + (clientX - clientV.e(0));
	    matrix[5] = +matrix[5] + (clientY - clientV.e(1));
	  }

	  // Set the scale
	  matrix[0] = scale;
	  matrix[3] = typeof options.dValue === 'number' ? options.dValue : scale;

	  // Calling zoom may still pan the element
	  this.setMatrix(matrix, {
	    animate: typeof options.animate === 'boolean' ? options.animate : animate,
	    // Set the zoomRange value
	    range: !options.noSetRange
	  });

	  // Trigger zoom event
	  if (!options.silent) {
	    this._trigger('zoom', matrix[0], options);
	  }
	};

	/**
	 * Block any transition css property temporarily
	 */
	Panzoom.prototype.blockTransition = function removeTransition() {
	  this.elem.style[this._cssPrefix + 'transition'] = 'none';
	};

	/**
	 * Initialize base styles for the element and its parent
	 */
	Panzoom.prototype._initStyle = function _initStyle() {

	  // Promote the element to it's own compositor layer
	  this.elem.style[this._cssPrefix + 'backface-visibility'] = 'hidden';
	  this.elem.style[this._cssPrefix + 'transform-origin'] = '50% 50%';

	  // Set elem styles
	  if (!this.options.disablePan) {
	    this.elem.style.cursor = this.options.cursor;
	  }

	  // No need to add styles to the body
	  if (this.parent.nodeName === 'BODY') {
	    return;
	  }

	  this.parent.style.overflow = 'hidden';

	  // Check if parent is static
	  var position = getComputedStyle(this.parent).position;
	  if (position === 'static') {
	    this.parent.style.position = 'relative';
	  }

	};

	Panzoom.prototype._resetTransition = function _resetTransition() {
	  this.elem.style.transition = '';
	  this.elem.style[self._cssPrefix + 'transition'] = '';
	};

	/**
	 * Undo any styles attached in this plugin
	 */
	Panzoom.prototype._resetStyle = function _resetStyle() {
	  this.elem.style.cursor = '';
	  this.parent.style.overflow = '';
	  this.parent.style.position = '';
	  this._resetTransition();
	};

	/**
	 * Builds the original transform value
	 */
	Panzoom.prototype._buildTransform = function _buildTransform() {
	  // Save the original transform
	  this._origTransform = this.getTransform(this.options.startTransform);
	  return this._origTransform;
	};

	/**
	 * Checks dimensions to make sure they don't need to be re-calculated
	 */
	Panzoom.prototype._checkDims = function _checkDims() {
	  var dims = this.dimensions;
	  // Rebuild if width or height is still 0
	  if (!dims.width || !dims.height) {
	    this.resetDimensions();
	  }
	  return this.dimensions;
	};

	/**
	 * Calculates the distance between two touch points
	 * Remember pythagorean?
	 * @param {Array} touches
	 * @returns {Number} Returns the distance
	 */
	Panzoom.prototype._getDistance = function _getDistance(touches) {
	  var touch1 = touches[0];
	  var touch2 = touches[1];
	  return Math.sqrt(Math.pow(Math.abs(touch2.clientX - touch1.clientX), 2) + Math.pow(Math.abs(touch2.clientY - touch1.clientY), 2));
	};

	/**
	 * Constructs an approximated point in the middle of two touch points
	 * @returns {Object} Returns an object containing clientX and clientY
	 */
	Panzoom.prototype._getMiddle = function _getMiddle(touches) {
	  var touch1 = touches[0];
	  var touch2 = touches[1];
	  return {
	    clientX: ((touch2.clientX - touch1.clientX) / 2) + touch1.clientX,
	    clientY: ((touch2.clientY - touch1.clientY) / 2) + touch1.clientY
	  };
	};

	/**
	 * Starts the pan
	 * This is bound to mouse/touchmove on the element
	 * @param {jQuery.Event} event An event with clientX, clientY, and possibly the touches list
	 * @param {TouchList} [touches] The touches list if present
	 */
	Panzoom.prototype._startMove = function _startMove(event, touches) {
	  var onMove, moveEvent, endEvent,
	    startDistance, startScale, startMiddle,
	    startPageX, startPageY;
	  var self = this;
	  var options = this.options;
	  var ns = options.eventNamespace;
	  var matrix = this.getMatrix();
	  var original = matrix.slice(0);
	  var origPageX = +original[4];
	  var origPageY = +original[5];
	  var panOptions = { matrix: matrix, animate: 'skip' };

	  // Use proper events
	  if (event.type === 'touchstart') {
	    moveEvent = 'touchmove';
	    endEvent = 'touchend';
	  } else {
	    moveEvent = 'mousemove';
	    endEvent = 'mouseup';
	  }

	  // Add namespace
	  // moveEvent += ns;
	  // endEvent += ns;

	  // Remove any transitions happening
	  this.blockTransition();

	  // Indicate that we are currently panning
	  this.panning = true;

	  // Trigger start event
	  this._trigger('start', event, touches);

	  if (touches && touches.length === 2) {
	    startDistance = this._getDistance(touches);
	    startScale = +matrix[0];
	    startMiddle = this._getMiddle(touches);
	    onMove = function(e) {
	      e.preventDefault();

	      // Calculate move on middle point
	      var middle = self._getMiddle(touches = e.touches);
	      var diff = self._getDistance(touches) - startDistance;

	      // Set zoom
	      self.zoom(diff * (options.increment / 100) + startScale, {
	        focal: middle,
	        matrix: matrix,
	        animate: false
	      });

	      // Set pan
	      self.pan(
	        +matrix[4] + middle.clientX - startMiddle.clientX,
	        +matrix[5] + middle.clientY - startMiddle.clientY,
	        panOptions
	      );
	      startMiddle = middle;
	    };
	  } else {
	    startPageX = event.pageX || event.touches[0].pageX;
	    startPageY = event.pageY || event.touches[0].pageY;

	    /**
	     * Mousemove/touchmove function to pan the element
	     * @param {Object} e Event object
	     */
	    onMove = function(e) {
	      e.preventDefault();
	      self.pan(
	        origPageX + (e.pageX || e.touches[0].pageX) - startPageX,
	        origPageY + (e.pageY || e.touches[0].pageY) - startPageY,
	        panOptions
	      );
	    };
	  }

	  function onEnd(e) {
	    // Unbind all document events
	    self._off(this);
	    self.panning = false;
	    // Trigger our end event
	    // Simply set the type to "panzoomend" to pass through all end properties
	    // jQuery's `not` is used here to compare Array equality

	    self._resetTransition();

	    // TODO: couldn't dispatch the real event
	    // this is causing a problem with double events firing
	    self._trigger('end', e, matrix, !Panzoom.matrixEquals(matrix, original));
	  }

	  // Bind the handlers
	  self._off(window);
	  self._on(window, moveEvent, onMove);
	  self._on(window, endEvent, onEnd);
	};

	/**
	 * Return the element to it's original transform matrix
	 * @param {Boolean} [options] If a boolean is passed, animate the reset (default: true). If an options object is passed, simply pass that along to setMatrix.
	 * @param {Boolean} [options.silent] Silence the reset event
	 */
	Panzoom.prototype.reset = function reset(options) {
	  options = Panzoom.createResetOptions(options);
	  // Reset the transform to its original value
	  var matrix = this.setMatrix(this._origTransform, options);
	  if (!options.silent) {
	    this._trigger('reset', matrix);
	  }
	};

	/**
	 * Only resets zoom level
	 * @param {Boolean|Object} [options] Whether to animate the reset (default: true) or an object of options to pass to zoom()
	 */
	Panzoom.prototype.resetZoom = function resetZoom(options) {
	  options = Panzoom.createResetOptions(options);
	  var origMatrix = this.getMatrix(this._origTransform);
	  options.dValue = origMatrix[ 3 ];
	  this.zoom(origMatrix[0], options);
	};


	/**
	 * Enable or re-enable the panzoom instance
	 */
	Panzoom.prototype.enable = function enable() {
	  // Unbind first
	  this._initStyle();
	  this._bind();
	  this.disabled = false;
	};

	/**
	 * Disable panzoom
	 */
	Panzoom.prototype.disable = function disable() {
	  this.disabled = true;
	  this._resetStyle();
	  this._unbind();
	};

	/**
	 * Destroy the panzoom instance
	 */
	Panzoom.prototype.destroy = function destroy() {
	  this.disable();
	  //$.removeData(this.elem, datakey);
	};

	/**
	 * Unbind all events
	 */
	Panzoom.prototype._unbind = function _unbind() {
	  this._off();
	};


	/**
	 * Binds all necessary events
	 */
	Panzoom.prototype._bind = function bind() {
	  var self = this;
	  var options = this.options;
	  var ns = options.eventNamespace;
	  var events = {};
	  // TODO: figure out this namespace stuff
	  // var str_click = 'touchend' + ns + ' click' + ns;

	  // Bind panzoom events from options
	  ['Start', 'Change', 'Zoom', 'Pan', 'End', 'Reset'].forEach(function (event) {
	    var m = options[ 'on' + event ];
	    if (typeof m === 'function') {
	      events['panzoom' + event.toLowerCase()] = m;
	    }
	  });

	  function onStart(e) {
	    var touches;
	    if (e.type === 'touchstart' ?
	      // Touch
	      (touches = e.touches) &&
	        ((touches.length === 1 && !options.disablePan) || touches.length === 2) :
	      // Mouse/Pointer: Ignore right click
	      !options.disablePan && e.which === 1) {

	      self._startMove(e, touches);
	    }
	  }

	  // Bind $elem drag and click/touchdown events
	  // Bind touchstart if either panning or zooming is enabled
	  if (!options.disablePan || !options.disableZoom) {
	    events['touchstart'] = onStart;
	    events['mousedown'] = onStart;
	  }

	  Object.keys(events).forEach(function (event) {
	    self._on(self.elem, event, events[event]);
	  });

	  // TODO: CONTROLS
	  //
	  //  var $reset = this.$reset;
	  //  var $zoomRange = this.$zoomRange;
	  //
	  // // Bind reset
	  // if ($reset.length) {
	  //   $reset.on(str_click, function(e) {
	  //     e.preventDefault();
	  //     self.reset();
	  //   });
	  // }

	  // // Set default attributes for the range input
	  // if ($zoomRange.length) {
	  //   $zoomRange.attr({
	  //     // Only set the range step if explicit or
	  //     // set the default if there is no attribute present
	  //     step: options.rangeStep === Panzoom.defaults.rangeStep &&
	  //       $zoomRange.attr('step') ||
	  //       options.rangeStep,
	  //     min: options.minScale,
	  //     max: options.maxScale
	  //   }).prop({
	  //     value: this.getMatrix()[0]
	  //   });
	  // }

	  // No bindings if zooming is disabled
	  if (options.disableZoom) {
	    return;
	  }

	  // TODO: Controls
	  //
	  // var $zoomIn = this.$zoomIn;
	  // var $zoomOut = this.$zoomOut;

	  // // Bind zoom in/out
	  // // Don't bind one without the other
	  // if ($zoomIn.length && $zoomOut.length) {
	  //   // preventDefault cancels future mouse events on touch events
	  //   $zoomIn.on(str_click, function(e) {
	  //     e.preventDefault();
	  //     self.zoom();
	  //   });
	  //   $zoomOut.on(str_click, function(e) {
	  //     e.preventDefault();
	  //     self.zoom(true);
	  //   });
	  // }

	  // if ($zoomRange.length) {
	  //   events = {};
	  //   // Cannot prevent default action here, just use pointerdown/mousedown
	  //   events[ (pointerEvents ? 'pointerdown' : 'mousedown') + ns ] = function() {
	  //     self.transition(true);
	  //   };
	  //   // Zoom on input events if available and change events
	  //   // See https://github.com/timmywil/jquery.panzoom/issues/90
	  //   events[ (supportsInputEvent ? 'input' : 'change') + ns ] = function() {
	  //     self.zoom(+this.value, { noSetRange: true });
	  //   };
	  //   $zoomRange.on(events);
	  // }
	};

	/**
	 * Trigger a panzoom event on our element
	 * The event is passed the Panzoom instance
	 * @param {String|Event} event
	 * @param {Mixed} arg1[, arg2, arg3, ...] Arguments to append to the trigger
	 */
	Panzoom.prototype._trigger = function (event) {
	  if (typeof event === 'string') {
	    var eventString = event;
	    event = document.createEvent('HTMLEvents');
	    event.initEvent('panzoom' + eventString, true, true);
	  }
	  this.elem.dispatchEvent(event, [this].concat(Array.prototype.slice.call(arguments, 1)));
	};

	/**
	 * Custom function to add and register event listeners
	 * element
	 * event
	 * callback
	 */
	Panzoom.prototype._on = function (element, event, callback) {
	  var registeredEvents = this._registeredEvents;

	  // TODO: throw?
	  if (!element || !event || !callback) return;
	  registeredEvents.push({
	    element: element,
	    event: event,
	    callback: callback
	  });

	  element.addEventListener(event, callback);
	};

	/**
	 * Custom function to remove listeners based on element, event, and callback
	 * If no arguments are provided, all event listeners will be removed
	 * element
	 * event
	 * callback
	 */
	Panzoom.prototype._off = function (element, event, callback) {
	  this._registeredEvents = this._registeredEvents.filter(function (item, i) {
	    var shouldRemove = false;
	    if (!element && !event && !callback) {
	      shouldRemove = true;
	    } else if (item.element === element && !event && !callback) {
	      shouldRemove = true
	    } else if (item.element === element && item.event === event && !callback) {
	      shouldRemove = true
	    } else if (item.element === element && item.event === event && item.callback === callback) {
	      shouldRemove = true;
	    }
	    if (shouldRemove) {
	      item.element.removeEventListener(item.event, item.callback);
	      return false;
	    } else {
	      return true;
	    }
	  });
	};


	module.exports = Panzoom;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;

	var isArray = function isArray(arr) {
		if (typeof Array.isArray === 'function') {
			return Array.isArray(arr);
		}

		return toStr.call(arr) === '[object Array]';
	};

	var isPlainObject = function isPlainObject(obj) {
		if (!obj || toStr.call(obj) !== '[object Object]') {
			return false;
		}

		var hasOwnConstructor = hasOwn.call(obj, 'constructor');
		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
		// Not own constructor property must be Object
		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		var key;
		for (key in obj) {/**/}

		return typeof key === 'undefined' || hasOwn.call(obj, key);
	};

	module.exports = function extend() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0],
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if (typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
			target = {};
		}

		for (; i < length; ++i) {
			options = arguments[i];
			// Only deal with non-null/undefined values
			if (options != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target !== copy) {
						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];
							} else {
								clone = src && isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = extend(deep, clone, copy);

						// Don't bring in undefined values
						} else if (typeof copy !== 'undefined') {
							target[name] = copy;
						}
					}
				}
			}
		}

		// Return the modified object
		return target;
	};



/***/ },
/* 3 */
/***/ function(module, exports) {

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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Vector = __webpack_require__(5);

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


/***/ },
/* 5 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);