export { parseFile, parseCSV, parseJSON, detectFormat } from "./fileParser";
export type { ParsedData } from "./fileParser";
export { autoMap, applyMapping, saveMappingTemplate, loadMappingTemplate, listMappingTemplates } from "./fieldMapper";
export type { FieldMapping, MappingTemplate } from "./fieldMapper";