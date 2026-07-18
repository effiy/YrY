/**
 * Dart function-signature parsing helpers.
 *
 * Pure utilities that walk a tree-sitter `function_signature` /
 * `formal_parameter_list` / `formal_parameter` node and return primitive
 * values (name, params, return type, etc.). They never touch the
 * `functions` / `classes` / `exports` arrays — that wiring lives in
 * `class.js` and `index.js`.
 */
import { findChild, findChildren, getStringValue } from "../base-extractor.js";
/**
 * Whether a Dart name is exported.
 *
 * Dart's visibility rule is name-based and the INVERSE of Kotlin's: names
 * starting with `_` are library-private, everything else is exported. There
 * is no `public` / `private` keyword to inspect — only the leading character.
 */
export function isExported(name) {
    return !name.startsWith("_");
}
/**
 * Extract the identifier name from a `function_signature` node.
 *
 * NOTE: this helper expects a `function_signature` node. The Dart grammar
 * wraps the function_signature inside two different parent shapes:
 *   - `method_signature > function_signature` for CONCRETE class methods.
 *   - `declaration > function_signature` for ABSTRACT class methods (no body).
 * Callers (`collectClassBody`) unwrap to the inner `function_signature`
 * before invoking this helper.
 */
export function extractFunctionName(sig) {
    const id = findChild(sig, "identifier");
    return id ? id.text : null;
}
/**
 * Extract the user-visible name from a `formal_parameter` (or one of its
 * specialized children).
 *
 * Three shapes seen in the AST:
 *   - Regular     `Type name`     → `formal_parameter > { type_identifier, identifier }`
 *   - This-init   `this.field`    → `formal_parameter > constructor_param > { this, ., identifier }`
 *   - Super-init  `super.field`   → `formal_parameter > super_formal_parameter > { super, ., identifier }`
 *
 * Strategy: scan all direct children for an `identifier`; if absent, recurse
 * one level into `constructor_param` / `super_formal_parameter` and pick the
 * LAST identifier (the field name in `this.field`).
 */
export function extractParamName(paramNode) {
    // Direct identifier child wins (regular `Type name` parameter).
    const direct = findChild(paramNode, "identifier");
    if (direct)
        return direct.text;
    // Nested wrappers — pick the last identifier we can find inside.
    for (let i = 0; i < paramNode.childCount; i++) {
        const child = paramNode.child(i);
        if (!child)
            continue;
        if (child.type === "constructor_param" || child.type === "super_formal_parameter") {
            let last = null;
            for (let j = 0; j < child.childCount; j++) {
                const inner = child.child(j);
                if (inner && inner.type === "identifier")
                    last = inner.text;
            }
            if (last)
                return last;
        }
    }
    return null;
}
/**
 * Extract parameter names from a `formal_parameter_list`.
 *
 * Walks both required parameters (`formal_parameter` direct children) and the
 * `optional_formal_parameters` wrapper, which the Dart grammar uses for BOTH
 * optional positional `[...]` and named `{...}` parameters (the leading
 * unnamed `[` vs `{` token distinguishes them — we don't need to for the
 * project graph, both go into the same `params[]` list).
 *
 * Drops `this.x` and `super.x` initializer parameters' types and surfaces
 * just the field name (see `extractParamName`).
 */
export function extractParams(sig) {
    const params = [];
    const list = findChild(sig, "formal_parameter_list");
    if (!list)
        return params;
    for (let i = 0; i < list.childCount; i++) {
        const child = list.child(i);
        if (!child)
            continue;
        if (child.type === "formal_parameter") {
            const name = extractParamName(child);
            if (name)
                params.push(name);
        }
        else if (child.type === "optional_formal_parameters") {
            // Walk one level deeper — children are again `formal_parameter`.
            for (const sub of findChildren(child, "formal_parameter")) {
                const name = extractParamName(sub);
                if (name)
                    params.push(name);
            }
        }
    }
    return params;
}
/**
 * Extract the return type from a function_signature. The return type is the
 * sequence of NAMED children that appear before the function name
 * (`identifier`) or `formal_parameter_list`. If there is no such child, the
 * function has no declared return type (Dart infers it).
 *
 * Common shapes seen during AST probing:
 *   `int add(int a, int b)` →  [type_identifier "int"]
 *   `void noop()`           →  [void_type]
 *   `Future<String> fetch()`→  [type_identifier "Future", type_arguments "<String>"]
 *
 * For generic types the grammar emits the base type and the type arguments as
 * separate sibling nodes, so we collect ALL nodes before `identifier` and
 * concatenate their text to reconstruct the full type spelling.
 */
export function extractReturnType(sig) {
    const parts = [];
    for (let i = 0; i < sig.childCount; i++) {
        const child = sig.child(i);
        if (!child || !child.isNamed)
            continue;
        if (child.type === "identifier" ||
            child.type === "formal_parameter_list" ||
            child.type === "type_parameters") {
            // Reached the function NAME (`identifier`), the parameter list, or the
            // generic-parameter list (`type_parameters` is the function's own
            // generics, e.g. `<T>` in `T fn<T>(T x)`). Anything we passed before
            // this point WAS the return type; if we hit this stop without having
            // collected anything, the function has no declared return type.
            break;
        }
        parts.push(child.text);
    }
    return parts.length > 0 ? parts.join("") : undefined;
}
/**
 * Push a method/function entry. Used by `collectClassBody` for both
 * `method_signature` and `declaration > function_signature` shapes so a
 * future change to the entry's fields lands in one place.
 */
export function pushMethod(declNode, sig, name, methods, functions, exports, isExportedFn) {
    methods.push(name);
    functions.push({
        name,
        lineRange: [declNode.startPosition.row + 1, declNode.endPosition.row + 1],
        params: extractParams(sig),
        returnType: extractReturnType(sig),
    });
    if (isExportedFn(name)) {
        exports.push({ name, lineNumber: declNode.startPosition.row + 1 });
    }
}
/**
 * Unwrap the string-literal text from `uri > string_literal` via
 * `base-extractor.getStringValue` so the quote-stripping logic lives in
 * exactly one place across all extractors.
 */
export function uriText(uriNode) {
    const lit = findChild(uriNode, "string_literal");
    if (!lit)
        return null;
    return getStringValue(lit);
}
/**
 * Build a constructor's method-graph name from a constructor_signature /
 * factory_constructor_signature node:
 *   - one identifier  → unnamed constructor, name = "<Class>"
 *   - two identifiers → named constructor,   name = "<Class>.<named>"
 *
 * Returns null when no identifier is present (defensive — should not happen
 * for a real constructor declaration).
 *
 * Probe findings (2026-06-13): the plan's claimed AST shapes match exactly.
 *   - Unnamed: constructor_signature { identifier[Foo], formal_parameter_list }
 *   - Named:   constructor_signature { identifier[Foo], identifier[zero], formal_parameter_list, ... }
 *   - Factory: factory_constructor_signature { <unnamed "factory">, identifier[Foo], identifier[fromString], formal_parameter_list }
 * extractReturnType returns undefined for all three (factory keyword is unnamed,
 * so it is skipped; the loop stops at the first identifier).
 */
export function constructorName(sig) {
    const ids = findChildren(sig, "identifier");
    if (ids.length === 0)
        return null;
    if (ids.length === 1)
        return ids[0].text;
    return `${ids[0].text}.${ids[1].text}`;
}
