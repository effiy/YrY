export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: string) => any;
}

export interface MappingTemplate {
  name: string;
  mappings: FieldMapping[];
}

/**
 * Auto-match source columns to target fields by name similarity.
 */
export function autoMap(sourceColumns: string[], targetFields: { name: string; label: string }[]): FieldMapping[] {
  return sourceColumns.map((col) => {
    const clean = (s: string) => s.toLowerCase().replace(/[\s_-]/g, "");

    // Exact match on name
    let match = targetFields.find((f) => clean(f.name) === clean(col));
    // Match on label
    if (!match) match = targetFields.find((f) => clean(f.label) === clean(col));
    // Partial match
    if (!match) match = targetFields.find((f) => clean(f.name).includes(clean(col)) || clean(col).includes(clean(f.name)));

    return {
      sourceField: col,
      targetField: match?.name || "",
    };
  });
}

/**
 * Apply field mappings to data rows.
 */
export function applyMapping(rows: Record<string, string>[], mappings: FieldMapping[]): Record<string, any>[] {
  return rows.map((row) => {
    const mapped: Record<string, any> = {};
    for (const mapping of mappings) {
      if (!mapping.targetField) continue;
      const value = row[mapping.sourceField];
      mapped[mapping.targetField] = mapping.transform ? mapping.transform(value) : value;
    }
    return mapped;
  });
}

/**
 * Save mapping configuration as a reusable template (localStorage).
 */
export function saveMappingTemplate(template: MappingTemplate): void {
  const key = `field-mapping-${template.name}`;
  localStorage.setItem(key, JSON.stringify(template));
}

export function loadMappingTemplate(name: string): MappingTemplate | null {
  const key = `field-mapping-${name}`;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export function listMappingTemplates(): MappingTemplate[] {
  const templates: MappingTemplate[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("field-mapping-")) {
      try {
        templates.push(JSON.parse(localStorage.getItem(key)!));
      } catch { /* skip corrupt entries */ }
    }
  }
  return templates;
}