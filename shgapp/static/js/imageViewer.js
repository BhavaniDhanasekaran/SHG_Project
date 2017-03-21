function imageViewer() {

  'use strict';

  var Viewer = window.Viewer;
  var console = window.console || { log: function () {} };
  var pictures = document.querySelector('.docs-pictures');
  //var toggles = document.querySelector('.docs-toggles');
 // var buttons = document.querySelector('.docs-buttons');
  var options = {
        // inline: true,
        url: 'data-original',
        ready:  function (e) {
          console.log(e.type);
        },
        show:  function (e) {
          console.log(e.type);
        },
        shown:  function (e) {
          console.log(e.type);
        },
        hide:  function (e) {
          console.log(e.type);
        },
        hidden:  function (e) {
          console.log(e.type);
        },
        view:  function (e) {
          console.log(e.type, e.detail.index);
        },
        viewed:  function (e) {
          console.log(e.type, e.detail.index);
          // this.viewer.zoomTo(1).rotateTo(180);
        }
      };
  var viewer;



  function addEventListener(element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handler);
    }
  }

  addEventListener(pictures, 'ready', function (e) {
  });
  addEventListener(pictures, 'show', function (e) {
  });
  addEventListener(pictures, 'shown', function (e) {
  });
  addEventListener(pictures, 'hide', function (e) {
  });
  addEventListener(pictures, 'hidden', function (e) {
  });
  addEventListener(pictures, 'view', function (e) {
  });
  addEventListener(pictures, 'viewed', function (e) {
  });
  viewer = new Viewer(pictures, options);

 // toggleButtons(options.inline ? 'inline' : 'modal');




}