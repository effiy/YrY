/**
 * Rust function-signature parsing helpers.
 *
 * Pure utilities for walking Rust `parameters` and `function_item` nodes.
 * Pair with `class.js` (struct/enum/trait/impl body extraction) and
 * `import.js` (`use` declaration handling).
 */
import { findChild } from "../base-extractor.js";
/**
 * Extract parameter names from a Rust `parameters` node.
 *
 * Each `parameter` child has a `pattern` field (identifier) and a `type` field.
 * `self_parameter` nodes (&self, &mut self, self) are skipped since they are
 * implicit receivers, not user-facing parameters.
 */
export function extractParams(paramsNode) {
    if (!paramsNode)
        return [];
    const params = [];
    for (let i = 0; i < paramsNode.childCount; i++) {
        const child = paramsNode.child(i);
        if (!child)
            continue;
        if (child.type === "parameter") {
            const pattern = child.childForFieldName("pattern");
            if (pattern) {
                params.push(pattern.text);
            }
        }
        // Skip self_parameter — it's the receiver, not a real parameter
    }
    return params;
}
/**
 * Extract the return type from a function_item node.
 *
 * In tree-sitter-rust, the return type is accessed via the `return_type` named
 * field on function_item. The field value is the type node itself (e.g.
 * primitive_type "bool", type_identifier "Self").
 */
export function extractReturnType(node) {
    const returnType = node.childForFieldName("return_type");
    if (returnType) {
        return returnType.text;
    }
    return undefined;
}
/**
 * Check if a node has a `visibility_modifier` child whose text starts with "pub".
 * Covers `pub`, `pub(crate)`, `pub(super)`, etc.
 */
export function isPublic(node) {
    const visMod = findChild(node, "visibility_modifier");
    return visMod !== null && visMod.text.startsWith("pub");
}
