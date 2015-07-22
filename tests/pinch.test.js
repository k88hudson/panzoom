var Pinch = require('../panzoom');
var Matrix = require('../lib/matrix');
var Vector = require('../lib/vector');
var assert = require('assert');

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
    // TODO: Doesn't work in phantom
    // it('should get the right dimensions', function () {
    //   assert.deepEqual(pinch.dimensions, {
    //     height: 100,
    //     heightBorder: 30,
    //     left: 70,
    //     margin: {
    //       left: 20,
    //       top: 20
    //     },
    //     top: 50,
    //     width: 50,
    //     widthBorder: 30
    //   });
    // });
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
      assert.equal(el.style.webkitBackfaceVisibility, 'hidden');
      assert.ok(el.style.webkitTransformOrigin.indexOf('50% 50%') > -1);
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
    it('should add an event listener and register it', function () {
      var testFn = function () {
        var inArray = false;
        pinch._registeredEvents.forEach(function (item) {
          if (item.element === el && item.event === 'foo' && item.callback === testFn) {
            inArray = true;
          }
        });
        assert.ok(inArray);
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
