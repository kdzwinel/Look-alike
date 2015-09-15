(function () {
  "use strict";

  var takeScreenshot = {
    /**
     * @description ID of current tab
     * @type {Number}
     */
    tabId: null,

    /**
     * @description Canvas element
     * @type {Object}
     */
    screenshotCanvas: null,

    /**
     * @description 2D context of screenshotCanvas element
     * @type {Object}
     */
    screenshotContext: null,

    /**
     * @description Number of pixels by which to move the screen
     * @type {Number}
     */
    scrollBy: 0,

    /**
     * @description Sizes of page
     * @type {Object}
     */
    size: {
      width: 0,
      height: 0
    },

    /**
     * @description Keep original params of page
     * @type {Object}
     */
    originalParams: {
      overflow: "",
      scrollTop: 0
    },

    /**
     * Function to be called when screenshot is ready
     * @type {Function}
     */
    resolve: null,

    /**
     * Function to be called when making screenshot fails
     * @type {Function}
     */
    reject: null,

    /**
     * @description Initialize plugin
     */
    initialize: function () {
      this.screenshotCanvas = document.createElement("canvas");
      this.screenshotContext = this.screenshotCanvas.getContext("2d");

      this.bindEvents();
    },

    /**
     * @description Bind plugin events
     */
    bindEvents: function () {
      // handle chrome requests
      chrome.extension.onRequest.addListener((request, sender, callback) => {
        if (request.msg === "setPageDetails") {
          this.size = request.size;
          this.scrollBy = request.scrollBy;
          this.originalParams = request.originalParams;

          // set width & height of canvas element
          this.screenshotCanvas.width = this.size.width;
          this.screenshotCanvas.height = this.size.height;

          this.scrollTo(0);
        } else if (request.msg === "captureFragment") {
          chrome.runtime.sendMessage({
            message: "captureProgress",
            progress: request.progress
          });
          this.captureFragment(request.position, request.lastCapture);
        }
      });
    },

    /**
     * @description Send request to scroll page on given position
     * @param {Number} position
     */
    scrollTo: function (position) {
      chrome.tabs.sendRequest(this.tabId, {
        "msg": "scrollPage",
        "size": this.size,
        "scrollBy": this.scrollBy,
        "scrollTo": position
      });
    },

    /**
     * @description Takes screenshot of visible area and merges it
     * @param {Number} position
     * @param {Boolean} lastCapture
     */
    captureFragment: function (position, lastCapture) {
      var self = this;

      setTimeout(() => {
        chrome.tabs.captureVisibleTab(null, {
          "format": "png"
        }, function (dataURI) {
          var image = new Image();

          if (typeof dataURI !== "undefined") {
            image.onload = () => {
              var originalWidth = image.width;
              var originalHeight = image.height;
              var outputWidth = image.width / window.devicePixelRatio;
              var outputHeight = image.height / window.devicePixelRatio;
              self.screenshotContext.drawImage(image, 0, 0, originalWidth, originalHeight, 0, position, outputWidth, outputHeight);

              if (lastCapture) {
                self.resetPage();
                self.resolve(self.screenshotCanvas.toDataURL("image/png"));
              } else {
                self.scrollTo(position + self.scrollBy);
              }
            };

            image.src = dataURI;
          } else {
            self.reject();
          }
        });
      }, 25);
    },

    /**
     * @description Send request to set original params of page
     */
    resetPage: function () {
      chrome.tabs.sendRequest(this.tabId, {
        "msg": "resetPage",
        "originalParams": this.originalParams
      });
    },

    reset: function () {
      this.tabId = null;
      this.scrollBy = 0;
      this.size = {
        width: 0,
        height: 0
      };
      this.originalParams = {
        overflow: "",
        scrollTop: 0
      };
      this.resolve = null;
      this.reject = null;
    },

    capturePage: function (tabId) {
      this.reset();
      this.tabId = tabId;

      chrome.tabs.sendRequest(tabId, {
        "msg": "getPageDetails"
      });

      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  };

  takeScreenshot.initialize();

  function injectScript(tabId, scriptURL) {
    return new Promise((resolve, reject) => {
      chrome.tabs.executeScript(tabId, {
        file: scriptURL,
        runAt: 'document_start'
      }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(scriptURL);
        }
      });
    });
  }

  function capture(tabId) {
    return injectScript(tabId, 'js/content.js')
      .then(takeScreenshot.capturePage.bind(takeScreenshot, tabId));
  }

  window.Screenshooter = {
    capture: capture
  };
})();
