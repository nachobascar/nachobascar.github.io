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
  if (node.value) {
    result.value = node.value;
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
      humanReadable: false,
    }),
    jsonTree: JSON.stringify(tree, null, 2),
    textTree: treeToText(tree),
  };
};
