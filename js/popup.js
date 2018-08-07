/* global moment */

const screensContainer = document.querySelector('.screens');
const saveBtn = document.querySelector('.button-save');
const compareBtn = document.querySelector('.button-compare');
const shareBtn = document.querySelector('.button-share');
const shotTemplate = document.getElementById('template-shot');
const shotsList = document.querySelector('.screen-list .shots');
const socialButtons = document.querySelector('.screen-about .social-buttons');
const msg = document.querySelector('.screen-msg .msg');
const socialButtonsTemplate = document.getElementById('social-buttons');

function showMsg(text) {
  screensContainer.classList.add('show-msg');
  screensContainer.classList.remove('show-list');
  screensContainer.classList.remove('show-about');

  msg.innerText = text;
}

function renderShots(shots) {
  if (!shots || !shots.length) {
    showMsg('The list is empty. Create some screenshots first.');
    return;
  }

  const df = document.createDocumentFragment();

  shots.forEach((shot) => {
    const shotUI = document.importNode(shotTemplate.content, true);
    const url = new URL(shot.url);

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
    message: 'get_all_shots',
  }, renderShots);
}

function showAbout(e) {
  screensContainer.classList.add('show-about');
  screensContainer.classList.remove('show-msg');
  screensContainer.classList.remove('show-list');

  const buttonsUI = document.importNode(socialButtonsTemplate.content, true);
  socialButtons.appendChild(buttonsUI);

  if (e) {
    e.preventDefault();
  }
}

function showDiff(e) {
  const shot = e.target.closest('.shot');

  if (shot) {
    chrome.runtime.sendMessage({
      message: 'diff',
      id: shot.dataset.id,
    }, () => {
      window.close();
    });

    showMsg('Comparing...');
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'savingShot') {
    showMsg('Saving.');
  } else if (request.message === 'error') {
    showMsg(`Error! ${request.text}`);
  }
});

saveBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    message: 'save_shot',
  }, showList);

  showMsg('Capturing...');
});

compareBtn.addEventListener('click', showList);
shotsList.addEventListener('click', showDiff);
shareBtn.addEventListener('click', showAbout);

// by default first element of the popup is getting (unwanted) focus
setTimeout(() => {
  if (document.activeElement) {
    document.activeElement.blur();
  }
}, 100);
