/**
 * Rust `use` declaration extraction.
 *
 * The Rust grammar emits `use_declaration` nodes whose `argument` field
 * can be one of four shapes:
 *   - `identifier`             `use foo;`
 *   - `scoped_identifier`      `use std::collections::HashMap;`
 *   - `scoped_use_list`        `use std::io::{self, Read, Write};`
 *   - `use_wildcard`           `use std::prelude::*;`
 *
 * Each shape collapses to the shared `{source, specifiers[], lineNumber}`
 * record so the diagram engine can filter uniformly.
 */
import { findChild } from "../base-extractor.js";
/**
 * Recursively extract the path portion of a scoped_identifier.
 *
 * `scoped_identifier` nests: `std::collections::HashMap` is
 * scoped_identifier(path: scoped_identifier(path: identifier "std", name: identifier "collections"), name: identifier "HashMap")
 *
 * This function collects all path segments into a flat "a::b::c" string,
 * excluding the final `name` (which is the imported specifier).
 */
function extractScopedPath(node) {
    if (node.type === "scoped_identifier") {
        const pathNode = node.childForFieldName("path");
        const nameNode = node.childForFieldName("name");
        const name = nameNode ? nameNode.text : "";
        const path = pathNode ? pathNode.text : "";
        return { path, name };
    }
    // Bare identifier: `use foo;`
    return { path: "", name: node.text };
}
/**
 * Extract one `use` declaration into the imports array.
 */
export function extractUseDeclaration(node, imports) {
    const argument = node.childForFieldName("argument");
    if (!argument)
        return;
    switch (argument.type) {
        case "identifier":
            // `use foo;`
            imports.push({
                source: argument.text,
                specifiers: [argument.text],
                lineNumber: node.startPosition.row + 1,
            });
            break;
        case "scoped_identifier": {
            // `use std::collections::HashMap;`
            const { path, name } = extractScopedPath(argument);
            imports.push({
                source: path,
                specifiers: [name],
                lineNumber: node.startPosition.row + 1,
            });
            break;
        }
        case "scoped_use_list": {
            // `use std::io::{self, Read, Write};`
            const pathNode = argument.childForFieldName("path");
            const listNode = argument.childForFieldName("list");
            const source = pathNode ? pathNode.text : "";
            const specifiers = [];
            if (listNode) {
                for (let j = 0; j < listNode.childCount; j++) {
                    const ch = listNode.child(j);
                    if (!ch)
                        continue;
                    if (ch.type === "self" || ch.type === "identifier") {
                        specifiers.push(ch.text);
                    }
                    else if (ch.type === "scoped_identifier") {
                        // Nested scoped identifier inside a use list
                        specifiers.push(ch.text);
                    }
                }
            }
            imports.push({
                source,
                specifiers,
                lineNumber: node.startPosition.row + 1,
            });
            break;
        }
        case "use_wildcard": {
            // `use std::prelude::*;`
            // The path is the scoped_identifier child
            const scopedId = findChild(argument, "scoped_identifier");
            const source = scopedId ? scopedId.text : "";
            imports.push({
                source,
                specifiers: ["*"],
                lineNumber: node.startPosition.row + 1,
            });
            break;
        }
        default: {
            // Fallback for any unhandled pattern
            imports.push({
                source: argument.text,
                specifiers: [argument.text],
                lineNumber: node.startPosition.row + 1,
            });
            break;
        }
    }
}
