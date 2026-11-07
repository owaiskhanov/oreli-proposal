const sections = [...document.querySelectorAll('.accordion')];
const expandButton = document.querySelector('#expand-all');
const printButton = document.querySelector('#print-button');
const splash = document.querySelector('#splash-screen');
const splashSkip = document.querySelector('#splash-skip');
const site = document.querySelector('#proposal-site');
const proposalContent = document.querySelector('#proposal-content');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollRestorationBeforeSplash = 'scrollRestoration' in window.history ? window.history.scrollRestoration : null;
let statesBeforePrint = null;
let splashStarted = false;
let splashFinished = false;
let splashCleaned = false;
let splashFocusMain = false;
let splashTimer = 0;
let splashExitTimer = 0;

function resetScrollToTop() {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousBehavior;
}

function completeSplash(focusMain = splashFocusMain) {
  if (splashCleaned) return;
  splashCleaned = true;
  window.clearTimeout(splashTimer);
  window.clearTimeout(splashExitTimer);
  splash.removeEventListener('transitionend', onSplashTransitionEnd);
  site.inert = false;
  site.removeAttribute('aria-hidden');
  if (focusMain) proposalContent.focus({ preventScroll: true });
  splash.hidden = true;
  document.body.classList.remove('splash-active', 'splash-leaving');
  resetScrollToTop();
  window.requestAnimationFrame(() => {
    resetScrollToTop();
    if (scrollRestorationBeforeSplash !== null) window.history.scrollRestoration = scrollRestorationBeforeSplash;
  });
}

function onSplashTransitionEnd(event) {
  if (event.target === splash && event.propertyName === 'transform') completeSplash();
}

function finishSplash({ immediate = false, focusMain = false } = {}) {
  if (!splashStarted || splashFinished) return;
  splashFinished = true;
  splashFocusMain = focusMain;
  window.clearTimeout(splashTimer);
  if (immediate || reducedMotion.matches) {
    completeSplash(focusMain);
    return;
  }
  splashSkip.disabled = true;
  document.body.classList.add('splash-leaving');
  splash.addEventListener('transitionend', onSplashTransitionEnd);
  // A fallback also completes the intro if transition events are unavailable.
  splashExitTimer = window.setTimeout(() => completeSplash(), 1000);
}

function startSplash() {
  if (scrollRestorationBeforeSplash !== null) window.history.scrollRestoration = 'manual';
  resetScrollToTop();
  if (reducedMotion.matches) {
    splash.hidden = true;
    if (scrollRestorationBeforeSplash !== null) window.history.scrollRestoration = scrollRestorationBeforeSplash;
    return;
  }
  splashStarted = true;
  splash.hidden = false;
  document.body.classList.add('splash-active');
  site.inert = true;
  site.setAttribute('aria-hidden', 'true');
  splash.focus({ preventScroll: true });
  splashTimer = window.setTimeout(() => finishSplash(), 2300);
}

splashSkip.addEventListener('click', () => finishSplash({ focusMain: true }));
splash.addEventListener('keydown', (event) => {
  if (splashFinished) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    finishSplash({ focusMain: true });
  } else if (event.key === 'Tab') {
    event.preventDefault();
    splashSkip.focus();
  }
});
reducedMotion.addEventListener('change', (event) => {
  if (event.matches) finishSplash({ immediate: true });
});

function updateExpandButton() {
  const allExpanded = sections.every((section) => section.open);
  expandButton.setAttribute('aria-expanded', String(allExpanded));
  expandButton.querySelector('span').textContent = allExpanded ? 'Collapse all' : 'Expand all';
}

expandButton.addEventListener('click', () => {
  const shouldExpand = !sections.every((section) => section.open);
  sections.forEach((section) => { section.open = shouldExpand; });
  updateExpandButton();
});

sections.forEach((section) => section.addEventListener('toggle', updateExpandButton));

function prepareForPrint() {
  finishSplash({ immediate: true });
  if (statesBeforePrint === null) {
    statesBeforePrint = sections.map((section) => section.open);
  }
  sections.forEach((section) => { section.open = true; });
  updateExpandButton();
}

function restoreAfterPrint() {
  if (statesBeforePrint === null) return;
  sections.forEach((section, index) => { section.open = statesBeforePrint[index]; });
  statesBeforePrint = null;
  updateExpandButton();
}

window.addEventListener('beforeprint', prepareForPrint);
window.addEventListener('afterprint', restoreAfterPrint);
printButton.addEventListener('click', () => {
  prepareForPrint();
  window.print();
});
updateExpandButton();

const staliteLogo = document.querySelector('#stalite-logo');
const staliteLogoFallback = document.querySelector('#stalite-logo-fallback');
function showLogoFallback() {
  staliteLogo.hidden = true;
  staliteLogoFallback.hidden = false;
}
staliteLogo.addEventListener('error', showLogoFallback);
staliteLogo.addEventListener('load', () => {
  staliteLogo.hidden = false;
  staliteLogoFallback.hidden = true;
});
if (staliteLogo.complete && staliteLogo.naturalWidth === 0) showLogoFallback();

startSplash();
