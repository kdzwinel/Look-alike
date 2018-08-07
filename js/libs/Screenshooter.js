(function () {
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

  /**
   * @description Takes screenshot of the current tab
   */
  function captureTab(tabId) {
    let resolve,
      reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const debugee = { tabId };

    console.time('whole thing');
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
          height: layout.contentSize.height,
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
      console.timeEnd('whole thing');
    });

    return promise;
  }

  window.Screenshooter = {
    capture: captureTab,
  };
}());
