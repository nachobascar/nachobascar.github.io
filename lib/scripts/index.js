var buildAndPrintTree = () => {
  const { tree, identifierMapping, yamlTree, htmlTree, jsonTree, textTree } =
    buildTree();

  console.log(htmlTree);
  console.log(textTree);
  console.log(jsonTree);
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
