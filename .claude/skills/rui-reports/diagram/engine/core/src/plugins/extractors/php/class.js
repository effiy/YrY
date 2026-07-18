/**
 * PHP class / interface / method extraction.
 *
 * PHP has no formal export syntax, so every public top-level entity is
 * treated as an export in `index.js`. The functions here just populate
 * the structural arrays.
 */
import { findChild, findChildren } from "../base-extractor.js";
import { extractParams, extractReturnType } from "./function.js";
/**
 * Pull the `name` child of a class/interface/function_definition node,
 * returning an empty string if absent so callers can short-circuit.
 */
function getName(node) {
    const nameNode = findChild(node, "name");
    return nameNode ? nameNode.text : "";
}
/**
 * Extract a top-level function_definition (not inside a class).
 */
export function extractFunction(node, functions) {
    const nameNode = findChild(node, "name");
    if (!nameNode)
        return;
    const paramsNode = findChild(node, "formal_parameters");
    const params = extractParams(paramsNode);
    const returnType = extractReturnType(node);
    functions.push({
        name: nameNode.text,
        lineRange: [node.startPosition.row + 1, node.endPosition.row + 1],
        params,
        returnType,
    });
}
/**
 * Extract a class_declaration. Methods and properties are pulled out of
 * the `declaration_list` body; methods also get pushed into the top-level
 * `functions[]` array so the call-graph walker can join on names.
 */
export function extractClass(node, classes, functions) {
    const name = getName(node);
    if (!name)
        return;
    const methods = [];
    const properties = [];
    const declList = findChild(node, "declaration_list");
    if (declList) {
        extractDeclarationList(declList, methods, properties, functions);
    }
    classes.push({
        name,
        lineRange: [node.startPosition.row + 1, node.endPosition.row + 1],
        methods,
        properties,
    });
}
/**
 * Extract an interface_declaration. Interface bodies contain
 * `method_declaration` nodes (no bodies, just signatures).
 */
export function extractInterface(node, classes) {
    const name = getName(node);
    if (!name)
        return;
    const methods = [];
    const properties = [];
    const declList = findChild(node, "declaration_list");
    if (declList) {
        // Interface methods are method_declaration nodes (no bodies, just signatures)
        const methodDecls = findChildren(declList, "method_declaration");
        for (const methodDecl of methodDecls) {
            const methodName = findChild(methodDecl, "name");
            if (methodName) {
                methods.push(methodName.text);
            }
        }
    }
    classes.push({
        name,
        lineRange: [node.startPosition.row + 1, node.endPosition.row + 1],
        methods,
        properties,
    });
}
/**
 * Extract methods and properties from a class `declaration_list`.
 * Also pushes each method into the top-level functions array.
 */
function extractDeclarationList(declList, methods, properties, functions) {
    for (let i = 0; i < declList.childCount; i++) {
        const member = declList.child(i);
        if (!member)
            continue;
        if (member.type === "method_declaration") {
            const nameNode = findChild(member, "name");
            if (nameNode) {
                methods.push(nameNode.text);
                // Also add to functions array
                const paramsNode = findChild(member, "formal_parameters");
                const params = extractParams(paramsNode);
                const returnType = extractReturnType(member);
                functions.push({
                    name: nameNode.text,
                    lineRange: [member.startPosition.row + 1, member.endPosition.row + 1],
                    params,
                    returnType,
                });
            }
        }
        else if (member.type === "property_declaration") {
            // Extract property name from property_element -> variable_name
            const propElement = findChild(member, "property_element");
            if (propElement) {
                const varName = findChild(propElement, "variable_name");
                if (varName) {
                    // Get just the name part without $
                    const dollarChild = findChild(varName, "name");
                    if (dollarChild) {
                        properties.push(dollarChild.text);
                    }
                    else {
                        // Fallback: use the full text and strip $
                        properties.push(varName.text.replace(/^\$/, ""));
                    }
                }
            }
        }
    }
}
// Re-export the name helper for index.js to use without importing directly.
export { getName };
