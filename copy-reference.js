/**
 * @license jquery.panzoom.js v2.0.5
 * Updated: Thu Jul 03 2014
 * Add pan and zoom functionality to any element
 * Copyright (c) 2014 timmy willison
 * Released under the MIT license
 * https://github.com/timmywil/jquery.panzoom/blob/master/MIT-License.txt
 */

(function(global, factory) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define([ 'jquery' ], function(jQuery) {
      return factory(global, jQuery);
    });
  // CommonJS/Browserify
  } else if (typeof exports === 'object') {
    factory(global, require('jquery'));
  // Global
  } else {
    factory(global, global.jQuery);
  }
}(typeof window !== 'undefined' ? window : this, function(window, $) {
  'use strict';

  // Common properties to lift for touch or pointer events
  var list = 'over out down up move enter leave cancel'.split(' ');
  var hook = $.extend({}, $.event.mouseHooks);
  var events = {};

  // Support pointer events in IE11+ if available
  if ( window.PointerEvent ) {
    $.each(list, function( i, name ) {
      // Add event name to events property and add fixHook
      $.event.fixHooks[
        (events[name] = 'pointer' + name)
      ] = hook;
    });
  } else {
    var mouseProps = hook.props;
    // Add touch properties for the touch hook
    hook.props = mouseProps.concat(['touches', 'changedTouches', 'targetTouches', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey']);

    /**
     * Support: Android
     * Android sets pageX/Y to 0 for any touch event
     * Attach first touch's pageX/pageY and clientX/clientY if not set correctly
     */
    hook.filter = function( event, originalEvent ) {
      var touch;
      var i = mouseProps.length;
      if ( !originalEvent.pageX && originalEvent.touches && (touch = originalEvent.touches[0]) ) {
        // Copy over all mouse properties
        while(i--) {
          event[mouseProps[i]] = touch[mouseProps[i]];
        }
      }
      return event;
    };

    $.each(list, function( i, name ) {
      // No equivalent touch events for over and out
      if (i < 2) {
        events[ name ] = 'mouse' + name;
      } else {
        var touch = 'touch' +
          (name === 'down' ? 'start' : name === 'up' ? 'end' : name);
        // Add fixHook
        $.event.fixHooks[ touch ] = hook;
        // Add event names to events property
        events[ name ] = touch + ' mouse' + name;
      }
    });
  }

  $.pointertouch = events;

  var document = window.document;
  var datakey = '__pz__';
  var slice = Array.prototype.slice;
  var pointerEvents = !!window.PointerEvent;
  var supportsInputEvent = (function() {
    var input = document.createElement('input');
    input.setAttribute('oninput', 'return');
    return typeof input.oninput === 'function';
  })();

  // Regex
  var rupper = /([A-Z])/g;
  var rsvg = /^http:[\w\.\/]+svg$/;
  var rinline = /^inline/;

  var floating = '(\\-?[\\d\\.e]+)';
  var commaSpace = '\\,?\\s*';
  var rmatrix = new RegExp(
    '^matrix\\(' +
    floating + commaSpace +
    floating + commaSpace +
    floating + commaSpace +
    floating + commaSpace +
    floating + commaSpace +
    floating + '\\)$'
  );



  /**
   * Create a Panzoom object for a given element
   * @constructor
   * @param {Element} elem - Element to use pan and zoom
   * @param {Object} [options] - An object literal containing options to override default options
   *  (See Panzoom.defaults for ones not listed below)
   * @param {jQuery} [options.$zoomIn] - zoom in buttons/links collection (you can also bind these yourself
   *  e.g. $button.on('click', function(e) { e.preventDefault(); $elem.panzoom('zoomIn'); });)
   * @param {jQuery} [options.$zoomOut] - zoom out buttons/links collection on which to bind zoomOut
   * @param {jQuery} [options.$zoomRange] - zoom in/out with this range control
   * @param {jQuery} [options.$reset] - Reset buttons/links collection on which to bind the reset method
   * @param {Function} [options.on[Start|Change|Zoom|Pan|End|Reset] - Optional callbacks for panzoom events
   */
  function Panzoom(elem, options) {

    // Allow instantiation without `new` keyword
    if (!(this instanceof Panzoom)) {
      return new Panzoom(elem, options);
    }

    // Sanity checks
    if (elem.nodeType !== 1) {
      $.error('Panzoom called on non-Element node');
    }
    if (!$.contains(document, elem)) {
      $.error('Panzoom element must be attached to the document');
    }

    // Don't remake
    var d = $.data(elem, datakey);
    if (d) {
      return d;
    }

    // Extend default with given object literal
    // Each instance gets its own options
    // this.options = options = $.extend({}, Panzoom.defaults, options);
    // this.elem = elem;
    var $elem = this.$elem = $(elem);
    this.$set = options.$set && options.$set.length ? options.$set : $elem;
    // this.$doc = $(elem.ownerDocument || document);
    // this.$parent = $elem.parent();

    // This is SVG if the namespace is SVG
    // However, while <svg> elements are SVG, we want to treat those like other elements
    this.isSVG = rsvg.test(elem.namespaceURI) && elem.nodeName.toLowerCase() !== 'svg';

    // this.panning = false;

    // // Save the original transform value
    // // Save the prefixed transform style key
    // // Set the starting transform
    // this._buildTransform();

    // // Build the appropriately-prefixed transform style property name
    // // De-camelcase
    // this._transform = !this.isSVG && $.cssProps.transform.replace(rupper, '-$1').toLowerCase();

    // // Build the transition value
    // this._buildTransition();

    // // Build containment dimensions
    // this.resetDimensions();

    // // Add zoom and reset buttons to `this`
    // var $empty = $();
    // var self = this;
    // $.each([ '$zoomIn', '$zoomOut', '$zoomRange', '$reset' ], function(i, name) {
    //   self[ name ] = options[ name ] || $empty;
    // });

    this.enable();

    // Save the instance
    $.data(elem, datakey, this);
  }

 
  // Container for event names
  Panzoom.events = $.pointertouch;

  Panzoom.prototype = {
    constructor: Panzoom,

    /**
     * @returns {Panzoom} Returns the instance
     */
    instance: function() {
      return this;
    },

    /**
     * Enable or re-enable the panzoom instance
     */
    enable: function() {
      // Unbind first
      this._initStyle();
      this._bind();
      this.disabled = false;
    },

    /**
     * Disable panzoom
     */
    disable: function() {
      this.disabled = true;
      this._resetStyle();
      this._unbind();
    },



    /**
     * Destroy the panzoom instance
     */
    destroy: function() {
      this.disable();
      $.removeData(this.elem, datakey);
    },


    /**
     * Return the element to it's original transform matrix
     * @param {Boolean} [options] If a boolean is passed, animate the reset (default: true). If an options object is passed, simply pass that along to setMatrix.
     * @param {Boolean} [options.silent] Silence the reset event
     */
    reset: function(options) {
      options = createResetOptions(options);
      // Reset the transform to its original value
      var matrix = this.setMatrix(this._origTransform, options);
      if (!options.silent) {
        this._trigger('reset', matrix);
      }
    },

    /**
     * Only resets zoom level
     * @param {Boolean|Object} [options] Whether to animate the reset (default: true) or an object of options to pass to zoom()
     */
    resetZoom: function(options) {
      options = createResetOptions(options);
      var origMatrix = this.getMatrix(this._origTransform);
      options.dValue = origMatrix[ 3 ];
      this.zoom(origMatrix[0], options);
    },

   

    /**
     * Get/set option on an existing instance
     * @returns {Array|undefined} If getting, returns an array of all values
     *   on each instance for a given key. If setting, continue chaining by returning undefined.
     */
    option: function(key, value) {
      var options;
      if (!key) {
        // Avoids returning direct reference
        return $.extend({}, this.options);
      }

      if (typeof key === 'string') {
        if (arguments.length === 1) {
          return this.options[ key ] !== undefined ?
            this.options[ key ] :
            null;
        }
        options = {};
        options[ key ] = value;
      } else {
        options = key;
      }

      this._setOptions(options);
    },

    /**
     * Internally sets options
     * @param {Object} options - An object literal of options to set
     */
    _setOptions: function(options) {
      $.each(options, $.proxy(function(key, value) {
        switch(key) {
          case 'disablePan':
            this._resetStyle();
            /* falls through */
          case '$zoomIn':
          case '$zoomOut':
          case '$zoomRange':
          case '$reset':
          case 'disableZoom':
          case 'onStart':
          case 'onChange':
          case 'onZoom':
          case 'onPan':
          case 'onEnd':
          case 'onReset':
          case 'eventNamespace':
            this._unbind();
        }
        this.options[ key ] = value;
        switch(key) {
          case 'disablePan':
            this._initStyle();
            /* falls through */
          case '$zoomIn':
          case '$zoomOut':
          case '$zoomRange':
          case '$reset':
            // Set these on the instance
            this[ key ] = value;
            /* falls through */
          case 'disableZoom':
          case 'onStart':
          case 'onChange':
          case 'onZoom':
          case 'onPan':
          case 'onEnd':
          case 'onReset':
          case 'eventNamespace':
            this._bind();
            break;
          case 'cursor':
            $.style(this.elem, 'cursor', value);
            break;
          case 'minScale':
            this.$zoomRange.attr('min', value);
            break;
          case 'maxScale':
            this.$zoomRange.attr('max', value);
            break;
          case 'rangeStep':
            this.$zoomRange.attr('step', value);
            break;
          case 'startTransform':
            this._buildTransform();
            break;
          case 'duration':
          case 'easing':
            this._buildTransition();
            /* falls through */
          case 'transition':
            this.transition();
            break;
          case '$set':
            if (value instanceof $ && value.length) {
              this.$set = value;
              // Reset styles
              this._initStyle();
              this._buildTransform();
            }
        }
      }, this));
    },

    
    /**
     * Binds all necessary events
     */
    _bind: function() {
      var self = this;
      var options = this.options;
      var ns = options.eventNamespace;
      var str_start = pointerEvents ? 'pointerdown' + ns : ('touchstart' + ns + ' mousedown' + ns);
      var str_click = pointerEvents ? 'pointerup' + ns : ('touchend' + ns + ' click' + ns);
      var events = {};
      var $reset = this.$reset;
      var $zoomRange = this.$zoomRange;

      // Bind panzoom events from options
      $.each([ 'Start', 'Change', 'Zoom', 'Pan', 'End', 'Reset' ], function() {
        var m = options[ 'on' + this ];
        if ($.isFunction(m)) {
          events[ 'panzoom' + this.toLowerCase() + ns ] = m;
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
      this.$elem.on(events);

      // Bind reset
      if ($reset.length) {
        $reset.on(str_click, function(e) {
          e.preventDefault();
          self.reset();
        });
      }

      // Set default attributes for the range input
      if ($zoomRange.length) {
        $zoomRange.attr({
          // Only set the range step if explicit or
          // set the default if there is no attribute present
          step: options.rangeStep === Panzoom.defaults.rangeStep &&
            $zoomRange.attr('step') ||
            options.rangeStep,
          min: options.minScale,
          max: options.maxScale
        }).prop({
          value: this.getMatrix()[0]
        });
      }

      // No bindings if zooming is disabled
      if (options.disableZoom) {
        return;
      }

      var $zoomIn = this.$zoomIn;
      var $zoomOut = this.$zoomOut;

      // Bind zoom in/out
      // Don't bind one without the other
      if ($zoomIn.length && $zoomOut.length) {
        // preventDefault cancels future mouse events on touch events
        $zoomIn.on(str_click, function(e) {
          e.preventDefault();
          self.zoom();
        });
        $zoomOut.on(str_click, function(e) {
          e.preventDefault();
          self.zoom(true);
        });
      }

      if ($zoomRange.length) {
        events = {};
        // Cannot prevent default action here, just use pointerdown/mousedown
        events[ (pointerEvents ? 'pointerdown' : 'mousedown') + ns ] = function() {
          self.transition(true);
        };
        // Zoom on input events if available and change events
        // See https://github.com/timmywil/jquery.panzoom/issues/90
        events[ (supportsInputEvent ? 'input' : 'change') + ns ] = function() {
          self.zoom(+this.value, { noSetRange: true });
        };
        $zoomRange.on(events);
      }
    },


    /**
     * Starts the pan
     * This is bound to mouse/touchmove on the element
     * @param {jQuery.Event} event An event with pageX, pageY, and possibly the touches list
     * @param {TouchList} [touches] The touches list if present
     */
    _startMove: function(event, touches) {
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
      if (pointerEvents) {
        moveEvent = 'pointermove';
        endEvent = 'pointerup';
      } else if (event.type === 'touchstart') {
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

      // Bind the handlers
      $(document)
        .off(ns)
        .on(moveEvent, move)
        .on(endEvent, function(e) {
          e.preventDefault();
          // Unbind all document events
          $(this).off(ns);
          self.panning = false;
          // Trigger our end event
          // Simply set the type to "panzoomend" to pass through all end properties
          // jQuery's `not` is used here to compare Array equality
          e.type = 'panzoomend';
          self._trigger(e, matrix, !matrixEquals(matrix, original));
        });
    }
  };

  // Add Panzoom as a static property
  $.Panzoom = Panzoom;

  /**
   * Extend jQuery
   * @param {Object|String} options - The name of a method to call on the prototype
   *  or an object literal of options
   * @returns {jQuery|Mixed} jQuery instance for regular chaining or the return value(s) of a panzoom method call
   */
  $.fn.panzoom = function(options) {
    var instance, args, m, ret;

    // Call methods widget-style
    if (typeof options === 'string') {
      ret = [];
      args = slice.call(arguments, 1);
      this.each(function() {
        instance = $.data(this, datakey);

        if (!instance) {
          ret.push(undefined);

        // Ignore methods beginning with `_`
        } else if (options.charAt(0) !== '_' &&
          typeof (m = instance[ options ]) === 'function' &&
          // If nothing is returned, do not add to return values
          (m = m.apply(instance, args)) !== undefined) {

          ret.push(m);
        }
      });

      // Return an array of values for the jQuery instances
      // Or the value itself if there is only one
      // Or keep chaining
      return ret.length ?
        (ret.length === 1 ? ret[0] : ret) :
        this;
    }

    return this.each(function() { new Panzoom(this, options); });
  };

  return Panzoom;
}));
