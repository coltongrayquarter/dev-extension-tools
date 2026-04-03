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

const autofillForm = () => {
  const inputs = document.querySelectorAll('input, textarea, select');

  let filledCount = 0;

  inputs.forEach((el) => {
    if (el.disabled || el.readOnly) return;

    if (el.matches('input[type="hidden"], input[type="submit"], input[type="button"], input[type="reset"], input[type="file"]')) {
      return;
    }

    if ((el.value || '').trim() !== '') return;

    if (el.type === 'checkbox') {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      filledCount++;
      return;
    }

    if (el.type === 'radio') {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      filledCount++;
      return;
    }

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
  });

  alert(`Autofilled ${filledCount} fields!`);
};

const toggleAutofill = () => {
  autofillForm();
};
