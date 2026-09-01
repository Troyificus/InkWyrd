// Replaces every <input list="..."> + <datalist> pair on the page with a
// custom-built dropdown.
//
// Native <datalist> has two problems that can't be fixed with CSS: it's
// rendered by the browser/OS, not the page, so it can't be restyled or
// repositioned, and every major browser filters the suggestion list down
// to only options matching what's already typed. That's reasonable for a
// huge autocomplete list, but for a short, fixed vocabulary (Solo/Bruiser/
// Skulk/..., Medium/Large/..., etc.) it means typing "Solo" hides every
// other option instead of letting you glance at all of them and pick.
//
// This keeps the same underlying <input data-field="..."> as the source
// of truth (so existing card-binding, save, and import/export logic needs
// zero changes) and layers a fully custom, always-shows-everything
// dropdown on top, styled with the page's own CSS instead of the browser's.

function initCombobox(input) {
  const listId = input.getAttribute('list');
  if (!listId) return;
  const datalist = document.getElementById(listId);
  if (!datalist) return;
  const options = Array.from(datalist.querySelectorAll('option')).map(o => o.value);

  // Suppress the native popup entirely. We're replacing it, not
  // supplementing it.
  input.removeAttribute('list');
  input.setAttribute('autocomplete', 'off');

  const wrapper = document.createElement('div');
  wrapper.className = 'combobox-wrapper';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const dropdown = document.createElement('ul');
  dropdown.className = 'combobox-dropdown';
  dropdown.hidden = true;
  wrapper.appendChild(dropdown);

  function renderOptions() {
    dropdown.innerHTML = '';
    options.forEach(opt => {
      const li = document.createElement('li');
      li.textContent = opt;
      // mousedown (not click) fires before the input's blur event, so the
      // value gets set before the dropdown closes itself on blur.
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = opt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        closeDropdown();
      });
      dropdown.appendChild(li);
    });
  }

  function openDropdown() {
    renderOptions();
    dropdown.hidden = false;
  }
  function closeDropdown() {
    dropdown.hidden = true;
  }

  input.addEventListener('focus', openDropdown);
  input.addEventListener('click', openDropdown);
  input.addEventListener('blur', () => setTimeout(closeDropdown, 150));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[list]').forEach(initCombobox);
});
