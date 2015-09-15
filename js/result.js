"use strict";

var aBtn = document.querySelector('.show-a');
var bBtn = document.querySelector('.show-b');
var diffBtn = document.querySelector('.show-diff');
var resultImg = document.querySelector('.result-image');
var mismatchValue = document.querySelector('.mismatch-value');
var sameDimensions = document.querySelector('.same-dimensions');
var result = null;

function initBtns() {
  aBtn.addEventListener('click', () => {
    resultImg.src = result.a;
  });

  bBtn.addEventListener('click', () => {
    resultImg.src = result.b;
  });

  diffBtn.addEventListener('click', () => {
    resultImg.src = result.diff;
  });
}

chrome.runtime.sendMessage({
  message: "get_last_result"
}, (lastResult) => {
  result = lastResult;

  mismatchValue.innerText = result.misMatchPercentage;
  sameDimensions.innerText = result.isSameDimensions ? 'Yes' : 'No';
  resultImg.src = result.diff;

  initBtns();
});

