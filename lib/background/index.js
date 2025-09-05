chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      "lib/utils/tags.js",
      "lib/utils/tag-handler.js",
      "lib/utils/tree-utils.js",
      "lib/utils/tree-builder.js",
      "lib/scripts/js-yaml.min.js",
      "lib/scripts/index.js",
      // "tree-builder-merged.js",
    ],
  });
});
