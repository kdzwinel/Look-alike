/* global resemble */

const aBtn = document.querySelector('.show-a');
const bBtn = document.querySelector('.show-b');
const diffBtn = document.querySelector('.show-diff');
const resultImg = document.querySelector('.result-image');
const mismatchValue = document.querySelector('.mismatch-value');
const sameDimensions = document.querySelector('.same-dimensions');
let diff = null;
let diffImg = null;
let aImg = null;
let bImg = null;

function initBtns() {
  aBtn.addEventListener('click', () => {
    resultImg.src = aImg;
  });

  bBtn.addEventListener('click', () => {
    resultImg.src = bImg;
  });

  diffBtn.addEventListener('click', () => {
    resultImg.src = diffImg;
  });
}

function hideLoader() {
  document.body.classList.remove('loading');
}

chrome.runtime.sendMessage({
  message: 'get_last_comparison',
}, (lastResult) => {
  aImg = lastResult.a;
  bImg = lastResult.b;

  resemble.outputSettings({
    largeImageThreshold: 0,
  });

  resemble(aImg).compareTo(bImg).onComplete((abDiff) => {
    diff = abDiff;
    diffImg = diff.getImageDataUrl();

    mismatchValue.innerText = diff.misMatchPercentage;
    sameDimensions.innerText = diff.isSameDimensions ? 'Yes' : 'No';
    resultImg.src = diffImg;

    initBtns();
    hideLoader();
  });
});
