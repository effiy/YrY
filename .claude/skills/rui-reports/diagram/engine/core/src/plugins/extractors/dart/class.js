/**
 * Dart class-body collection.
 *
 * Walks a `class_body` / `extension_body` / `enum_body` and groups members
 * into the `methods[]`, `properties[]`, `functions[]` and `exports[]`
 * arrays. Pair with `function.js` for signature parsing.
 */
import { findChild, findChildren } from "../base-extractor.js";
import {
    extractFunctionName,
    extractParams,
    extractReturnType,
    isExported,
    pushMethod,
    constructorName,
} from "./function.js";
/**
 * Signature types to probe inside a `method_signature` member, paired with
 * the name extractor for each. Factory constructors use `constructorName`
 * (two-identifier `Class.named` shape); the others use `extractFunctionName`.
 * Order mirrors the original explicit if/else chain — first match wins, and
 * a match with a null name still short-circuits (does not fall through to
 * the next type).
 */
const METHOD_SIG_EXTRACTORS = [
    { type: "factory_constructor_signature", nameFn: constructorName },
    { type: "getter_signature", nameFn: extractFunctionName },
    { type: "setter_signature", nameFn: extractFunctionName },
    { type: "function_signature", nameFn: extractFunctionName },
];
/**
 * Signature types to probe inside a `declaration` member. Regular
 * constructors use `constructorName`; abstract getters/setters/methods use
 * `extractFunctionName`.
 */
const DECL_SIG_EXTRACTORS = [
    { type: "constructor_signature", nameFn: constructorName },
    { type: "getter_signature", nameFn: extractFunctionName },
    { type: "setter_signature", nameFn: extractFunctionName },
    { type: "function_signature", nameFn: extractFunctionName },
];
/**
 * Try each signature extractor in order against `member`. On the first
 * signature child found, push a method entry (if the name resolved) and
 * return true. Returns false when no signature child matched, so the
 * caller can fall through to field-declaration handling.
 */
function tryExtractMethod(member, extractors, methods, functions, exports) {
    for (const { type, nameFn } of extractors) {
        const sig = findChild(member, type);
        if (!sig)
            continue;
        const name = nameFn(sig);
        if (name)
            pushMethod(member, sig, name, methods, functions, exports, isExported);
        return true;
    }
    return false;
}
/**
 * Walk a `class_body` (or `extension_body` / `enum_body`) and collect
 * `method_signature` declarations into the class's `methods` array AND the
 * top-level `functions` array, mirroring KotlinExtractor.collectClassBody.
 *
 * Field extraction: `int count = 0;` and `String? label;` inside a class body
 * both parse as `declaration > initialized_identifier_list > initialized_identifier
 * > identifier`. The nullable `?` is an unnamed sibling of `type_identifier`,
 * so it does not affect this path.
 */
export function collectClassBody(body, methods, properties, functions, exports) {
    for (let i = 0; i < body.childCount; i++) {
        const member = body.child(i);
        if (!member)
            continue;
        if (member.type === "method_signature") {
            if (tryExtractMethod(member, METHOD_SIG_EXTRACTORS, methods, functions, exports))
                continue;
        }
        else if (member.type === "declaration") {
            if (tryExtractMethod(member, DECL_SIG_EXTRACTORS, methods, functions, exports))
                continue;
            // Field declaration — surface initialized_identifier names as properties.
            // Comma-lists like `int a, b, c;` produce multiple initialized_identifier
            // children inside a single initialized_identifier_list.
            const list = findChild(member, "initialized_identifier_list");
            if (!list)
                continue;
            for (const init of findChildren(list, "initialized_identifier")) {
                const id = findChild(init, "identifier");
                if (id)
                    properties.push(id.text);
            }
        }
    }
}
/**
 * Extract a class-like declaration that uses a `class_body`-shaped member
 * container. Used by `class_definition`, `mixin_declaration`, and
 * `extension_declaration`. The only difference between these shapes is the
 * body's node type name, which is passed in via `bodyNodeType`.
 *
 * When `nameOverride` is provided, it is used as the entry's name instead of
 * looking up a leading `identifier` child — used by anonymous extensions,
 * which have no name in the source.
 */
export function extractClassLikeDeclaration(declNode, bodyNodeType, classes, functions, exports, nameOverride) {
    let name;
    if (nameOverride !== undefined) {
        name = nameOverride;
    }
    else {
        const nameNode = findChild(declNode, "identifier");
        if (!nameNode)
            return;
        name = nameNode.text;
    }
    const methods = [];
    const properties = [];
    const body = findChild(declNode, bodyNodeType);
    if (body) {
        collectClassBody(body, methods, properties, functions, exports);
    }
    classes.push({
        name,
        lineRange: [declNode.startPosition.row + 1, declNode.endPosition.row + 1],
        methods,
        properties,
    });
    if (isExported(name)) {
        exports.push({ name, lineNumber: declNode.startPosition.row + 1 });
    }
}
/**
 * Extract an `extension_declaration`. Named extensions are dispatched the
 * same way as classes. Anonymous extensions (no leading identifier) use
 * the `on <TargetType>` form so the graph builder doesn't drop them.
 */
export function extractExtensionDeclaration(declNode, classes, functions, exports) {
    // Named extension — extractClassLikeDeclaration finds the leading identifier itself.
    const idNode = findChild(declNode, "identifier");
    if (idNode) {
        extractClassLikeDeclaration(declNode, "extension_body", classes, functions, exports);
        return;
    }
    // Anonymous extension — no `identifier` child. The on-type is the first
    // `type_identifier`. Name the entry "on <TargetType>" so the graph
    // builder doesn't drop it for having an empty name.
    const onType = findChild(declNode, "type_identifier");
    if (!onType)
        return;
    extractClassLikeDeclaration(declNode, "extension_body", classes, functions, exports, `on ${onType.text}`);
}
/**
 * Extract an `enum_declaration`. Enums surface their constants as
 * `properties` (matching how Dart's AST emits them as `enum_constant`
 * children of the `enum_body`).
 */
export function extractEnumDeclaration(declNode, classes, exports) {
    const nameNode = findChild(declNode, "identifier");
    if (!nameNode)
        return;
    const name = nameNode.text;
    const properties = [];
    const body = findChild(declNode, "enum_body");
    if (body) {
        for (const k of findChildren(body, "enum_constant")) {
            const id = findChild(k, "identifier");
            if (id)
                properties.push(id.text);
        }
    }
    classes.push({
        name,
        lineRange: [declNode.startPosition.row + 1, declNode.endPosition.row + 1],
        methods: [],
        properties,
    });
    if (isExported(name)) {
        exports.push({ name, lineNumber: declNode.startPosition.row + 1 });
    }
}
