/**
 * PHP `use` declaration extraction.
 *
 * Three shapes land in `namespace_use_declaration`:
 *   - Simple: `use App\Models\User;`
 *   - Aliased: `use App\Contracts\Repository as Repo;`
 *   - Grouped: `use App\Models\{User, Post};`
 *
 * For grouped use the specifiers share a single line and source, so the
 * helper pushes ONE record containing all specifiers.
 */
import { findChild, findChildren } from "../base-extractor.js";
import { lastSegment } from "./function.js";
/**
 * Reconstruct a fully-qualified name from a `namespace_use_clause`.
 *
 * For a simple clause like `use App\Models\User;`, the clause contains
 * a `qualified_name` with `namespace_name` segments and a trailing `name`.
 * For a grouped clause like `use App\Models\{User, Post};`, the clause
 * is a direct child of `namespace_use_group` and may be a bare `name`.
 */
function extractUseName(clause, prefix) {
    const qualifiedName = findChild(clause, "qualified_name");
    if (qualifiedName) {
        return qualifiedName.text;
    }
    // Inside a grouped use, the clause may just be a `name` node
    const nameNode = findChild(clause, "name");
    if (nameNode && prefix) {
        return prefix + "\\" + nameNode.text;
    }
    if (nameNode) {
        return nameNode.text;
    }
    return clause.text;
}
/**
 * Extract imports from a `namespace_use_declaration` node.
 *
 * Handles:
 * - Simple: `use App\Models\User;`
 * - Aliased: `use App\Contracts\Repository as Repo;`
 * - Grouped: `use App\Models\{User, Post};`
 */
export function extractUseDeclaration(node, imports) {
    // Check for grouped use: `use Namespace\{A, B};`
    const useGroup = findChild(node, "namespace_use_group");
    if (useGroup) {
        // Reconstruct the prefix from the namespace_name preceding the group
        const nsName = findChild(node, "namespace_name");
        const prefix = nsName ? nsName.text : "";
        const clauses = findChildren(useGroup, "namespace_use_clause");
        const specifiers = [];
        for (const clause of clauses) {
            const name = extractUseName(clause, prefix);
            specifiers.push(lastSegment(name));
        }
        const source = prefix
            ? prefix + "\\{" + specifiers.join(", ") + "}"
            : specifiers.join(", ");
        imports.push({
            source,
            specifiers,
            lineNumber: node.startPosition.row + 1,
        });
        return;
    }
    // Simple or aliased use declaration
    const clauses = findChildren(node, "namespace_use_clause");
    for (const clause of clauses) {
        const fqn = extractUseName(clause, "");
        const specifier = lastSegment(fqn);
        imports.push({
            source: fqn,
            specifiers: [specifier],
            lineNumber: node.startPosition.row + 1,
        });
    }
}
