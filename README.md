# Thesis-CNT-Builder

This repository contains a Chrome Extension that allows to parse any webpage and convert it into a structured simplified format optimized for LLM's understanding.

# Repository Structure
- `examples/`: Contains examples of the parsed HTML in optimized LLM format. Each example is a folder containing the following files:
  - `README.md`: A description of the example, its contents and links to the source and parsed HTML.
  - `output.html`: The parsed CNT in HTML format (non-LLM format), used to visualize the representation of the tree in a more human-readable way.
- `lib/`: Contains the source code of the Chrome Extension
- `prompts/`: Contains a set of prompts used for testing the CNT into different AI Agents. The agents tested are the following:
  - `operator.md`: An operator that cares of talking to the user, understanding its needs and objectives, requiring the information needed to solve the objective and creating a plan to achieve it.
  - `agent.md`: An agent that solves the current step of the plan. It receives the CNT with some metadata. It returns one action to execute in order to solve the step, and a boolean indicating if the step was solved or not. The actions can be:
    - `go_to`: Navigating to a URL
    - `go_back`: Going back to the previous page (First in history)
    - `click`: Clicking an element
    - `write`: Writing into an element. This works for filling forms, input fields, or even selects and checkboxes (by writing the value of the option. This needs to be the exact value, not the label)
    - `expand`: Expanding a node to see the missing information
    - `describe_image`: Used for describing an image if you think it is relevant for the step solution. Any node that has the attribute "src" can be selected by this action.
    - `talk`: Talking to the user. You are the only one in control of the browser, so you can talk to the user and give them information about the current step. You can also ask for more information if needed.
    - `no_action`: No action needed. This is used when the step was already solved and no further action is needed. 
  - `corrector.md`: An agent that checks if the current step was actually solved or not. It gets called once the `agent.md` returns that a step was solved. It receives the updated CNT after the action was executed, checks if the step was actually solved, and if not it returns a feedback into the `agent.md` to solve the step again.
  - `lookup.md`: An agent that finds out the ID of the relevant node for solving an action.

# CNT Rules
The CNT format is a simplified version of the HTML DOM, where each node is represented in a tree structure. The rules for creating a CNT are as follows:
1. **Node Representation**: Each node in the tree is a simplified HTML element. Which can contain useful attributes (like aria-*, role, href, src, etc.) and custom attributes (like ID, clickable, etc.) to provide additional information about the node.
   - Nodes can contain children nodes, which are represented as an array of nodes.
   - To avoid showing too much information, nodes with many children are compressed, showing only some of the starting and ending children, with a compression ID in the middle showing how many children are compressed. The node can be expanded with the ID of the same node.
2. **Filtering**: The nodes are filtered by a variety of criteria, including:
   - **Node Type**: All nodes belonging to the following types are excluded: `script`, `style`, `meta`, `link`. Also any node that is not a valid HTML element or a text node are excluded (i.e. comments, etc.).
   - **Visibility**: Only visible nodes are included in the CNT. For example, nodes with `display: none` or `visibility: hidden` are excluded.
   - **Text Content**: Nodes supposed to contain text (no actions or images, i.e. div, p, span, etc.) that are empty (no text nor children) are excluded.
3. **Merging**: To further simplify the CNT, nodes can be merged with the following rules:
   - **Text Nodes**: Text nodes (nodes without actions, children or images) which are adjacent to each other are merged into a single node, with their text content being concatenated. This happens also recursively
   - **Text Appropiation**: 
     - Merged text nodes can be prepended into the next non-text sibling node. For example, links or buttons can get the past text context into their own context.
     - Merged text nodes can also be apended into the previous non-text sibling only if all the following conditions are met:
        1. The text node is the last child of the parent node
        2. The non-text sibling doesn't have any children
   - **Node with one child**: Nodes with only one child can be merged with their child with the following cases:
     - If the child is a text node, the parent removes the child and takes its text content.
     - Else If the parent is not clickable, or the child is not a button, link or clickable tag (i.e. a, button, input, select, label, etc.) then we can merge them: 
       - The parent consumes the child attributes (including ID, text-content, children, etc.)
       - The parent is set to clickable if either the parent or the child is clickable
       - If the tags are different, they get merged as `parent_tag,child_tag`
         > Note this is recursive, as child could be already a merged node with many merged tags
       - The child is removed from the tree