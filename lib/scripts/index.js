var buildAndPrintTree = () => {
  const { tree, identifierMapping } = buildTree();

  console.log(treeToHTML(tree));
  console.log(treeToText(tree));
  // navigator.clipboard
  //   .writeText(JSON.stringify(identifierMapping, null, 2))
  //   .then(() => {
  //     console.log("Identifier mapping copied to clipboard");
  //   })
  //   .catch((err) => {
  //     console.error("Failed to copy identifier mapping: ", err);
  //   });
};

buildAndPrintTree();
