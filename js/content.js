(function () {
  "use strict";

  //prevent multiple injections
  if (window.lookAlikeExtension) {
    return;
  }
  window.lookAlikeExtension = true;

  function resetPage(originalParams) {
    window.scrollTo(0, originalParams.scrollTop);
    document.querySelector("html").style.overflow = originalParams.overflow;
  }

  chrome.extension.onRequest.addListener(function (request, sender, callback) {
    switch (request.msg) {
      case "getPageDetails":
        var size = {
          width: Math.max(
            document.documentElement.clientWidth,
            document.body.scrollWidth,
            document.documentElement.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.offsetWidth
          ),
          height: Math.max(
            document.documentElement.clientHeight,
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
          )
        };

        chrome.extension.sendRequest({
          "msg": "setPageDetails",
          "size": size,
          "scrollBy": window.innerHeight,
          "originalParams": {
            "overflow": document.querySelector("html").style.overflow,
            "scrollTop": document.documentElement.scrollTop
          }
        });
        break;

      case "scrollPage":
        var lastCapture = false;

        window.scrollTo(0, request.scrollTo);

        // first scrolling
        if (request.scrollTo === 0) {
          document.querySelector("html").style.overflow = "hidden";
        }

        var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

        // last scrolling
        if (request.size.height <= scrollTop + request.scrollBy) {
          lastCapture = true;
          request.scrollTo = request.size.height - request.scrollBy;
        }

        var progress = Math.round(((scrollTop + request.scrollBy) * 100) / request.size.height);
        progress = progress > 100 ? 100 : progress;

        chrome.extension.sendRequest({
          msg: "captureFragment",
          position: request.scrollTo,
          lastCapture: lastCapture,
          progress: progress
        });
        break;

      case "resetPage":
        resetPage(request.originalParams);
        break;
    }
  });
})();
