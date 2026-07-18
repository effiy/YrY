/**
 * PHP call-graph extraction.
 *
 * Walks the AST once, maintaining a function-stack so nested calls get
 * attributed to the right caller. Emits one CallEdge per detected
 *   - `function_call_expression`  `baz($x)`, `strtoupper($x)`
 *   - `member_call_expression`    `$this->fetchFromDb($id)`
 *   - `scoped_call_expression`    `Bar::staticMethod()`
 */
import { findChild } from "../base-extractor.js";
/**
 * Walk `rootNode` and return one CallEdge per detected call site.
 */
export function extractCallGraph(rootNode) {
    const entries = [];
    const functionStack = [];
    const walkForCalls = (node) => {
        let pushedName = false;
        // Track entering function/method definitions
        if (node.type === "function_definition" || node.type === "method_declaration") {
            const nameNode = findChild(node, "name");
            if (nameNode) {
                functionStack.push(nameNode.text);
                pushedName = true;
            }
        }
        // Extract call expressions
        if (functionStack.length > 0) {
            const caller = functionStack[functionStack.length - 1];
            if (node.type === "function_call_expression") {
                // Standalone function call: baz($x), strtoupper($x), error_log($msg)
                const nameNode = findChild(node, "name");
                if (nameNode) {
                    entries.push({
                        caller,
                        callee: nameNode.text,
                        lineNumber: node.startPosition.row + 1,
                    });
                }
            }
            else if (node.type === "member_call_expression") {
                // Instance method call: $this->fetchFromDb($id)
                const nameNode = findChild(node, "name");
                if (nameNode) {
                    // Determine the receiver for more descriptive callee
                    const firstChild = node.child(0);
                    const receiver = firstChild ? firstChild.text : "";
                    const callee = receiver
                        ? receiver + "->" + nameNode.text
                        : nameNode.text;
                    entries.push({
                        caller,
                        callee,
                        lineNumber: node.startPosition.row + 1,
                    });
                }
            }
            else if (node.type === "scoped_call_expression") {
                // Static method call: Bar::staticMethod()
                // Children: [name("Bar"), ::, name("staticMethod"), arguments]
                // Both scope and method are `name` nodes, so we pick child[0] for scope
                // and child[2] (after `::`) for the method name.
                const scopeNode = node.child(0);
                const methodNode = node.child(2);
                if (scopeNode && methodNode && methodNode.type === "name") {
                    entries.push({
                        caller,
                        callee: scopeNode.text + "::" + methodNode.text,
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
