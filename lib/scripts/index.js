var buildAndPrintTree = () => {
  const { tree, identifierMapping, yamlTree, htmlTree, jsonTree, textTree } =
    buildTree();

  console.log(htmlTree);
  // console.log(textTree);
  // console.log(jsonTree);
};

buildAndPrintTree();
