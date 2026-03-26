// ===========================
// AUTOFILL FORM (does not override existing values)
// ===========================
const autofillForm = () => {
  const inputs = document.querySelectorAll('input, textarea, select');

  let filledCount = 0;

  inputs.forEach((el) => {
    if (el.value && el.value.trim() !== '') return;

    const type = el.type.toLowerCase();

    if (type === 'text' || el.tagName.toLowerCase() === 'textarea') {
      el.value = 'lorem ipsum dolor sit amet consectetur adipiscing';
      filledCount++;
    } else if (type === 'email') {
      el.value = 'john@example.com';
      filledCount++;
    } else if (type === 'tel') {
      el.value = '555-123-4567';
      filledCount++;
    } else if (type === 'number') {
      el.value = '42';
      filledCount++;
    } else if (el.tagName.toLowerCase() === 'select') {
      if (el.options.length > 0) {
        el.selectedIndex = 0;
        filledCount++;
      }
    }
  });

  alert(`Autofilled ${filledCount} fields!`);
};

const toggleAutofill = () => {
  autofillForm();
};
