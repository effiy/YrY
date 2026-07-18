/**
 * Rust call-graph extraction.
 *
 * Walks the AST once, maintaining a function-stack so nested calls get
 * attributed to the right caller. Emits one CallEdge per
 * `call_expression`.
 */
function extractCalleeName(callNode) {
    const funcNode = callNode.child(0);
    if (!funcNode)
        return null;
    if (funcNode.type === "identifier") {
        return funcNode.text;
    }
    if (funcNode.type === "field_expression") {
        // e.g., self.validate or obj.method
        const field = funcNode.childForFieldName("field");
        const value = funcNode.childForFieldName("value");
        if (field && value) {
            return value.text + "." + field.text;
        }
    }
    if (funcNode.type === "scoped_identifier") {
        // e.g., Vec::new
        return funcNode.text;
    }
    // Fallback: use the full text of the function child
    return funcNode.text;
}
/**
 * Walk `rootNode` and return one CallEdge per detected call site,
 * attributed to the top of the function stack.
 */
export function extractCallGraph(rootNode) {
    const entries = [];
    const functionStack = [];
    const walkForCalls = (node) => {
        let pushedName = false;
        // Track entering function_item declarations
        if (node.type === "function_item") {
            const nameNode = node.childForFieldName("name");
            if (nameNode) {
                functionStack.push(nameNode.text);
                pushedName = true;
            }
        }
        // Extract call expressions
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
