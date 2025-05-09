// import buildTree from "../utils/tree-builder.js";
// import { treeToText } from "../utils/tree-utils.js";

var buildAndPrintTree = () => {
  // Delay for 5 seconds to allow the page to load
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  const { tree, identifierMapping } = buildTree();
  const text = treeToHTML(tree);

  console.log(text);
  navigator.clipboard
    .writeText(JSON.stringify(identifierMapping, null, 2))
    .then(() => {
      console.log("Identifier mapping copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy identifier mapping: ", err);
    });
};
// document
//   .getElementById("buildAndPrintCNT")
//   .addEventListener("click", function () {
//     buildAndPrintTree;
//   });

buildAndPrintTree();
