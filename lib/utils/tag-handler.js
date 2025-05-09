var handleElement = function (parsingElement, htmlNode) {
  switch (parsingElement.tagName) {
    case "SELECT":
      return handleSelect(parsingElement, htmlNode);
    case "INPUT":
      return handleInput(parsingElement, htmlNode);
    default:
      return false;
  }
};

var handleSelect = function (parsingElement, htmlNode) {
  const options = htmlNode.querySelectorAll("option");
  const selectOptions = [];
  for (const option of options) {
    selectOptions.push({
      value: option.value,
      label: cleanText(option.textContent),
    });
  }
  parsingElement.options = selectOptions;
  parsingElement.clickable = false;
  parsingElement.value = htmlNode.value;
  return true;
};

var handleInput = function (parsingElement, htmlNode) {
  const inputType = htmlNode.getAttribute("type");
  if (inputType === "checkbox" || inputType === "radio") {
    parsingElement.clickable = true;
    parsingElement.checked = htmlNode.checked;
    parsingElement.value = htmlNode.value;
  }
  return false;
};
