/* global ShotStorage Screenshooter */
const shots = new ShotStorage();
let lastComparison = {};

function getCurrentTab() {
  return new Promise(((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs[0]);
      }
    });
  }));
}

function getThumbnail(original, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      let sourceWidth,
        sourceHeight;

      if (image.width < image.height) {
        sourceWidth = image.width;
        sourceHeight = Math.round(height * (image.width / width));
      } else {
        sourceHeight = image.height;
        sourceWidth = Math.round(width * (image.height / height));
      }

      canvas.getContext('2d').drawImage(image, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);

      resolve(canvas.toDataURL());
    };
    image.onerror = reject;
    image.src = original;
  });
}

function validateSender(sender) {
  // don't respond to calls from other extensions
  return sender.id !== chrome.runtime.id;
}

function handleMessage(request, sender, response) {
  if (validateSender(sender)) {
    return false;
  }

  if (request.message === 'save_shot') {
    getCurrentTab().then(tab => Screenshooter.capture(tab.id).then((img) => {
      chrome.runtime.sendMessage({
        message: 'savingShot',
      });

      getThumbnail(img, 100, 100).then((thumbnail) => {
        shots.add({
          url: tab.url,
          img,
          thumbnail,
        });
        response();
      });
    })).catch((e) => {
      chrome.runtime.sendMessage({
        message: 'error',
        text: e ? e.message : 'Unknown error.',
      });
    });
  } else if (request.message === 'get_all_shots') {
    response(shots.getAll());
  } else if (request.message === 'diff') {
    const shot = shots.getById(request.id);
    const oldImg = shot.img;

    getCurrentTab().then(tab => Screenshooter.capture(tab.id).then((currentImg) => {
      lastComparison = {
        a: oldImg,
        b: currentImg,
      };

      chrome.tabs.create({
        url: chrome.extension.getURL('result.html'),
      }, response);
    })).catch((e) => {
      chrome.runtime.sendMessage({
        message: 'error',
        text: e ? e.message : 'Unknown error.',
      });
    });
  } else if (request.message === 'get_last_comparison') {
    response(lastComparison);
  }

  // this return statement has to be here for responses to work ( http://stackoverflow.com/q/20077487/1143495 )
  return true;
}

chrome.runtime.onMessage.addListener(handleMessage);
