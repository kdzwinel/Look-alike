"use strict";

var screensContainer = document.querySelector('.screens');
var saveBtn = document.querySelector('.button-save');
var compareBtn = document.querySelector('.button-compare');
var shareBtn = document.querySelector('.button-share');
var shotTemplate = document.getElementById('template-shot');
var shotsList = document.querySelector('.screen-list .shots');
var msg = document.querySelector('.screen-msg .msg');

function renderShots(shots) {
  if (!shots.length) {
    showMsg('The list is empty. Create some screenshots first.');
    return;
  }

  var df = document.createDocumentFragment();

  shots.forEach((shot) => {
    var shotUI = document.importNode(shotTemplate.content, true);
    var url = new URL(shot.url);

    shotUI.querySelector('.shot').dataset.id = shot.id;
    shotUI.querySelector('.shot-preview img').src = shot.thumbnail;
    shotUI.querySelector('.shot-url').textContent = url.host + url.pathname;
    shotUI.querySelector('.shot-url').title = url.href;
    shotUI.querySelector('.shot-date').textContent = moment(shot.date).fromNow();

    df.appendChild(shotUI);
  });

  shotsList.innerHTML = '';
  shotsList.appendChild(df);
}

function showList() {
  screensContainer.classList.add('show-list');
  screensContainer.classList.remove('show-msg');
  screensContainer.classList.remove('show-about');

  chrome.runtime.sendMessage({
    message: 'get_all_shots'
  }, renderShots);
}

function showMsg(text) {
  screensContainer.classList.add('show-msg');
  screensContainer.classList.remove('show-list');
  screensContainer.classList.remove('show-about');

  msg.innerText = text;
}

function showAbout(e) {
  screensContainer.classList.add('show-about');
  screensContainer.classList.remove('show-msg');
  screensContainer.classList.remove('show-list');

  if(e) {
    e.preventDefault();
  }
}

function showDiff(e) {
  var shot = e.target.closest('.shot');

  if (shot) {
    chrome.runtime.sendMessage({
      message: 'diff',
      id: shot.dataset.id
    }, () => {
      window.close();
    });

    showMsg('Comparing...');
  }
}

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.message === 'captureProgress') {
    showMsg(request.progress + '%');
  } else if (request.message === 'savingShot') {
    showMsg('Saving.');
  } else if (request.message === 'comparingShots') {
    showMsg('Comparing.');
  } else if (request.message === 'error') {
    showMsg('Error! ' + request.text);
  }
});

saveBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    message: 'save_shot'
  }, showList);

  showMsg('Capturing...');
});

compareBtn.addEventListener('click', showList);
shotsList.addEventListener('click', showDiff);
shareBtn.addEventListener('click', showAbout);

//by default first element of the popup is getting (unwanted) focus
setTimeout(() => {
  if (document.activeElement) {
    document.activeElement.blur();
  }
}, 100);

