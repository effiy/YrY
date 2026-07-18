/**
 * C# `using` directive extraction.
 *
 * The C# grammar emits a `using_directive` node for every `using ...;`
 * statement, including aliased usings (`using Alias = Some.Namespace;`).
 * The specifier is the last dotted component so the diagram engine can
 * group imports without exploding node count.
 */
import { findChild, lastComponent } from "../base-extractor.js";
/**
 * Extract the namespace source text from a using_directive.
 *
 * Handles both simple identifiers (`using System;`) and qualified names
 * (`using System.Collections.Generic;`). For aliased usings like
 * `using Alias = Some.Namespace;`, extracts the target namespace.
 */
function extractUsingSource(node) {
    // Check for alias form: `using Alias = Some.Namespace;`
    const hasEquals = findChild(node, "=") !== null;
    if (hasEquals) {
        // The target namespace is the qualified_name after the `=`
        const qualifiedName = findChild(node, "qualified_name");
        return qualifiedName ? qualifiedName.text : null;
    }
    // Simple or qualified using
    const qualifiedName = findChild(node, "qualified_name");
    if (qualifiedName)
        return qualifiedName.text;
    const identifier = findChild(node, "identifier");
    return identifier ? identifier.text : null;
}
/**
 * Extract one `using` directive into the imports array.
 */
export function extractUsing(node, imports) {
    const source = extractUsingSource(node);
    if (!source)
        return;
    imports.push({
        source,
        specifiers: [lastComponent(source)],
        lineNumber: node.startPosition.row + 1,
    });
}
