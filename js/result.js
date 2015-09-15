"use strict";

var aBtn = document.querySelector('.show-a');
var bBtn = document.querySelector('.show-b');
var diffBtn = document.querySelector('.show-diff');
var resultImg = document.querySelector('.result-image');
var mismatchValue = document.querySelector('.mismatch-value');
var sameDimensions = document.querySelector('.same-dimensions');
var diff = null;
var diffImg = null;
var aImg = null;
var bImg = null;

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
  message: "get_last_comparison"
}, (lastResult) => {
  aImg = lastResult.a;
  bImg = lastResult.b;

  resemble.outputSettings({
    largeImageThreshold: 0
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

