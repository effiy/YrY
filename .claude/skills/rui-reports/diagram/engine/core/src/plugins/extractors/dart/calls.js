/**
 * Dart call-graph extraction.
 *
 * Walks the tree-sitter AST and emits one entry per `selector(argument_part)`
 * call site and per `const Foo(...)` / `new Foo(...)` construction site.
 *
 * In Dart, `function_signature` and `function_body` are SIBLINGS within
 * their parent (program, class_body, etc.) — not parent/child like Kotlin's
 * `function_declaration`. We handle this by scanning siblings at the parent
 * level: `walkSiblings` iterates children, remembers the name from each
 * `function_signature` / `method_signature`, and pushes it onto the stack
 * only for the duration of the following `function_body`.
 */
import { findChild } from "../base-extractor.js";
import { extractFunctionName, constructorName } from "./function.js";
/**
 * Find the callee name for a `selector` node that contains an
 * `argument_part`. Look at the parent's children:
 *   - Bare call `foo(...)`: the previous sibling is an `identifier`.
 *   - Method call `target.foo(...)`: the previous sibling is itself a
 *     `selector` wrapping `unconditional_assignable_selector` with the
 *     method-name `identifier`.
 *
 * Probe finding (2026-06-13): the plan's claimed AST shapes match exactly.
 *   - Bare call:   return_statement > identifier[helper] + selector(argument_part)
 *   - Method call: expression_statement > string_literal + selector(unconditional_assignable_selector > identifier[toUpperCase]) + selector(argument_part)
 * The plan claimed `expression_statement` as parent for bare calls but the
 * actual parent for `return helper()` is `return_statement`. This does not
 * affect the strategy since we only look at the preceding sibling, not the
 * parent type.
 *
 * IMPORTANT: web-tree-sitter returns a NEW wrapper object each time `.child(i)`
 * is called — node identity (`===`) does NOT work for sibling lookup. We
 * compare by `startIndex` (byte offset) which is stable and unique per node.
 */
function extractCalleeName(callSelector) {
    const parent = callSelector.parent;
    if (!parent)
        return null;
    // Find this selector's index in the parent using startIndex (not ===).
    let myIdx = -1;
    for (let i = 0; i < parent.childCount; i++) {
        const c = parent.child(i);
        if (c && c.startIndex === callSelector.startIndex) {
            myIdx = i;
            break;
        }
    }
    if (myIdx <= 0)
        return null;
    const prev = parent.child(myIdx - 1);
    if (!prev)
        return null;
    if (prev.type === "identifier")
        return prev.text;
    if (prev.type === "selector") {
        // Method call shape: previous selector wraps unconditional_assignable_selector.
        const inner = findChild(prev, "unconditional_assignable_selector");
        if (inner) {
            // Pick the LAST identifier inside the inner selector — that's the
            // method name (earlier identifiers, if any, are receiver fragments).
            let last = null;
            for (let i = 0; i < inner.childCount; i++) {
                const child = inner.child(i);
                if (child && child.type === "identifier")
                    last = child.text;
            }
            return last;
        }
    }
    return null;
}
/**
 * Walk a `program` / `class_body` / `function_body` pairing each
 * `function_signature` / `method_signature` with its subsequent
 * `function_body` sibling, so calls inside the body are attributed to the
 * right caller.
 */
function walkSiblings(parent, ctx) {
    let pendingName = null;
    for (let i = 0; i < parent.childCount; i++) {
        const child = parent.child(i);
        if (!child)
            continue;
        if (child.type === "function_signature") {
            pendingName = extractFunctionName(child);
            // Recurse into signature (no calls expected, but stay complete).
            walkSiblings(child, ctx);
        }
        else if (child.type === "method_signature") {
            // method_signature wraps one of:
            //   function_signature           → normal method
            //   getter_signature             → getter (with body)
            //   setter_signature             → setter (with body)
            //   constructor_signature        → constructor (with body)
            //   factory_constructor_signature → factory (with body)
            // All five carry the name as their first `identifier` child (factory
            // ctors carry two — class + named — handled by `constructorName`).
            // Without this dispatch, ctor/factory/getter/setter bodies were
            // walked with an empty functionStack and their internal calls were
            // dropped from the graph.
            const fn = findChild(child, "function_signature") ??
                findChild(child, "getter_signature") ??
                findChild(child, "setter_signature");
            if (fn) {
                pendingName = extractFunctionName(fn);
            }
            else {
                const ctor = findChild(child, "constructor_signature") ??
                    findChild(child, "factory_constructor_signature");
                if (ctor)
                    pendingName = constructorName(ctor);
            }
            walkSiblings(child, ctx);
        }
        else if (child.type === "function_body") {
            // Consume pendingName: push for the duration of this body.
            const pushed = pendingName !== null;
            if (pendingName) {
                ctx.functionStack.push(pendingName);
                pendingName = null;
            }
            walkNode(child, ctx);
            if (pushed)
                ctx.functionStack.pop();
        }
        else {
            // For every other node (including selector nodes at this level),
            // do NOT clear pendingName — anonymous tokens (`;`, `{`, etc.)
            // appear between the signature and body and must not reset the
            // pending name.
            walkNode(child, ctx);
        }
    }
}
/**
 * Record a call edge against the current top-of-stack caller.
 * Deduplicated here because both the selector branch and the
 * const/new-expression branch produce identical entry shapes.
 */
function recordCall(ctx, node, callee) {
    ctx.entries.push({
        caller: ctx.functionStack[ctx.functionStack.length - 1],
        callee,
        lineNumber: node.startPosition.row + 1,
    });
}
/**
 * Walk a single node, recursing into its children. Detects call sites
 * (selector nodes containing argument_part) and records them against the
 * current function on the stack.
 */
function walkNode(node, ctx) {
    if (node.type === "selector" &&
        findChild(node, "argument_part") &&
        ctx.functionStack.length > 0) {
        // A call site: selector containing argument_part.
        const callee = extractCalleeName(node);
        if (callee)
            recordCall(ctx, node, callee);
    }
    // Constructor-call shapes that bypass the `selector > argument_part`
    // pattern:
    //   const Foo(...)  → `const_object_expression { const_builtin, type_identifier, arguments }`
    //   new Foo(...)    → `new_expression { (unnamed `new`), type_identifier, arguments }`
    // Both are extremely common in Flutter widget trees; without this branch
    // the construction edge would be silently dropped. The callee is the
    // `type_identifier` child.
    if ((node.type === "const_object_expression" ||
        node.type === "new_expression") &&
        ctx.functionStack.length > 0) {
        const typeNode = findChild(node, "type_identifier");
        if (typeNode)
            recordCall(ctx, node, typeNode.text);
    }
    walkSiblings(node, ctx);
}
/**
 * Walk `rootNode` and return one `CallEdge` per detected call site.
 */
export function extractCallGraph(rootNode) {
    const ctx = { entries: [], functionStack: [] };
    walkSiblings(rootNode, ctx);
    return ctx.entries;
}
