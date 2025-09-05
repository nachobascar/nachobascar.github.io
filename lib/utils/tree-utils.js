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
<html>`;
    if (humanReadable) {
      result += `
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
  }
  const nodeTags = new Set(node.tagName.split(","));
  if (nodeTags.intersection(TAGS_TO_MINIMIZE).size > 0 && !skipMinimization) {
    minimize = true;
  }
  const indent = "  ".repeat(level);
  // const lastTag = node.tagName.split(",").pop().toLowerCase();
  const lastTag = "div";
  result += `    ${indent}<${lastTag} id=${node.id}`;
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

  if (humanReadable) {
    result += ` class="block-element ${
      node.clickable ? "clickable-element" : ""
    }"`;
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
