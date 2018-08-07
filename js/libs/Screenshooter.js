(function iife() {
  function sendDebuggerCommand(debugee, command, options = {}) {
    return new Promise((resolve, reject) => {
      chrome.debugger.sendCommand(debugee, command, options, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }

        resolve(result);
      });
    });
  }

  function captureTab(tabId) {
    let resolve,
      reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const debugee = { tabId };

    chrome.debugger.attach(debugee, '1.3', async () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      try {
        await sendDebuggerCommand(debugee, 'Page.enable');
        await sendDebuggerCommand(debugee, 'Runtime.enable');
        const layout = await sendDebuggerCommand(debugee, 'Page.getLayoutMetrics');
        await sendDebuggerCommand(debugee, 'Emulation.setDeviceMetricsOverride', {
          width: layout.contentSize.width,
          // Cap the height to not hit the GPU limit.
          // found in https://cs.chromium.org/chromium/src/third_party/blink/renderer/devtools/front_end/emulation/DeviceModeModel.js?l=654&rcl=eea80c5fd4c24852fa8bd3d0974e7f6cfd2d750e
          height: Math.min((1 << 14), layout.contentSize.height),// eslint-disable-line
          deviceScaleFactor: 1,
          mobile: false,
        });
        await sendDebuggerCommand(debugee, 'Runtime.evaluate', {
          expression: `
            new Promise(resolve => {
              window.scrollTo(0, 0);
              requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
              });
            });
          `,
          awaitPromise: true,
        });
        const result = await sendDebuggerCommand(debugee, 'Page.captureScreenshot');

        resolve(`data:image/png;base64,${result.data}`);
      } catch (error) {
        console.error(error);
        reject('Capturing screenshot failed.');
      }

      chrome.debugger.detach(debugee);
    });

    return promise;
  }

  window.Screenshooter = {
    capture: captureTab,
  };
}());
