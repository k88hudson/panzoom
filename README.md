# panzoom

This is a fork of [jquery.panzoom](https://github.com/timmywil/jquery.panzoom), with a few changes:

To run tests: `npm test`. I added them in order to prevent regressions as I was rewriting the library without jquery, but they're not complete.

I've removed the following:

* `panzoom` does not use jquery. So far I've tested it in mobile safari, desktop chrome, mobile chrome, desktop Firefox
* no support for pointer events, mouse/touch events only
* no support for direct pan/zooming of svgs, if you need that see [the original](https://github.com/timmywil/jquery.panzoom#svg-support)

I've changed the following behaviour:

* Although `panzoom` will remove transitions when necessary, it does not support `adding` them via this library; if you would like to have transitions, add them to your element in css. I did this in order not to block existing css transitions
* `panzoom` no longer calls `preventDefault` or `stopPropagation` on touch and mouse events. This is so tapping on inner elements of the pan/zoomed with tap/click listeners will still be possible (see https://github.com/k88hudson/pinch/issues/3 for outstanding issue)

