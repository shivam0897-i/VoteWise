/**
 * Timeline accordion.
 * Native details/summary keeps the section useful without extra JavaScript.
 */

/**
 * Initialize single-open behavior on the timeline.
 */
export function initTimeline() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  timeline.addEventListener(
    'toggle',
    (event) => {
      const openedStep = event.target;
      if (!(openedStep instanceof HTMLDetailsElement) || !openedStep.open) return;

      const allSteps = timeline.querySelectorAll('details.timeline__step');
      allSteps.forEach((step) => {
        if (step !== openedStep && step.open) {
          step.open = false;
        }
      });
    },
    true
  );
}
