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

	/* WEBPACK VAR INJECTION */(function(global) {var Pinch = __webpack_require__(1);
	var Matrix = __webpack_require__(2);
	var Vector = __webpack_require__(3);
	var assert = __webpack_require__(4);

	function clone(obj) {
	  return JSON.parse(JSON.stringify(obj));
	}

	// TODO recreate every time
	var FAKE_EL = document.getElementById('fixture');

	var TEST_MATRIX = [ 1, 0, 0, 1, 0, 0 ];
	var DEFAULT_OPTIONS = {
	  eventNamespace: '.panzoom',
	  transition: true,
	  cursor: 'move',
	  disablePan: false,
	  disableZoom: false,
	  increment: 0.3,
	  minScale: 0.4,
	  maxScale: 5,
	  rangeStep: 0.05,
	  duration: 200,
	  easing: 'ease-in-out',
	  contain: false
	};

	function triggerEvent(el, eventString) {
	  var event = document.createEvent('HTMLEvents');
	  event.initEvent(eventString, true, true);
	  el.dispatchEvent(event);
	}

	describe('Pinch', function () {

	  describe('instantiated properties', function () {
	    var pinch = new Pinch(FAKE_EL);
	    console.log(pinch._transform);
	    it('this.panning = false', function () {
	      assert.equal(pinch.panning, false);
	    });
	    it('this.disabled = false', function () {
	      assert.equal(pinch.disabled, false);
	    });
	    it('should have all the zoom in/out range and reset buttons', function () {
	      ['$zoomIn', '$zoomOut', '$zoomRange', '$reset'].forEach(function (el) {
	        assert.ok(pinch[el] instanceof HTMLElement);
	      });
	    });
	  });

	  describe('this.options', function () {
	    it('should use default options if none are provided', function () {
	      var pinch = new Pinch(FAKE_EL);
	      assert.deepEqual(pinch.options, DEFAULT_OPTIONS);
	    });
	    it('should extend default options', function () {
	      var result = clone(DEFAULT_OPTIONS);
	      result.disablePan = true;
	      result.duration = 0;
	      var pinch = new Pinch(FAKE_EL, {disablePan: true, duration: 0});
	      assert.deepEqual(pinch.options, result);
	    });
	  });

	  describe('this.elem', function () {
	    it('should set this.elem to the elem reference', function () {
	      var pinch = new Pinch(FAKE_EL);
	      assert.equal(pinch.elem, FAKE_EL);
	    });
	  });

	  describe('this.doc', function () {
	    it('should set this.doc to the ownerDocument of the element', function () {
	      var pinch = new Pinch(FAKE_EL);
	      assert.equal(pinch.doc, FAKE_EL.ownerDocument);
	    });
	    it('should fall back to window.document', function () {
	      var pinch = new Pinch(FAKE_EL);
	      assert.equal(pinch.doc, global.document);
	    });
	  });

	  describe('this.parent', function () {
	    it('should return the parent of the element', function () {
	      var pinch = new Pinch(document.getElementById('fixture-2'));
	      assert.equal(pinch.parent, document.getElementById('fixture-2-parent'));
	    });
	  });

	  describe('matrixEquals', function () {
	    it('should return true for arrays with identical numbers', function () {
	      assert.equal(Pinch.matrixEquals(TEST_MATRIX, [1, 0, 0, 1, 0, 0]), true);
	    });
	    it('should return false for arrays with non-identical numbers', function () {
	      assert.equal(Pinch.matrixEquals(TEST_MATRIX, [1, 0, 0, 1, 0, 1]), false);
	    });
	  });

	  describe('createResetOptions', function () {
	    it('if argument is a boolean, should return an object with animate equal to that', function () {
	      assert.deepEqual(Pinch.createResetOptions(true), {range: true, animate: true});
	      assert.deepEqual(Pinch.createResetOptions(false), {range: true, animate: false});
	    });
	    it('if argument is an object, should extend default options with it', function () {
	      assert.deepEqual(Pinch.createResetOptions({foo: 'bar', range: false}), {foo: 'bar', range: false, animate: true});
	    });
	  });

	  describe('#isDisabled', function () {
	    it('should return this.isDisabled', function () {
	      var pinch = new Pinch(FAKE_EL);
	      pinch.disabled = true;
	      assert.equal(pinch.isDisabled(), true);
	    });
	  });

	  describe('#resetDimensions', function () {
	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);
	    pinch.resetDimensions();
	    it('should get the right dimensions', function () {
	      assert.deepEqual(pinch.dimensions, {
	        height: 100,
	        heightBorder: 30,
	        left: 70,
	        margin: {
	          left: 20,
	          top: 20
	        },
	        top: 50,
	        width: 50,
	        widthBorder: 30
	      });
	    });
	  });

	  describe('#setTransform', function () {
	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);
	    it('should set a transform on the element', function () {
	      pinch.setTransform('scale(3)');
	      assert.equal(getComputedStyle(el)[pinch._transform], 'matrix(3, 0, 0, 3, 0, 0)');
	      el.style[pinch._transform] = '';
	    });
	  });

	   describe('#getTransform', function () {
	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);
	    it('should get the current transform on the element', function () {
	      el.style[pinch._transform] = 'matrix(3, 0, 0, 3, 0, 0)';
	      assert.equal(pinch.getTransform(), 'matrix(3, 0, 0, 3, 0, 0)');
	    });
	    it('should set a given transform and return the transform as a matrix string', function () {
	      assert.equal(pinch.getTransform('scale(3)'), 'matrix(3, 0, 0, 3, 0, 0)');
	      el.style[pinch._transform] = '';
	    });
	    it('should return none for an empty or invalid transform', function () {
	      el.style[pinch._transform] = '';
	      assert.equal(pinch.getTransform(''), 'none');
	      assert.equal(pinch.getTransform('foo'), 'none');
	      el.style[pinch._transform] = '';
	    });
	  });

	   describe('#getMatrix', function () {
	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);
	    var x3 = 'matrix(3, 0, 0, 3, 0, 0)';

	    it('should return the current matrix', function () {
	      pinch.setTransform(x3);
	      assert.deepEqual(pinch.getMatrix(), [3, 0, 0, 3, 0, 0]);
	      el.style[pinch._transform] = '';
	    });

	    it('should return a default matrix ', function () {
	      assert.deepEqual(pinch.getMatrix(), [1, 0, 0, 1, 0, 0 ]);
	    });
	   });

	   describe('#setMatrix', function () {
	     //TODO
	   });

	   describe('#bind', function () {
	     // TODO
	   });

	   describe('#enable', function () {
	     // TODO
	   });

	   describe('#disable', function () {
	     // TODO
	   });

	   describe('#destroy', function () {
	     // TODO
	   });

	   describe('#pan', function () {
	     //TODO
	   });

	   describe('#isPanning', function () {
	     //TODO
	   });

	   describe('#zoom', function () {
	     //TODO
	   });

	   describe('#transition', function () {
	     //TODO
	   });

	   describe('#reset', function () {
	     // TODO
	   });

	   describe('#resetZoom', function () {
	     // TODO
	   });

	   describe('#_offset', function () {
	     // TODO
	   });

	   describe('#_documentScroll', function () {
	     // TODO
	   });

	   describe('#_moveStart', function () {
	     // TODO
	   });

	   describe('#_initStyle', function () {
	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);
	    it('should initialize styles', function () {
	      pinch._initStyle();
	      // TODO: make these tests use the right prefix
	      assert.equal(el.style.backfaceVisibility, 'hidden');
	      assert.equal(el.style.transformOrigin, '50% 50% 0px');
	      assert.equal(pinch.parent.style.position, '');
	      assert.equal(pinch.parent.style.overflow, 'hidden');
	    });
	    it('should set the style of a static parent to relative', function () {
	      var el = document.getElementById('fixture-2');
	      var pinch = new Pinch(el);
	      pinch._initStyle();
	      assert.equal(pinch.parent.style.overflow, 'hidden');
	      assert.equal(pinch.parent.style.position, 'relative');
	    });
	  });

	  describe('#_resetStyle', function () {
	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);
	    it('should reset styles', function () {
	      pinch._initStyle();
	      pinch._resetStyle();
	      assert.equal(el.style.cursor, '');
	      assert.equal(el.style.transition, '');
	      assert.equal(pinch.parent.style.overflow, '');
	      assert.equal(pinch.parent.style.position, '');
	    });
	  });

	  describe('#_buildTransform', function () {
	    //TODO
	  });

	  describe('#_buildTransition', function () {
	    //TODO
	  });

	  describe('#_checkDims', function () {
	    //TODO
	  });

	  describe('#_getDistance', function () {
	    //TODO
	  });

	  describe('#_getMiddle', function () {
	    //TODO
	  });

	  describe('#_trigger', function () {
	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);
	    it('should trigger a custom event', function (done) {
	      function onDone() {
	        done();
	        el.removeEventListener('panzoomfoo', onDone);
	      }
	      el.addEventListener('panzoomfoo', onDone);
	      pinch._trigger('foo');
	    });
	  });

	  describe('#_on', function () {
	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);
	    it('should add an event listener and register it', function (done) {
	      var testFn = function () {
	        var inArray = false;
	        pinch._registeredEvents.forEach(function (item) {
	          if (item.element === el && item.event === 'foo' && item.callback === testFn) {
	            inArray = true;
	          }
	        });
	        assert.ok(inArray);
	        done();
	      };
	      pinch._on(el, 'foo', testFn);
	      triggerEvent(el, 'foo');
	    });
	  });

	  describe('#_off', function () {

	    var el = document.getElementById('fixture');
	    var pinch = new Pinch(el);

	    afterEach(function () {
	      pinch._registeredEvents.forEach(function (item) {
	        item.element.removeEventListener(item.event, item.callback);
	      });
	      pinch._registeredEvents = [];
	    });

	    it('should remove all listeners if _off() is called with no arguments', function () {
	      var testFn = function () {
	        throw new Error('A listener was not removed');
	      };
	      pinch._on(el, 'foo', testFn);
	      pinch._on(el, 'bar', testFn);
	      pinch._on(el, 'baz', testFn);
	      pinch._off();
	      assert.equal(pinch._registeredEvents.length, 0);
	      triggerEvent(el, 'foo');
	      triggerEvent(el, 'bar');
	      triggerEvent(el, 'baz');
	    });

	    it('should remove all listeners for an element', function () {
	      var el = document.getElementById('fixture');
	      var el2 = document.getElementById('fixture-2');
	      var testFn = function () {
	        throw new Error('A listener was not removed');
	      };
	      var testFn2 = function () {
	      };
	      pinch._on(el, 'foo', testFn);
	      pinch._on(el, 'bar', testFn);
	      pinch._on(el2, 'baz', testFn2);
	      pinch._off(el);
	      assert.equal(pinch._registeredEvents.length, 1);
	      triggerEvent(el, 'foo');
	      triggerEvent(el, 'bar');
	      triggerEvent(el2, 'baz');
	    });

	    it('should remove all listeners for an element and event type', function () {
	      var el = document.getElementById('fixture');
	      var el2 = document.getElementById('fixture-2');
	      var testFn = function () {
	        throw new Error('A listener was not removed');
	      };
	      var testFn2 = function () {
	      };
	      pinch._on(el, 'foo', testFn);
	      pinch._on(el, 'bar', testFn2);
	      pinch._on(el2, 'foo', testFn2);
	      pinch._off(el, 'foo');
	      assert.equal(pinch._registeredEvents.length, 2);
	      triggerEvent(el, 'foo');
	      triggerEvent(el, 'bar');
	      triggerEvent(el2, 'foo');
	    });

	    it('should remove a specific event listener', function () {
	      var el = document.getElementById('fixture');
	      var el2 = document.getElementById('fixture-2');
	      var testFn = function () {
	        throw new Error('A listener was not removed');
	      };
	      var testFn2 = function () {
	      };
	      pinch._on(el, 'foo', testFn);
	      pinch._on(el, 'foo', testFn2);
	      pinch._on(el, 'bar', testFn2);

	      pinch._off(el, 'foo', testFn);

	      assert.equal(pinch._registeredEvents.length, 2);
	      triggerEvent(el, 'foo');
	      triggerEvent(el, 'bar');
	    });

	  });

	});

	describe('Vector', function () {
	  // TODO
	});

	describe('Matrix', function () {
	  it('should construct a matrix from multiple arguments', function () {
	    var matrix = new Matrix(1,2,3,4,5,6);
	    assert.deepEqual(matrix.elements, [1,2,3,4,5,6,0,0,1]);
	    var matrix2 = new Matrix(1,2,3,4,5,6,7,8,9);
	    assert(matrix2.elements, [1,2,3,4,5,6,7,8,9]);
	  });
	  it('should construct a matrix from an array and change the order', function () {
	    var matrix = new Matrix([1,2,3,4,5,6]);
	    assert.deepEqual(matrix.elements, [1,3,5,2,4,6,0,0,1]);
	  });
	  it('should convert stings to numbers', function () {
	    var matrix = new Matrix(['1','2','3','4','5','6']);
	    assert.deepEqual(matrix.elements, [1,3,5,2,4,6,0,0,1]);
	    var matrix2 = new Matrix('1','2','3','4','5','6','7','8','9');
	    assert(matrix2.elements, [1,2,3,4,5,6,7,8,9]);
	  });

	  // TODO: the instance methods
	});

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var extend = __webpack_require__(9);
	var getPrefix = __webpack_require__(10);
	var Matrix = __webpack_require__(2);

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

	  // Build the transition value
	  this._buildTransition();

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
	  if (options.animate !== 'skip') {
	    // Set transition
	    this.transition(!options.animate);
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
	 * Apply the current transition to the element, if allowed
	 * @param {Boolean} [off] Indicates that the transition should be turned off
	 */
	Panzoom.prototype.transition = function transition(off) {
	  if (!this._transition) { return; }
	  var transition = off || !this.options.transition ? 'none' : this._transition;
	  this.elem.style[this._cssPrefix + 'transition'] = transition;
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

	/**
	 * Undo any styles attached in this plugin
	 */
	Panzoom.prototype._resetStyle = function _resetStyle() {
	  this.elem.style.cursor = '';
	  this.elem.style.transition = '';
	  this.parent.style.overflow = '';
	  this.parent.style.position = '';
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
	 * Set transition property for later use when zooming
	 * If SVG, create necessary animations elements for translations and scaling
	 */
	Panzoom.prototype._buildTransition = function _buildTransition() {
	  if (this._transform) {
	    var options = this.options;
	    this._transition = this._transform + ' ' + options.duration + 'ms ' + options.easing;
	  }
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
	 * @returns {Object} Returns an object containing pageX and pageY
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
	 * @param {jQuery.Event} event An event with pageX, pageY, and possibly the touches list
	 * @param {TouchList} [touches] The touches list if present
	 */
	Panzoom.prototype._startMove = function _startMove(event, touches) {
	  var move, moveEvent, endEvent,
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
	  moveEvent += ns;
	  endEvent += ns;

	  // Remove any transitions happening
	  this.transition(true);

	  // Indicate that we are currently panning
	  this.panning = true;

	  // Trigger start event
	  this._trigger('start', event, touches);

	  if (touches && touches.length === 2) {
	    startDistance = this._getDistance(touches);
	    startScale = +matrix[0];
	    startMiddle = this._getMiddle(touches);
	    move = function(e) {
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
	    startPageX = event.pageX;
	    startPageY = event.pageY;

	    /**
	     * Mousemove/touchmove function to pan the element
	     * @param {Object} e Event object
	     */
	    move = function(e) {
	      e.preventDefault();
	      self.pan(
	        origPageX + e.pageX - startPageX,
	        origPageY + e.pageY - startPageY,
	        panOptions
	      );
	    };
	  }

	  function onEnd(e) {
	    e.preventDefault();
	    // Unbind all document events
	    self._off(this);
	    self.panning = false;
	    // Trigger our end event
	    // Simply set the type to "panzoomend" to pass through all end properties
	    // jQuery's `not` is used here to compare Array equality
	    e.type = 'panzoomend';
	    self._trigger(e, matrix, !matrixEquals(matrix, original));
	  }

	  // Bind the handlers
	  self._off(document);
	  self._on(document, moveEvent, move);
	  self._on(document, endEvent, onEnd);
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
	  var str_start = 'touchstart' + ns + ' mousedown' + ns;
	  var str_click = 'touchend' + ns + ' click' + ns;
	  var events = {};

	  // Bind panzoom events from options
	  ['Start', 'Change', 'Zoom', 'Pan', 'End', 'Reset'].forEach(function (event) {
	    var m = options[ 'on' + event ];
	    if (typeof m === 'function') {
	      events['panzoom' + this.toLowerCase() + ns] = m;
	    }
	  });

	  // Bind $elem drag and click/touchdown events
	  // Bind touchstart if either panning or zooming is enabled
	  if (!options.disablePan || !options.disableZoom) {
	    events[ str_start ] = function(e) {
	      var touches;
	      if (e.type === 'touchstart' ?
	        // Touch
	        (touches = e.touches) &&
	          ((touches.length === 1 && !options.disablePan) || touches.length === 2) :
	        // Mouse/Pointer: Ignore right click
	        !options.disablePan && e.which === 1) {

	        e.preventDefault();
	        e.stopPropagation();
	        self._startMove(e, touches);
	      }
	    };
	  }

	  Object.keys(events).forEach(function (event) {
	    self._on(this.elem, event, events[event]);
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
/***/ function(module, exports, __webpack_require__) {

	var Vector = __webpack_require__(3);

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
/* 3 */
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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Originally from narwhal.js (http://narwhaljs.org)
	// Copyright (c) 2009 Thomas Robinson <280north.com>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	// when used in node, this will actually load the util module we depend on
	// versus loading the builtin util module as happens otherwise
	// this is a bug in node module loading as far as I am concerned
	var util = __webpack_require__(5);

	var pSlice = Array.prototype.slice;
	var hasOwn = Object.prototype.hasOwnProperty;

	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	var assert = module.exports = ok;

	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })

	assert.AssertionError = function AssertionError(options) {
	  this.name = 'AssertionError';
	  this.actual = options.actual;
	  this.expected = options.expected;
	  this.operator = options.operator;
	  if (options.message) {
	    this.message = options.message;
	    this.generatedMessage = false;
	  } else {
	    this.message = getMessage(this);
	    this.generatedMessage = true;
	  }
	  var stackStartFunction = options.stackStartFunction || fail;

	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, stackStartFunction);
	  }
	  else {
	    // non v8 browsers so we can have a stacktrace
	    var err = new Error();
	    if (err.stack) {
	      var out = err.stack;

	      // try to strip useless frames
	      var fn_name = stackStartFunction.name;
	      var idx = out.indexOf('\n' + fn_name);
	      if (idx >= 0) {
	        // once we have located the function frame
	        // we need to strip out everything before it (and its line)
	        var next_line = out.indexOf('\n', idx + 1);
	        out = out.substring(next_line + 1);
	      }

	      this.stack = out;
	    }
	  }
	};

	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);

	function replacer(key, value) {
	  if (util.isUndefined(value)) {
	    return '' + value;
	  }
	  if (util.isNumber(value) && !isFinite(value)) {
	    return value.toString();
	  }
	  if (util.isFunction(value) || util.isRegExp(value)) {
	    return value.toString();
	  }
	  return value;
	}

	function truncate(s, n) {
	  if (util.isString(s)) {
	    return s.length < n ? s : s.slice(0, n);
	  } else {
	    return s;
	  }
	}

	function getMessage(self) {
	  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
	         self.operator + ' ' +
	         truncate(JSON.stringify(self.expected, replacer), 128);
	}

	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.

	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function fail(actual, expected, message, operator, stackStartFunction) {
	  throw new assert.AssertionError({
	    message: message,
	    actual: actual,
	    expected: expected,
	    operator: operator,
	    stackStartFunction: stackStartFunction
	  });
	}

	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;

	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.

	function ok(value, message) {
	  if (!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;

	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);

	assert.equal = function equal(actual, expected, message) {
	  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};

	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);

	assert.notEqual = function notEqual(actual, expected, message) {
	  if (actual == expected) {
	    fail(actual, expected, message, '!=', assert.notEqual);
	  }
	};

	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);

	assert.deepEqual = function deepEqual(actual, expected, message) {
	  if (!_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
	  }
	};

	function _deepEqual(actual, expected) {
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;

	  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
	    if (actual.length != expected.length) return false;

	    for (var i = 0; i < actual.length; i++) {
	      if (actual[i] !== expected[i]) return false;
	    }

	    return true;

	  // 7.2. If the expected value is a Date object, the actual value is
	  // equivalent if it is also a Date object that refers to the same time.
	  } else if (util.isDate(actual) && util.isDate(expected)) {
	    return actual.getTime() === expected.getTime();

	  // 7.3 If the expected value is a RegExp object, the actual value is
	  // equivalent if it is also a RegExp object with the same source and
	  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
	    return actual.source === expected.source &&
	           actual.global === expected.global &&
	           actual.multiline === expected.multiline &&
	           actual.lastIndex === expected.lastIndex &&
	           actual.ignoreCase === expected.ignoreCase;

	  // 7.4. Other pairs that do not both pass typeof value == 'object',
	  // equivalence is determined by ==.
	  } else if (!util.isObject(actual) && !util.isObject(expected)) {
	    return actual == expected;

	  // 7.5 For all other Object pairs, including Array objects, equivalence is
	  // determined by having the same number of owned properties (as verified
	  // with Object.prototype.hasOwnProperty.call), the same set of keys
	  // (although not necessarily the same order), equivalent values for every
	  // corresponding key, and an identical 'prototype' property. Note: this
	  // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected);
	  }
	}

	function isArguments(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	}

	function objEquiv(a, b) {
	  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
	    return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  // if one is a primitive, the other must be same
	  if (util.isPrimitive(a) || util.isPrimitive(b)) {
	    return a === b;
	  }
	  var aIsArgs = isArguments(a),
	      bIsArgs = isArguments(b);
	  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
	    return false;
	  if (aIsArgs) {
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return _deepEqual(a, b);
	  }
	  var ka = objectKeys(a),
	      kb = objectKeys(b),
	      key, i;
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length)
	    return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i])
	      return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!_deepEqual(a[key], b[key])) return false;
	  }
	  return true;
	}

	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);

	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	  if (_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
	  }
	};

	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);

	assert.strictEqual = function strictEqual(actual, expected, message) {
	  if (actual !== expected) {
	    fail(actual, expected, message, '===', assert.strictEqual);
	  }
	};

	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	  if (actual === expected) {
	    fail(actual, expected, message, '!==', assert.notStrictEqual);
	  }
	};

	function expectedException(actual, expected) {
	  if (!actual || !expected) {
	    return false;
	  }

	  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
	    return expected.test(actual);
	  } else if (actual instanceof expected) {
	    return true;
	  } else if (expected.call({}, actual) === true) {
	    return true;
	  }

	  return false;
	}

	function _throws(shouldThrow, block, expected, message) {
	  var actual;

	  if (util.isString(expected)) {
	    message = expected;
	    expected = null;
	  }

	  try {
	    block();
	  } catch (e) {
	    actual = e;
	  }

	  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
	            (message ? ' ' + message : '.');

	  if (shouldThrow && !actual) {
	    fail(actual, expected, 'Missing expected exception' + message);
	  }

	  if (!shouldThrow && expectedException(actual, expected)) {
	    fail(actual, expected, 'Got unwanted exception' + message);
	  }

	  if ((shouldThrow && actual && expected &&
	      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
	    throw actual;
	  }
	}

	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);

	assert.throws = function(block, /*optional*/error, /*optional*/message) {
	  _throws.apply(this, [true].concat(pSlice.call(arguments)));
	};

	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function(block, /*optional*/message) {
	  _throws.apply(this, [false].concat(pSlice.call(arguments)));
	};

	assert.ifError = function(err) { if (err) {throw err;}};

	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    if (hasOwn.call(obj, key)) keys.push(key);
	  }
	  return keys;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(7);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(8);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(6)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 9 */
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
/* 10 */
/***/ function(module, exports) {

	// from http://davidwalsh.name/vendor-prefix
	module.exports = function getPrefix() {
	  var styles = window.getComputedStyle(document.documentElement, '');
	  var pre = (Array.prototype.slice
	    .call(styles)
	    .join('')
	    .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
	  )[1];
	  if (Object.keys(styles).indexOf('transform') !== -1) {
	    return '';
	  } else if (pre) {
	    return '-' + pre + '-';
	  }
	};


/***/ }
/******/ ]);