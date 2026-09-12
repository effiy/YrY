export interface BaseMenuItem {
  id: string;
  label: string;
  type: "action" | "divider" | "submenu" | "checkbox" | "radio";
  disabled?: boolean;
  disabledReason?: string;
  shortcut?: string;
  icon?: string;
  danger?: boolean;
}

export interface ActionItem extends BaseMenuItem {
  type: "action";
  action: (context: MenuContext) => void;
}

export interface DividerItem {
  id: string;
  type: "divider";
  label?: undefined;
  disabled?: undefined;
  disabledReason?: undefined;
}

export interface SubMenuItem extends BaseMenuItem {
  type: "submenu";
  children: MenuItem[];
}

export interface CheckboxItem extends BaseMenuItem {
  type: "checkbox";
  checked: boolean;
  onChange: (checked: boolean, context: MenuContext) => void;
}

export interface RadioItem extends BaseMenuItem {
  type: "radio";
  value: string;
  currentValue: string;
  onChange: (value: string, context: MenuContext) => void;
}

export type MenuItem = ActionItem | DividerItem | SubMenuItem | CheckboxItem | RadioItem;

export interface MenuContext {
  element: HTMLElement;
  selectedIds?: string[];
  pageContext?: Record<string, any>;
}