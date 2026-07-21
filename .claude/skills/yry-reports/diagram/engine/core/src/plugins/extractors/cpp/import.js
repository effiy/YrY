/**
 * C/C++ #include directive extraction.
 *
 * The `preproc_include` node wraps a `path` field that takes two shapes:
 *   - `system_lib_string` for angle-bracket includes: `<iostream>`
 *   - `string_literal` for quoted includes: `"myfile.h"`
 *
 * Both flavors land in the shared `imports[]` list with the same
 * `specifiers` shape used by the other extractors so the diagram engine
 * can filter uniformly.
 */
import { findChild } from "../base-extractor.js";
/**
 * Extract one `#include` directive.
 *
 * @param node  - preproc_include tree-sitter node
 * @param imports - output array to push into
 */
export function extractInclude(node, imports) {
    const pathNode = node.childForFieldName("path");
    if (!pathNode)
        return;
    let source;
    if (pathNode.type === "system_lib_string") {
        // Strip angle brackets: <iostream> -> iostream
        source = pathNode.text.replace(/^<|>$/g, "");
    }
    else if (pathNode.type === "string_literal") {
        // Extract content from string: "myfile.h" -> myfile.h
        const content = findChild(pathNode, "string_content");
        source = content ? content.text : pathNode.text.replace(/^"|"$/g, "");
    }
    else {
        source = pathNode.text;
    }
    imports.push({
        source,
        specifiers: [source],
        lineNumber: node.startPosition.row + 1,
    });
}
