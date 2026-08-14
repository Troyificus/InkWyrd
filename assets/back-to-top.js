// Floating "back to top" button. Appears once the page has been scrolled
// down a meaningful amount (these forms are long), stays fixed in the
// corner, and smooth-scrolls back to the top on click.

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.textContent = '\u2191 Top';
  btn.hidden = true;
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    btn.hidden = window.scrollY < 400;
  }, { passive: true });
});
