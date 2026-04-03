// ===========================
// AUTOFILL FORM (does not override existing values)
// ===========================
const getValueSetter = (el) => {
  const tag = el.tagName.toLowerCase();
  const proto = tag === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  return Object.getOwnPropertyDescriptor(proto, 'value')?.set || null;
};

const inferFieldType = (el) => {
  const rawType = (el.type || '').toLowerCase();
  const hints = `${el.name || ''} ${el.id || ''} ${el.placeholder || ''} ${el.getAttribute('aria-label') || ''}`.toLowerCase();

  if (rawType === 'email' || /email|e-mail/.test(hints)) return 'email';
  if (rawType === 'tel' || /phone|tel|mobile/.test(hints)) return 'tel';
  if (rawType === 'number' || /amount|qty|quantity|count|age|number/.test(hints)) return 'number';
  if (rawType) return rawType;

  return 'text';
};

const setFieldValueLikeUserInput = (el, value) => {
  if (typeof el.focus === 'function') {
    el.focus({ preventScroll: true });
  }

  const setter = getValueSetter(el);
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }

  el.setAttribute('value', value);

  // Some reactive frameworks listen to beforeinput/input/change in sequence.
  try {
    el.dispatchEvent(new InputEvent('beforeinput', {
      bubbles: true,
      composed: true,
      cancelable: true,
      data: value,
      inputType: 'insertText'
    }));
  } catch (_err) {
    // Ignore when InputEvent is unavailable.
  }

  try {
    el.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      composed: true,
      data: value,
      inputType: 'insertText'
    }));
  } catch (_err) {
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

  if (typeof el.blur === 'function') {
    el.blur();
  }
};

const setSelectValue = (el) => {
  if (el.options.length === 0) return false;

  const option = Array.from(el.options).find((opt) => {
    if (opt.disabled || !opt.value) return false;
    return !/select|choose|pick/i.test((opt.textContent || '').toLowerCase());
  });

  if (option) {
    el.value = option.value;
  } else {
    el.selectedIndex = 0;
  }

  el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  if (typeof el.blur === 'function') {
    el.blur();
  }

  return true;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isVisiblyRendered = (node) => {
  if (!node) return false;
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const getVisibleOptionCandidates = (scope) => {
  const nodes = Array.from(scope.querySelectorAll('[role="option"], .v-list-item'));
  return nodes.filter((node) => {
    if (node.getAttribute('aria-disabled') === 'true') return false;
    if (node.classList.contains('v-list-item--disabled')) return false;

    const text = (node.textContent || '').trim();
    if (!text) return false;
    if (/select|choose|pick/.test(text.toLowerCase())) return false;

    return isVisiblyRendered(node);
  });
};

const triggerClickSequence = (target) => {
  if (!target) return;
  target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
  target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
  target.click();
};

const setComboboxValue = async (el) => {
  if (el.getAttribute('role') !== 'combobox') return false;
  if ((el.value || '').trim() !== '') return false;

  const comboRoot = el.closest('.v-field[role="combobox"], [role="combobox"]') || el;
  const menuIcon = el.closest('.v-autocomplete, .v-select')?.querySelector('.v-autocomplete__menu-icon, .v-select__menu-icon, [aria-label="Open"]');

  if (typeof el.focus === 'function') {
    el.focus({ preventScroll: true });
  }

  triggerClickSequence(comboRoot);
  triggerClickSequence(menuIcon);
  triggerClickSequence(el);
  el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

  // Many component libraries render options asynchronously in overlays.
  const popupId = el.getAttribute('aria-controls')
    || el.getAttribute('aria-owns')
    || comboRoot.getAttribute('aria-controls')
    || comboRoot.getAttribute('aria-owns');

  let candidates = [];
  for (let i = 0; i < 8; i++) {
    const directPopup = popupId ? document.getElementById(popupId) : null;
    const scopes = [];

    if (directPopup) {
      scopes.push(directPopup);
    }

    const overlayRoot = document.querySelector('.v-overlay-container');
    if (overlayRoot) {
      scopes.push(overlayRoot);
    }

    scopes.push(document);

    for (const scope of scopes) {
      candidates = getVisibleOptionCandidates(scope);
      if (candidates.length > 0) break;
    }

    if (candidates.length > 0) {
      break;
    }

    await delay(70);
  }

  if (candidates.length > 0) {
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    triggerClickSequence(picked);
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    comboRoot.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    if (typeof el.blur === 'function') {
      el.blur();
    }

    return true;
  }

  // Keyboard fallback for custom comboboxes that only react to keys.
  el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
  el.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true, composed: true }));
  await delay(20);
  el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
  el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true, composed: true }));
  el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

  if (typeof el.blur === 'function') {
    el.blur();
  }

  return (el.value || '').trim() !== '';
};

const getRadioGroupKey = (radio, index) => {
  const formMarker = radio.form?.id || radio.form?.name || 'no-form';
  const groupName = radio.name || radio.getAttribute('aria-label') || `radio-${index}`;
  return `${formMarker}::${groupName}`;
};

const fillRadioGroup = (radio) => {
  const escapedName = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(radio.name || '')
    : (radio.name || '').replace(/([\\"'])/g, '\\$1');

  const group = radio.name
    ? Array.from(document.querySelectorAll(`input[type="radio"][name="${escapedName}"]`))
    : [radio];

  const candidates = group.filter((item) => !item.disabled && !item.readOnly);
  if (candidates.length === 0) return false;

  if (candidates.some((item) => item.checked)) return false;

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  if (typeof picked.focus === 'function') {
    picked.focus({ preventScroll: true });
  }

  // Click most closely matches a user action for reactive radio groups.
  picked.click();
  picked.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  picked.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

  if (typeof picked.blur === 'function') {
    picked.blur();
  }

  return true;
};

const autofillForm = async () => {
  const inputs = document.querySelectorAll('input, textarea, select');
  const processedRadioGroups = new Set();

  let filledCount = 0;

  for (const [index, el] of Array.from(inputs).entries()) {
    if (el.disabled || el.readOnly) continue;

    if (el.matches('input[type="hidden"], input[type="submit"], input[type="button"], input[type="reset"], input[type="file"]')) {
      continue;
    }

    if (el.type === 'checkbox') {
      if (el.checked) continue;
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      filledCount++;
      continue;
    }

    if (el.type === 'radio') {
      const groupKey = getRadioGroupKey(el, index);
      if (processedRadioGroups.has(groupKey)) continue;
      processedRadioGroups.add(groupKey);

      if (fillRadioGroup(el)) {
        filledCount++;
      }
      continue;
    }

    if (await setComboboxValue(el)) {
      filledCount++;
      continue;
    }

    if ((el.value || '').trim() !== '') continue;

    const type = inferFieldType(el);

    if (type === 'text' || el.tagName.toLowerCase() === 'textarea') {
      setFieldValueLikeUserInput(el, 'lorem ipsum dolor sit amet consectetur adipiscing');
      filledCount++;
    } else if (type === 'email') {
      setFieldValueLikeUserInput(el, 'john@example.com');
      filledCount++;
    } else if (type === 'tel') {
      setFieldValueLikeUserInput(el, '555-123-4567');
      filledCount++;
    } else if (type === 'number') {
      setFieldValueLikeUserInput(el, '42');
      filledCount++;
    } else if (el.tagName.toLowerCase() === 'select') {
      if (setSelectValue(el)) {
        filledCount++;
      }
    }
  }

  alert(`Autofilled ${filledCount} fields!`);
};

const toggleAutofill = () => {
  autofillForm();
};
