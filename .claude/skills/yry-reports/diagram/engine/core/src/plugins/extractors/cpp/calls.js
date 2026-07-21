/**
 * C/C++ call-graph extraction.
 *
 * Walks the AST once. Maintains a `functionStack` so nested
 * `function_definition` nodes (e.g. a free function called from another
 * function) get attributed to the right caller. Emits one CallEdge per
 * `call_expression`.
 */
import { extractFuncDeclName } from "./function.js";
/**
 * Extract the callee name from a call_expression.
 *
 * Handles:
 * - Plain function call: `printf(...)` -> "printf"
 * - Member call via field_expression: `p->method()` -> "p->method"
 * - Scoped call: `std::cout << ...` -> qualified name text
 */
function extractCalleeName(callNode) {
    const funcNode = callNode.child(0);
    if (!funcNode)
        return null;
    if (funcNode.type === "identifier") {
        return funcNode.text;
    }
    if (funcNode.type === "field_expression") {
        const field = funcNode.childForFieldName("field");
        return field ? field.text : funcNode.text;
    }
    if (funcNode.type === "qualified_identifier") {
        return funcNode.text;
    }
    return funcNode.text;
}
/**
 * Build the simple function name from a function_definition, used to push
 * onto the call-stack. For qualified names (e.g. `Server::start`), returns
 * just the method name so caller/callee joins match how class methods are
 * tracked in `extractStructure`.
 */
function extractSimpleName(node) {
    const declNode = node.childForFieldName("declarator");
    if (!declNode || declNode.type !== "function_declarator")
        return null;
    const info = extractFuncDeclName(declNode);
    return info ? info.name : null;
}
/**
 * Walk `rootNode` and emit one CallEdge per detected call site.
 */
export function extractCallGraph(rootNode) {
    const entries = [];
    const functionStack = [];
    const walkForCalls = (node) => {
        let pushedName = false;
        // Track entering function_definition
        if (node.type === "function_definition") {
            const name = extractSimpleName(node);
            if (name) {
                functionStack.push(name);
                pushedName = true;
            }
        }
        // Extract call_expression nodes
        if (node.type === "call_expression") {
            if (functionStack.length > 0) {
                const callee = extractCalleeName(node);
                if (callee) {
                    entries.push({
                        caller: functionStack[functionStack.length - 1],
                        callee,
                        lineNumber: node.startPosition.row + 1,
                    });
                }
            }
        }
        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child)
                walkForCalls(child);
        }
        if (pushedName) {
            functionStack.pop();
        }
    };
    walkForCalls(rootNode);
    return entries;
}
