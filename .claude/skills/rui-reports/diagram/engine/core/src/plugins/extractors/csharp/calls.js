/**
 * C# call-graph extraction.
 *
 * Walks the AST once, tracking an entry / exit stack of method /
 * constructor names so nested calls get attributed to the right caller.
 * Emits one CallEdge per `invocation_expression` and one per
 * `object_creation_expression` (with the callee rewritten to `"new Type"`
 * so constructors are distinguishable from method calls of the same name).
 */
import { findChild } from "../base-extractor.js";
/**
 * Extract the callee name from an invocation_expression node.
 *
 * Handles:
 * - Plain method call: `FetchFromDb(limit)` -> "FetchFromDb"
 *   (function field is an identifier)
 * - Qualified call: `Console.WriteLine(msg)` -> "Console.WriteLine"
 *   (function field is a member_access_expression)
 */
function extractInvocationName(node) {
    const funcNode = node.childForFieldName("function");
    if (!funcNode)
        return null;
    return funcNode.text;
}
/**
 * Walk `rootNode` and return one CallEdge per detected call / construction
 * site, attributed to the top of the function stack.
 */
export function extractCallGraph(rootNode) {
    const entries = [];
    const functionStack = [];
    const walkForCalls = (node) => {
        let pushedName = false;
        // Track entering method/constructor declarations
        if (node.type === "method_declaration" ||
            node.type === "constructor_declaration") {
            const nameNode = node.childForFieldName("name");
            if (nameNode) {
                functionStack.push(nameNode.text);
                pushedName = true;
            }
        }
        // Extract method invocations: e.g. FetchFromDb(limit), Console.WriteLine(msg)
        if (node.type === "invocation_expression") {
            if (functionStack.length > 0) {
                const callee = extractInvocationName(node);
                if (callee) {
                    entries.push({
                        caller: functionStack[functionStack.length - 1],
                        callee,
                        lineNumber: node.startPosition.row + 1,
                    });
                }
            }
        }
        // Extract object creation: e.g. new Foo()
        if (node.type === "object_creation_expression") {
            if (functionStack.length > 0) {
                // The type is the child after `new` — can be identifier or generic_name
                const typeNode = findChild(node, "identifier") ?? findChild(node, "generic_name");
                if (typeNode) {
                    entries.push({
                        caller: functionStack[functionStack.length - 1],
                        callee: `new ${typeNode.text}`,
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
