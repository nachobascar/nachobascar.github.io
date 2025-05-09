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
