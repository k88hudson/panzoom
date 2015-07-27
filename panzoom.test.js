var Panzoom = require('./panzoom');
var Matrix = require('./lib/matrix');
var Vector = require('./lib/vector');
var assert = require('assert');

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

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

var el;
var panzoom

function setup() {
  el = document.getElementById('fixture');
  panzoom = new Panzoom(el);
}

function tearDown() {
  var el = document.getElementById('fixture');
  var newEl = document.createElement('div');
  newEl.id = 'fixture';
  el.parentNode.replaceChild(newEl, el);

  if (panzoom) panzoom.destroy();
  panzoom = null;
  el = null;
}

describe('Panzoom', function () {

  beforeEach(setup);
  afterEach(tearDown);

  describe('instantiated properties', function () {
    it('this.panning = false', function () {
      assert.equal(panzoom.panning, false);
    });
    it('this.disabled = false', function () {
      assert.equal(panzoom.disabled, false);
    });
    it('should have all the zoom in/out range and reset buttons', function () {
      ['$zoomIn', '$zoomOut', '$zoomRange', '$reset'].forEach(function (el) {
        assert.ok(panzoom[el] instanceof HTMLElement);
      });
    });
  });

  describe('this.options', function () {
    it('should use default options if none are provided', function () {
      assert.deepEqual(panzoom.options, DEFAULT_OPTIONS);
    });
    it('should extend default options', function () {
      var result = clone(DEFAULT_OPTIONS);
      result.disablePan = true;
      result.duration = 0;
      var pz = new Panzoom(el, {disablePan: true, duration: 0});
      assert.deepEqual(pz.options, result);
    });
  });

  describe('this.elem', function () {
    it('should set this.elem to the elem reference', function () {
      assert.equal(panzoom.elem, el);
    });
  });

  describe('this.doc', function () {
    it('should set this.doc to the ownerDocument of the element', function () {
      assert.equal(panzoom.doc, el.ownerDocument);
    });
    it('should fall back to window.document', function () {
      assert.equal(panzoom.doc, global.document);
    });
  });

  describe('this.parent', function () {
    it('should return the parent of the element', function () {
      var pz = new Panzoom(document.getElementById('fixture-2'));
      assert.equal(pz.parent, document.getElementById('fixture-2-parent'));
    });
  });

  describe('matrixEquals', function () {
    it('should return true for arrays with identical numbers', function () {
      assert.equal(Panzoom.matrixEquals(TEST_MATRIX, [1, 0, 0, 1, 0, 0]), true);
    });
    it('should return false for arrays with non-identical numbers', function () {
      assert.equal(Panzoom.matrixEquals(TEST_MATRIX, [1, 0, 0, 1, 0, 1]), false);
    });
  });

  describe('createResetOptions', function () {
    it('if argument is a boolean, should return an object with animate equal to that', function () {
      assert.deepEqual(Panzoom.createResetOptions(true), {range: true, animate: true});
      assert.deepEqual(Panzoom.createResetOptions(false), {range: true, animate: false});
    });
    it('if argument is an object, should extend default options with it', function () {
      assert.deepEqual(Panzoom.createResetOptions({foo: 'bar', range: false}), {foo: 'bar', range: false, animate: true});
    });
  });

  describe('#isDisabled', function () {
    it('should return this.isDisabled', function () {
      panzoom.disabled = true;
      assert.equal(panzoom.isDisabled(), true);
    });
  });

  describe('#resetDimensions', function () {
    it('should not throw', function () {
      panzoom.resetDimensions();
    });

    it('should get the right dimensions', function () {
      assert.deepEqual(panzoom.dimensions, {
        left: 70,
        top: 50,
        width: 20,
        height: 70,
        widthBorder: 30,
        heightBorder: 30,
        margin: {
          left: 20,
          top: 20
        }
      });
    });
  });

  describe('#setTransform', function () {
    it('should set a transform on the element', function () {
      panzoom.setTransform('scale(3)');
      assert.equal(getComputedStyle(el)[panzoom._transform], 'matrix(3, 0, 0, 3, 0, 0)');
      el.style[panzoom._transform] = '';
    });
  });

  describe('#getTransform', function () {
    it('should get the current transform on the element', function () {
      el.style[panzoom._transform] = 'matrix(3, 0, 0, 3, 0, 0)';
      assert.equal(panzoom.getTransform(), 'matrix(3, 0, 0, 3, 0, 0)');
    });
    it('should set a given transform and return the transform as a matrix string', function () {
      assert.equal(panzoom.getTransform('scale(3)'), 'matrix(3, 0, 0, 3, 0, 0)');
      el.style[panzoom._transform] = '';
    });
    it('should return none for an empty or invalid transform', function () {
      el.style[panzoom._transform] = '';
      assert.equal(panzoom.getTransform(''), 'none');
      assert.equal(panzoom.getTransform('foo'), 'none');
      el.style[panzoom._transform] = '';
    });
  });

  describe('#getMatrix', function () {
    var x3 = 'matrix(3, 0, 0, 3, 0, 0)';

    it('should return the current matrix', function () {
      panzoom.setTransform(x3);
      assert.deepEqual(panzoom.getMatrix(), [3, 0, 0, 3, 0, 0]);
      el.style[panzoom._transform] = '';
    });

    it('should return a default matrix ', function () {
      assert.deepEqual(panzoom.getMatrix(), [1, 0, 0, 1, 0, 0 ]);
    });
  });

  describe('#setMatrix', function () {
    it('should set a given matrix on the element', function () {
      panzoom.setMatrix([2, 0, 0, 2, 10, 10]);
      assert.equal(el.style[panzoom._transform], 'matrix(2, 0, 0, 2, 10, 10)');
    });
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
    it('should initialize styles', function () {
      panzoom._initStyle();
      // TODO: make these tests use the right prefix
      assert.equal(el.style.webkitBackfaceVisibility, 'hidden');
      assert.ok(el.style.webkitTransformOrigin.indexOf('50% 50%') > -1);
      assert.equal(panzoom.parent.style.position, '');
      assert.equal(panzoom.parent.style.overflow, 'hidden');
    });
    it('should set the style of a static parent to relative', function () {
      var pz = new Panzoom(document.getElementById('fixture-2'));
      pz._initStyle();
      assert.equal(pz.parent.style.overflow, 'hidden');
      assert.equal(pz.parent.style.position, 'relative');
    });
  });

  describe('#_resetStyle', function () {
    it('should reset styles', function () {
      panzoom._initStyle();
      panzoom._resetStyle();
      assert.equal(el.style.cursor, '');
      assert.equal(el.style.transition, '');
      assert.equal(el.style.webkitTransition, '');
      assert.equal(panzoom.parent.style.overflow, '');
      assert.equal(panzoom.parent.style.position, '');
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
    it('should trigger a custom event', function (done) {
      function onDone() {
        done();
        el.removeEventListener('panzoomfoo', onDone);
      }
      el.addEventListener('panzoomfoo', onDone);
      panzoom._trigger('foo');
    });
  });

  describe('#_on', function () {
    it('should add an event listener and register it', function () {
      var testFn = function () {
        var inArray = false;
        panzoom._registeredEvents.forEach(function (item) {
          if (item.element === el && item.event === 'foo' && item.callback === testFn) {
            inArray = true;
          }
        });
        assert.ok(inArray);
      };
      panzoom._on(el, 'foo', testFn);
      triggerEvent(el, 'foo');
    });
  });

  describe('#_off', function () {

    beforeEach(function () {
      panzoom._registeredEvents = [];
    });

    it('should remove all listeners if _off() is called with no arguments', function () {
      var testFn = function () {
        throw new Error('A listener was not removed');
      };
      panzoom._on(el, 'foo', testFn);
      panzoom._on(el, 'bar', testFn);
      panzoom._on(el, 'baz', testFn);
      panzoom._off();
      assert.equal(panzoom._registeredEvents.length, 0);
      triggerEvent(el, 'foo');
      triggerEvent(el, 'bar');
      triggerEvent(el, 'baz');
    });

    it('should remove all listeners for an element', function () {
      var el2 = document.getElementById('fixture-2');
      var testFn = function () {
        throw new Error('A listener was not removed');
      };
      var testFn2 = function () {
      };
      panzoom._on(el, 'foo', testFn);
      panzoom._on(el, 'bar', testFn);
      panzoom._on(el2, 'baz', testFn2);
      panzoom._off(el);
      assert.equal(panzoom._registeredEvents.length, 1);
      triggerEvent(el, 'foo');
      triggerEvent(el, 'bar');
      triggerEvent(el2, 'baz');
    });

    it('should remove all listeners for an element and event type', function () {
      var el2 = document.getElementById('fixture-2');
      var testFn = function () {
        throw new Error('A listener was not removed');
      };
      var testFn2 = function () {
      };
      panzoom._on(el, 'foo', testFn);
      panzoom._on(el, 'bar', testFn2);
      panzoom._on(el2, 'foo', testFn2);
      panzoom._off(el, 'foo');
      assert.equal(panzoom._registeredEvents.length, 2);
      triggerEvent(el, 'foo');
      triggerEvent(el, 'bar');
      triggerEvent(el2, 'foo');
    });

    it('should remove a specific event listener', function () {
      var el2 = document.getElementById('fixture-2');
      var testFn = function () {
        throw new Error('A listener was not removed');
      };
      var testFn2 = function () {
      };
      panzoom._on(el, 'foo', testFn);
      panzoom._on(el, 'foo', testFn2);
      panzoom._on(el, 'bar', testFn2);

      panzoom._off(el, 'foo', testFn);

      assert.equal(panzoom._registeredEvents.length, 2);
      triggerEvent(el, 'foo');
      triggerEvent(el, 'bar');
    });

  });

});

describe('Vector', function () {
  it('should create a vector where this.elements is an array of numbers', function () {
    var v = new Vector(1, 2, 3);
    assert.deepEqual(v.elements, [1,2,3]);
  });
  describe('#e', function () {
    it('should return the element at zero-indexed index i', function () {
      var v = new Vector(1, 2, 3);
      assert.equal(v.e(1), 2);
    });
  });
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
