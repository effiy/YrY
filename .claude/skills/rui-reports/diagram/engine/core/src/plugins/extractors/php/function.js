/**
 * PHP function-signature parsing helpers.
 *
 * Pure utilities for walking PHP `formal_parameters` and the return-type
 * children of `function_definition` / `method_declaration` nodes.
 */
import { findChild, findChildren } from "../base-extractor.js";
/**
 * Extract parameter names from a PHP `formal_parameters` node.
 *
 * Each child is a `simple_parameter` containing an optional type hint
 * and a `variable_name` node (which itself has `$` + `name` children).
 * We extract the variable name prefixed with `$`.
 */
export function extractParams(paramsNode) {
    if (!paramsNode)
        return [];
    const params = [];
    const simpleParams = findChildren(paramsNode, "simple_parameter");
    for (const param of simpleParams) {
        const varName = findChild(param, "variable_name");
        if (varName) {
            params.push(varName.text);
        }
    }
    return params;
}
/**
 * Extract a return type string from the siblings following the `formal_parameters`
 * in a function_definition or method_declaration node.
 *
 * In tree-sitter-php, the return type appears as a sibling after `:` and can be:
 * - `primitive_type` (string, int, void, bool, etc.)
 * - `named_type` (User, Repository, etc.)
 * - `optional_type` (?string, ?User)
 * - `union_type` (string|int)
 */
export function extractReturnType(node) {
    // Walk children looking for the colon separator that precedes the return type.
    // The return type node follows the `:` and precedes the `compound_statement` (body).
    let foundColon = false;
    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (!child)
            continue;
        if (child.type === ":" && child.text === ":") {
            foundColon = true;
            continue;
        }
        if (foundColon) {
            // The next non-punctuation node after `:` is the return type
            if (child.type === "primitive_type" ||
                child.type === "named_type" ||
                child.type === "optional_type" ||
                child.type === "union_type") {
                return child.text;
            }
        }
    }
    return undefined;
}
/**
 * Extract the last segment (class/interface name) from a fully-qualified name.
 * e.g., "App\Models\User" -> "User"
 */
export function lastSegment(fqn) {
    const parts = fqn.split("\\");
    return parts[parts.length - 1];
}
