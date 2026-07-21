/**
 * C/C++ class / struct body extraction.
 *
 * Processes class_specifier or struct_specifier bodies: tracks the active
 * access specifier (`public` / `private` / `protected`) so we know which
 * members to surface as exports, and routes properties / method
 * declarations / inline method definitions to the correct destination
 * arrays.
 */
import { findChild } from "../base-extractor.js";
import { extractFuncDeclName, extractParams, extractReturnType, unwrapDeclaratorName } from "./function.js";
/**
 * Extract class_specifier or struct_specifier into the classes array.
 *
 * Processes:
 * - Properties (field_declaration without function_declarator)
 * - Method declarations (field_declaration with function_declarator)
 * - Method definitions (function_definition inside the class body)
 * - Access specifiers (public/private/protected)
 *
 * Public members of classes and all members of structs (default public)
 * are treated as exports.
 */
export function extractClassOrStruct(node, kind, classes, functions, exports) {
    const nameNode = node.childForFieldName("name");
    if (!nameNode)
        return;
    const className = nameNode.text;
    const methods = [];
    const properties = [];
    const body = node.childForFieldName("body");
    if (body && body.type === "field_declaration_list") {
        // Default access: public for struct, private for class
        let currentAccess = kind === "struct" ? "public" : "private";
        for (let j = 0; j < body.childCount; j++) {
            const member = body.child(j);
            if (!member)
                continue;
            if (member.type === "access_specifier") {
                // Update current access level
                const specChild = member.child(0);
                if (specChild) {
                    currentAccess = specChild.text;
                }
                continue;
            }
            if (member.type === "field_declaration") {
                const declNode = member.childForFieldName("declarator");
                if (declNode && declNode.type === "function_declarator") {
                    // Method declaration (no body)
                    const info = extractFuncDeclName(declNode);
                    if (info) {
                        methods.push(info.name);
                        if (currentAccess === "public") {
                            exports.push({
                                name: info.name,
                                lineNumber: member.startPosition.row + 1,
                            });
                        }
                    }
                }
                else if (declNode) {
                    // Property (field_identifier or other declarator)
                    const name = unwrapDeclaratorName(declNode);
                    if (name) {
                        properties.push(name);
                    }
                }
            }
            if (member.type === "function_definition") {
                // Inline method definition
                const funcDecl = member.childForFieldName("declarator");
                if (funcDecl && funcDecl.type === "function_declarator") {
                    const info = extractFuncDeclName(funcDecl);
                    if (info) {
                        methods.push(info.name);
                        // Also add to functions list with params/return type
                        const paramsNode = funcDecl.childForFieldName("parameters");
                        functions.push({
                            name: info.name,
                            lineRange: [
                                member.startPosition.row + 1,
                                member.endPosition.row + 1,
                            ],
                            params: extractParams(paramsNode),
                            returnType: extractReturnType(member),
                        });
                        if (currentAccess === "public") {
                            exports.push({
                                name: info.name,
                                lineNumber: member.startPosition.row + 1,
                            });
                        }
                    }
                }
            }
        }
    }
    classes.push({
        name: className,
        lineRange: [
            node.startPosition.row + 1,
            node.endPosition.row + 1,
        ],
        methods,
        properties,
    });
    // The class/struct name itself is an export (non-anonymous types are always exported in C/C++ headers)
    exports.push({
        name: className,
        lineNumber: node.startPosition.row + 1,
    });
}
