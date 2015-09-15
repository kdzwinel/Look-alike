"use strict";

var shots = new ShotStorage();
var lastComparison = {};

function getCurrentTab() {
  return new Promise(function (resolve, reject) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs[0]);
      }
    });
  });
}

function getThumbnail(original, width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  var image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      var sourceWidth, sourceHeight, sourceX = 0, sourceY = 0;

      if (image.width < image.height) {
        sourceWidth = image.width;
        sourceHeight = Math.round(height * (image.width / width));
        sourceY = Math.round((image.height - sourceHeight) / 2);
      } else {
        sourceHeight = image.height;
        sourceWidth = Math.round(width * (image.height / height));
        sourceX = Math.round((image.width - sourceWidth) / 2);
      }

      canvas.getContext("2d").drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

      resolve(canvas.toDataURL());
    };
    image.onerror = reject;
    image.src = original;
  });
}

function validateSender(sender) {
  //don't respond to calls from other extensions
  return sender.id !== chrome.runtime.id;
}

function handleMessage(request, sender, response) {
  if (validateSender(sender)) {
    return;
  }

  if (request.message === 'save_shot') {
    getCurrentTab().then((tab) => {
      return Screenshooter.capture(tab.id).then((img) => {
        chrome.runtime.sendMessage({
          message: "savingShot"
        });

        getThumbnail(img, 100, 100).then((thumbnail) => {
          shots.add({
            url: tab.url,
            img: img,
            thumbnail: thumbnail
          });
          response();
        });
      });
    }).catch((e) => {
      chrome.runtime.sendMessage({
        message: "error",
        text: e ? e.message : 'Unknown error.'
      });
    });
  } else if (request.message === 'get_all_shots') {
    response(shots.getAll());
  } else if (request.message === 'diff') {
    var shot = shots.getById(request.id);
    var oldImg = shot.img;

    getCurrentTab().then((tab) => {
      return Screenshooter.capture(tab.id).then((currentImg) => {
        lastComparison = {
          a: oldImg,
          b: currentImg
        };

        chrome.tabs.create({
          url: chrome.extension.getURL('result.html')
        }, response);
      });
    }).catch((e) => {
      chrome.runtime.sendMessage({
        message: "error",
        text: e ? e.message : 'Unknown error.'
      });
    });
  } else if (request.message === 'get_last_comparison') {
    response(lastComparison);
  }

  // this return statement has to be here for responses to work ( http://stackoverflow.com/q/20077487/1143495 )
  return true;
}

chrome.runtime.onMessage.addListener(handleMessage);
