/**
 * Dart import / export extraction.
 *
 * Tree-sitter emits `import 'foo.dart'` and `export 'foo.dart'` as
 * `import_or_export` nodes wrapping either a `library_import` or
 * `library_export` child. Specifiers (the `show` / `hide` combinator names,
 * or the `as` alias) are attached to the `import_specification`.
 */
import { findChild, findChildren } from "../base-extractor.js";
import { uriText } from "./function.js";
/**
 * Extract an `import 'uri'` directive, including any `show`/`hide` specifiers
 * and the `as` alias. The alias is only treated as a specifier when there
 * are no `show`/`hide` combinators — otherwise it would shadow them.
 */
export function extractLibraryImport(libImport, imports) {
    const spec = findChild(libImport, "import_specification");
    if (!spec)
        return;
    const configurable = findChild(spec, "configurable_uri");
    const uri = configurable ? findChild(configurable, "uri") : null;
    if (!uri)
        return;
    const source = uriText(uri);
    if (!source)
        return;
    const specifiers = [];
    // Combinators come in two flavours:
    //   show Bar, Baz  → leading keyword "show", names are specifiers
    //   hide Qux       → leading keyword "hide", names are excluded — skip
    const combinators = findChildren(spec, "combinator");
    for (const c of combinators) {
        // Inspect the first child to determine show vs hide. The keyword is an
        // unnamed token; use `child()` not `namedChild()`.
        const first = c.child(0);
        if (first && first.type === "hide")
            continue;
        for (const id of findChildren(c, "identifier")) {
            specifiers.push(id.text);
        }
    }
    // `as Foo` → direct `identifier` child of import_specification.
    // Only treat as alias when there were no `show`/`hide` specifiers.
    const asId = findChild(spec, "identifier");
    if (asId && specifiers.length === 0) {
        specifiers.push(asId.text);
    }
    imports.push({
        source,
        specifiers,
        lineNumber: libImport.startPosition.row + 1,
    });
}
/**
 * Extract an `export` directive's URI into `exports[]`.
 *
 * Takes both `libExport` (the `library_export` node containing the URI)
 * and `outerNode` (the wrapping `import_or_export` node). The line number
 * uses `outerNode.startPosition` because `library_export` may start one
 * child deeper than the `export` keyword, while `import_or_export` is
 * guaranteed to start at the keyword.
 */
export function extractLibraryExport(libExport, outerNode, exports) {
    const configurable = findChild(libExport, "configurable_uri");
    const uri = configurable ? findChild(configurable, "uri") : null;
    if (!uri)
        return;
    const source = uriText(uri);
    if (!source)
        return;
    exports.push({
        name: source,
        lineNumber: outerNode.startPosition.row + 1,
    });
}
