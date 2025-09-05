var FILTERED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "IFRAME",
  "LINK",
  "META",
  "NOSCRIPT",
]);

var TEXT_TAGS = new Set([
  "text",
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LI",
  "BLOCKQUOTE",
  "DIV",
  "SPAN",
  "STRONG",
  "EM",
  "MARK",
  "SMALL",
  "DEL",
  "INS",
  "SUB",
  "SUP",
  "B",
  "I",
  "U",
  "CODE",
  "PRE",
]);

var FORM_TAGS = new Set([
  "FORM",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "FIELDSET",
  "LEGEND",
  "OPTGROUP",
]);

var TAGS_WITHOUT_TEXT = new Set(["IMG", ...FORM_TAGS]);

var CLICKABLE_TAGS = new Set([
  "A",
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "OPTION",
  "LABEL",
]);

var RELEVANT_ATTRIBUTES = new Set([
  "href",
  "src",
  "alt",
  "title",
  "type",
  "role",
  "aria-label",
  // "aria-labelledby",
  // "aria-describedby",
  "placeholder",
  "value",
  // "aria-hidden",
]);

// Tags that are probably not useful for the user
var TAGS_TO_MINIMIZE = new Set(["FOOTER", "HEADER", "NAV", "svg"]);

var TAGS_WITH_SINGLE_CLOSURE = new Set([
  "BR",
  "HR",
  "WBR",
  "AREA",
  "BASE",
  "COL",
  "EMBED",
  "IMG",
  "INPUT",
  "KEYGEN",
  "LINK",
  "META",
  "PARAM",
  "SOURCE",
  "TRACK",
]);

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

// import { CLICKABLE_TAGS } from "./tags.js";

/**
 * Check if the node is likely clickable
 * @param {HTMLElement} node
 * @returns {boolean}
 */
var isLikelyClickable = (node) => {
  if (CLICKABLE_TAGS.has(node.tagName)) {
    return true;
  }

  if (node.hasAttribute("role")) {
    const role = node.getAttribute("role").toLowerCase();
    if (
      role === "button" ||
      role === "link" ||
      role === "checkbox" ||
      role === "radio" ||
      role === "tab" ||
      role === "switch"
    ) {
      return true;
    }
  }
  if (node.hasAttribute("onclick") || node.hasAttribute("href")) {
    return true;
  }

  const computedStyle = window.getComputedStyle(node);
  if (computedStyle.cursor === "pointer") {
    return true;
  }

  return false;
};

var isLikelyHidden = (node) => {
  // if (node.ariaHidden === "true") {
  //   return true;
  // }
  if (node.hidden) {
    return true;
  }
  const computedStyle = window.getComputedStyle(node);
  if (computedStyle.display === "none") {
    return true;
  }
  if (computedStyle.visibility === "hidden") {
    return true;
  }
  // if (computedStyle.opacity === "0") {
  //   return true;
  // }
  // if (computedStyle.width === "0px") {
  //   return true;
  // }
  // if (computedStyle.height === "0px") {
  //   return true;
  // }
  return false;
};

var getUniqueSelector = (el, parentSelector) => {
  var names = [];
  if (el.id) {
    return `#${el.id}`;
  } else {
    if (el == el.ownerDocument.documentElement) names.unshift(el.tagName);
    else {
      for (
        var c = 1, e = el;
        e.previousElementSibling;
        e = e.previousElementSibling, c++
      );
      names.unshift(el.tagName + ":nth-child(" + c + ")");
    }
  }
  const currentSelector = names.join(" > ");
  return parentSelector
    ? `${parentSelector} > ${currentSelector}`
    : currentSelector;
};

var treeToText = (node, level = 0, minimize = false) => {
  const nodeTags = new Set(node.tagName.split(","));
  if (nodeTags.intersection(TAGS_TO_MINIMIZE).size > 0) {
    minimize = true;
  }
  const indent = "  ".repeat(level);
  let result = `${indent}${node.tagName}[ID=${node.id}]`;
  for (const attr in node) {
    if (["tagName", "id", "children", "options", "content"].includes(attr)) {
      continue;
    } else if (
      attr === "src" &&
      node[attr].startsWith("data:") &&
      node[attr].length > 24
    ) {
      // Print only the first 21 characters of data URLs
      result += `[${attr}=${node[attr].slice(0, 21)}...]`;
    } else if (attr === "href" && node[attr].length > 53) {
      // Print only the first 21 characters of href URLs
      result += `[${attr}=${node[attr].slice(0, 50)}...]`;
    } else if (node[attr]) {
      let value = node[attr];
      if (
        typeof value === "string" &&
        !["href", "src", "type"].includes(attr)
      ) {
        value = `"${value.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
      }
      result += `[${attr}=${value}]`;
    }
  }
  if (node.content) {
    result += `: "${node.content.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }
  result += "\n";
  if (node.children) {
    const maxChildren = minimize ? 4 : 10;
    if (node.children.length <= maxChildren) {
      for (const child of node.children) {
        result += treeToText(child, level + 1, minimize);
      }
    } else {
      for (const child of node.children.slice(0, maxChildren / 2)) {
        result += treeToText(child, level + 1, minimize);
      }
      result += `${indent}  ... ${
        node.children.length - maxChildren
      } more (EXPAND_ID=${node.id})\n`;
      for (const child of node.children.slice(
        node.children.length - maxChildren / 2
      )) {
        result += treeToText(child, level + 1, minimize);
      }
    }
  }
  if (node.options) {
    for (const option of node.options || []) {
      result += `${indent}  option: "${option.label
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")}" (value="${option.value}")\n`;
    }
  }
  return result;
};

var exportToYaml = (tree) => {
  return jsyaml.dump(tree, { lineWidth: -1 });
};

var treeToHTML = (
  node,
  {
    level = 0,
    minimize = false,
    skipMinimization = false,
    humanReadable = false,
  }
) => {
  let result = "";
  if (level === 0) {
    result += `<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"UTF-8\">
    <style>
      .block-element {
        display: block; border-radius: 0.5rem; text-align: start;
        padding: 0.5rem; margin: 0.5rem; background-color: #f0f0f0;
        border: 1px solid #ccc; font-size: 0.8rem;
        font-family: Arial, sans-serif;
        text-wrap: pretty;
        width: 90%;
        margin-left: auto;
        margin-right: auto;
      }
      .clickable-element {
        cursor: pointer; background-color: #e0f7fa;
      }
      p {
        margin: 0.5rem 0;
      }
      .attrs {
        font-size: 0.8rem;
        color: #555;
      }
    </style>
  </head>\n`;
  }
  const nodeTags = new Set(node.tagName.split(","));
  if (nodeTags.intersection(TAGS_TO_MINIMIZE).size > 0 && !skipMinimization) {
    minimize = true;
  }
  const indent = "  ".repeat(level);
  // const lastTag = node.tagName.split(",").pop().toLowerCase();
  const lastTag = "div";
  result += `    ${indent}<${lastTag} id=${node.id} class="block-element ${
    node.clickable ? "clickable-element" : ""
  }"`;
  const attrsToAdd = {};
  for (const attr in node) {
    if (
      node[attr] &&
      !["tagName", "id", "children", "options", "content"].includes(attr)
    ) {
      attrsToAdd[attr] = node[attr];
      result += ` ${attr}="${node[attr]}"`;
    }
  }
  result += ">\n";

  result += `    ${indent}`;
  if (humanReadable) {
    result += `  <p>ID=${node.id} `;
    result += `<span class="attrs">${node.tagName.toLowerCase()}`;

    let firstAttr = true;
    for (const [attr, value] of Object.entries(attrsToAdd)) {
      if (["tagName", "id", "children", "options", "content"].includes(attr)) {
        continue;
      }
      if (firstAttr && value) {
        result += `: `;
        firstAttr = false;
      }
      if (attr === "src" && value.startsWith("data:") && value.length > 24) {
        // Print only the first 21 characters of data URLs
        result += ` ${attr} = ${value.slice(0, 21)}...;`;
      } else if (attr === "href" && value.length > 53) {
        // Print only the first 21 characters of href URLs
        result += ` ${attr} = ${value.slice(0, 50)}...;`;
      } else if (value) {
        let newValue = value;
        if (
          typeof value === "string" &&
          !["href", "src", "type"].includes(attr)
        ) {
          newValue = `"${value.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
        }
        result += ` ${attr} = ${newValue};`;
      }
    }

    result += `</span></p>\n`;
  }
  if (node.content || node.value) {
    result += `    ${indent}  <p>`;
    if (node.content) {
      result += `${node.content}`;
    }
    if (node.value) {
      result += ` (value: ${node.value})`;
    }
    result += "</p>\n";
  }

  if (node.children) {
    const maxChildren = minimize ? 4 : skipMinimization ? 9999999999999 : 10;
    if (node.children.length <= maxChildren) {
      for (const child of node.children) {
        result += treeToHTML(child, {
          level: level + 1,
          minimize,
          skipMinimization,
          humanReadable,
        });
      }
    } else {
      for (const child of node.children.slice(0, maxChildren / 2)) {
        result += treeToHTML(child, {
          level: level + 1,
          minimize,
          skipMinimization,
          humanReadable,
        });
      }
      result += `    ${indent}  <p>... ${
        node.children.length - maxChildren
      } more (EXPAND_ID=${node.id})</p>\n`;
      for (const child of node.children.slice(
        node.children.length - maxChildren / 2
      )) {
        result += treeToHTML(child, {
          level: level + 1,
          minimize,
          skipMinimization,
          humanReadable,
        });
      }
    }
  }
  if (node.options) {
    for (const option of node.options || []) {
      // result += `    ${indent}  option: "${option.label
      //   .replace(/"/g, '\\"')
      //   .replace(/\n/g, "\\n")}" (value="${option.value}")\n`;
      result += `    ${indent}  <p>option: "${option.label}"</p>\n`;
    }
  }

  result += `    ${indent}</${lastTag}>\n`;
  if (level === 0) {
    result += `</html>`;
  }
  return result;
};

var cleanText = (text) => {
  // Remove extra spaces and newlines
  return text
    .replace(/\n+/g, "\n")
    .replace(/\t+/g, "\t")
    .replace(/ +/g, " ")
    .trim();
};

// import {
//   CLICKABLE_TAGS,
//   FILTERED_TAGS,
//   RELEVANT_ATTRIBUTES,
//   TEXT_TAGS,
// } from "./tags.js";
// import {
//   cleanText,
//   getUniqueSelector,
//   isLikelyClickable,
//   isLikelyHidden,
// } from "./tree-utils.js";

var identifierMapping = {};

var cntNodeId = 0;
function getId() {
  return cntNodeId++;
}

/**
 * Recursively process all nodes in the DOM tree
 * @param {HTMLBodyElement} node
 * @param {string} [parentSelector]
 */
function processNode(node, parentNode = null, parentSelector = null) {
  if (node.nodeType === 3) {
    const textContent = cleanText(node.textContent);
    if (textContent.length > 0) {
      return {
        id: getId(),
        tagName: "text",
        content: textContent,
        is_text: true,
        clickable: false,
        children: [],
      };
    } else {
      return null;
    }
  }
  if (node.nodeType !== 1) {
    return null;
  }

  if (FILTERED_TAGS.has(node.tagName.toUpperCase()) || isLikelyHidden(node)) {
    return null;
  }
  const uniqueNodeSelector = getUniqueSelector(node, parentSelector);
  const nodeId = getId();
  identifierMapping[nodeId] = uniqueNodeSelector;

  let result = {
    id: nodeId,
    tagName: node.tagName,
    content: "",
    clickable: isLikelyClickable(node),
    is_text: false,
  };

  for (const attr of Object.values(node.attributes)) {
    if (RELEVANT_ATTRIBUTES.has(attr.name) || attr.name.startsWith("aria-")) {
      result[attr.name] = node.getAttribute(attr.name);
    }
  }

  result.children = [];

  const toReturn = handleElement(result, node);
  if (toReturn) {
    return result;
  }

  handleChildren(result, node, uniqueNodeSelector);

  if (result.children.length === 1) {
    const child = result.children[0];
    if (child.is_text) {
      result.content = cleanText(child.content);
      result.children = [];
    } else if (
      !(
        result.clickable &&
        (child.href ||
          child.type === "button" ||
          CLICKABLE_TAGS.has(child.tagName))
      )
    ) {
      const newResult = { ...result, ...child };
      newResult.id = child.id;
      newResult.content = child.content;
      newResult.tagName =
        node.tagName !== child.tagName.split(",")[0]
          ? `${node.tagName},${child.tagName}`
          : child.tagName;
      newResult.clickable = child.clickable || result.clickable;
      newResult.children = child.children;

      result = newResult;
    }
  }

  // If the node is empty and has no children, we can remove it
  if (
    !result.content &&
    result.children.length === 0 &&
    TEXT_TAGS.has(result.tagName)
  ) {
    return null;
  }

  result.is_text =
    TEXT_TAGS.has(result.tagName) &&
    (!result.clickable || parentNode.clickable) &&
    result.children.length === 0;
  if (result.is_text) {
    result.clickable = false;
  }

  return result;
}

function handleChildren(treeNode, htmlNode, parentSelector) {
  const children = htmlNode.childNodes;
  let currentTextNode = null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    const childResult = processNode(child, treeNode, parentSelector);
    if (!childResult) {
      continue;
    }

    // If the child is only content, we can merge it with the current text node
    if (childResult.is_text) {
      const thereWasTextNode = !!currentTextNode;

      // Merge the text node with the current text node
      if (thereWasTextNode) {
        currentTextNode.content += " " + childResult.content;
      } else {
        currentTextNode = childResult;
      }

      // Get the last non-text node index
      const indexTextNode = treeNode.children.indexOf(currentTextNode);
      const indexOfLastNode =
        (indexTextNode > -1 ? indexTextNode : treeNode.children.length) - 1;

      // If the last child is a text node, we can merge with the last non-text node (only if that last node doesn't have children)
      if (
        i === children.length - 1 &&
        indexOfLastNode >= 0 &&
        !treeNode.children[indexOfLastNode].children.length
      ) {
        const lastChild = treeNode.children[indexOfLastNode];
        const childContent = lastChild.content ? lastChild.content + " " : "";
        lastChild.content = childContent + currentTextNode.content;
        if (indexTextNode > -1) {
          treeNode.children.splice(indexTextNode, 1);
        }
        continue;
      }

      // Continue if node was merged
      if (thereWasTextNode) {
        continue;
      }
    } else {
      // IF there was a text node, we can merge it to the current child
      if (currentTextNode) {
        // && !childResult.content) {
        const childContent = childResult.content
          ? " " + childResult.content
          : "";
        childResult.content = currentTextNode.content + childContent;
        const index = treeNode.children.indexOf(currentTextNode);
        if (index > -1) {
          treeNode.children.splice(index, 1);
        }
      }
      currentTextNode = null;
    }
    treeNode.children.push(childResult);
  }
}

function removeAttributes(node) {
  delete node.is_text;
  if (!node.clickable) {
    delete node.clickable;
  }
  if (!node.content) {
    delete node.content;
  }

  for (const child of node.children) {
    removeAttributes(child);
  }
  if (node.children.length === 0) {
    delete node.children;
  }
}

var buildTree = () => {
  const tree = processNode(document.body);
  if (!tree) {
    console.error("No tree found");
  }
  removeAttributes(tree);
  return {
    tree,
    identifierMapping,
    yamlTree: exportToYaml(tree),
    htmlTree: treeToHTML(tree, {
      skipMinimization: true,
      humanReadable: true,
    }),
    jsonTree: JSON.stringify(tree, null, 2),
    textTree: treeToText(tree),
  };
};
