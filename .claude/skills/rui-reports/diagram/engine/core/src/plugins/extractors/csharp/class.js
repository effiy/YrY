/**
 * C# class / interface body extraction.
 *
 * Walks `class_declaration` / `interface_declaration` bodies and routes
 * members to the right destination arrays: methods go to `methods[]` AND
 * `functions[]` (so they participate in call-graph joins), properties and
 * fields go to `properties[]`, exports are gated on the `public` modifier.
 */
import { findChild, findChildren } from "../base-extractor.js";
import { extractParams, extractReturnType, hasModifier } from "./function.js";
/**
 * Extract a class_declaration into the classes array.
 *
 * Public classes are surfaced as exports.
 */
export function extractClass(node, functions, classes, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const methods = [];
    const properties = [];
    const body = node.childForFieldName("body");
    if (body) {
        extractClassBodyMembers(body, methods, properties, functions, exports);
    }
    classes.push({
        name: nameNode.text,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        methods,
        properties,
    });
    if (hasModifier(node, "public")) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract an interface_declaration into the classes array.
 *
 * Interface bodies contain method_declaration nodes (signatures without
 * bodies) and property_declaration nodes. Public interfaces are exported.
 */
export function extractInterface(node, functions, classes, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const methods = [];
    const properties = [];
    const body = node.childForFieldName("body");
    if (body) {
        // Interface body contains method_declaration nodes (signatures without bodies)
        const methodNodes = findChildren(body, "method_declaration");
        for (const methodNode of methodNodes) {
            const methNameNode = methodNode.childForFieldName("name");
            if (methNameNode) {
                methods.push(methNameNode.text);
            }
        }
        // Interface can contain property_declaration nodes
        const propNodes = findChildren(body, "property_declaration");
        for (const propNode of propNodes) {
            const propNameNode = propNode.childForFieldName("name");
            if (propNameNode) {
                properties.push(propNameNode.text);
            }
        }
    }
    classes.push({
        name: nameNode.text,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        methods,
        properties,
    });
    if (hasModifier(node, "public")) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract methods, constructors, properties, and fields from a
 * class declaration_list body.
 */
function extractClassBodyMembers(body, methods, properties, functions, exports) {
    for (let i = 0; i < body.childCount; i++) {
        const child = body.child(i);
        if (!child)
            continue;
        switch (child.type) {
            case "method_declaration":
                extractMethod(child, methods, functions, exports);
                break;
            case "constructor_declaration":
                extractConstructor(child, methods, functions, exports);
                break;
            case "property_declaration":
                extractProperty(child, properties, exports);
                break;
            case "field_declaration":
                extractField(child, properties, exports);
                break;
        }
    }
}
/**
 * Extract a method_declaration: name goes to `methods[]` (so the class
 * knows about it) AND `functions[]` (so the call graph can join). Public
 * methods are exported.
 */
function extractMethod(node, methods, functions, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const paramsNode = node.childForFieldName("parameters");
    const params = extractParams(paramsNode ?? null);
    const returnType = extractReturnType(node);
    methods.push(nameNode.text);
    functions.push({
        name: nameNode.text,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        params,
        returnType,
    });
    if (hasModifier(node, "public")) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract a constructor_declaration. Constructors have no return type and
 * their name is the class name (matching the method-graph convention).
 */
function extractConstructor(node, methods, functions, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const paramsNode = node.childForFieldName("parameters");
    const params = extractParams(paramsNode ?? null);
    methods.push(nameNode.text);
    functions.push({
        name: nameNode.text,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        params,
        // Constructors have no return type
    });
    if (hasModifier(node, "public")) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract a property_declaration into `properties[]`. Public properties
 * are exported.
 */
function extractProperty(node, properties, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    properties.push(nameNode.text);
    if (hasModifier(node, "public")) {
        exports.push({
            name: nameNode.text,
            lineNumber: node.startPosition.row + 1,
        });
    }
}
/**
 * Extract a field_declaration. C# field_declaration wraps a
 * variable_declaration which contains one or more variable_declarator
 * children, each carrying the identifier for one declared name. Public
 * fields are exported.
 */
function extractField(node, properties, exports) {
    // field_declaration -> variable_declaration -> variable_declarator(s)
    const varDecl = findChild(node, "variable_declaration");
    if (!varDecl)
        return;
    const declarators = findChildren(varDecl, "variable_declarator");
    for (const decl of declarators) {
        // variable_declarator's first child is the identifier
        const nameNode = findChild(decl, "identifier");
        if (nameNode) {
            properties.push(nameNode.text);
            if (hasModifier(node, "public")) {
                exports.push({
                    name: nameNode.text,
                    lineNumber: node.startPosition.row + 1,
                });
            }
        }
    }
}
