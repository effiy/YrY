/**
 * useCalculator — 命令面板内联计算器 composable。
 *
 * 核心约束（项目红线，任何改动都必须通过本文件注释说明 ADR）：
 *   1. 绝对禁止任何形式的 `eval` / `new Function` / `Function(...)` 动态代码执行。
 *      （v1 曾有人用 `math.evaluate` + 用户输入拼 eval，导致被审计标记为 High。）
 *   2. 单位转换用「显式别名表 + 缩放因子」静态表；禁止从字符串 / 网络下载因子。
 *   3. 纯同步无副作用：tryEvaluateLine 只返回 number（或 null），不写 storage / network。
 *
 * 算法：Shunting-Yard → RPN → evaluate。
 * 支持：+ - * / % ^ 括号、基本函数 (abs, sqrt, floor, ceil, round, sin/cos/tan 弧度)、
 *       单位转换 "x unit1 to unit2" / "x unit1 in unit2"。
 */

import { type Ref } from "vue";

export interface CalcResult {
  expr: string;
  value: number;
  /** 格式化后的可展示字符串（保留最多 6 位小数，去掉尾 0） */
  display: string;
  /** 若发生了单位转换，保留的转换后单位（否则为空） */
  outUnit?: string;
}

type Token =
  | { kind: "num"; value: number }
  | { kind: "op"; value: string }     // + - * / % ^ ( ) ,
  | { kind: "fn"; value: string }     // abs sqrt sin ...
  | { kind: "unit"; value: string; scale: number; base: string }
  | { kind: "kw"; value: "to" | "in" };

/* -------------------------------------------------------------------------- */
/*  静态表 —— 单位别名 → { scale, base }                                       */
/* -------------------------------------------------------------------------- */

interface UnitDef { scale: number; base: string; aliases: string[] }

const LENGTH: UnitDef[] = [
  { scale: 1e-3,       base: "m",  aliases: ["mm", "millimeter", "millimeters", "millimetre", "millimetres"] },
  { scale: 0.01,       base: "m",  aliases: ["cm", "centimeter", "centimeters", "centimetre", "centimetres"] },
  { scale: 1,          base: "m",  aliases: ["m", "meter", "meters", "metre", "metres"] },
  { scale: 1000,       base: "m",  aliases: ["km", "kilometer", "kilometers", "kilometre", "kilometres"] },
  { scale: 0.0254,     base: "m",  aliases: ["in", "inch", "inches", "\""] },
  { scale: 0.3048,     base: "m",  aliases: ["ft", "foot", "feet", "'"] },
  { scale: 1609.344,   base: "m",  aliases: ["mi", "mile", "miles"] },
  { scale: 0.9144,     base: "m",  aliases: ["yd", "yard", "yards"] },
];

const WEIGHT: UnitDef[] = [
  { scale: 1e-6,       base: "kg", aliases: ["mg", "milligram", "milligrams"] },
  { scale: 1e-3,       base: "kg", aliases: ["g", "gram", "grams", "gramme", "grammes"] },
  { scale: 1,          base: "kg", aliases: ["kg", "kilogram", "kilograms", "kilogramme", "kilogrammes"] },
  { scale: 1000,       base: "kg", aliases: ["t", "ton", "tons", "tonne", "tonnes"] },
  { scale: 0.0283495,  base: "kg", aliases: ["oz", "ounce", "ounces"] },
  { scale: 0.45359237, base: "kg", aliases: ["lb", "lbs", "pound", "pounds"] },
];

const TIME: UnitDef[] = [
  { scale: 1e-3,       base: "s",  aliases: ["ms", "millisecond", "milliseconds"] },
  { scale: 1,          base: "s",  aliases: ["s", "sec", "secs", "second", "seconds"] },
  { scale: 60,         base: "s",  aliases: ["min", "mins", "minute", "minutes"] },
  { scale: 3600,       base: "s",  aliases: ["h", "hr", "hrs", "hour", "hours"] },
  { scale: 86400,      base: "s",  aliases: ["d", "day", "days"] },
];

const DATA: UnitDef[] = [
  { scale: 1,             base: "b", aliases: ["b", "bit", "bits"] },
  { scale: 8,             base: "b", aliases: ["B", "byte", "bytes"] },
  { scale: 8 * 1024,      base: "b", aliases: ["KB", "KiB", "kibibyte", "kibibytes", "kilobyte", "kilobytes"] },
  { scale: 8 * 1024 ** 2, base: "b", aliases: ["MB", "MiB", "mebibyte", "mebibytes", "megabyte", "megabytes"] },
  { scale: 8 * 1024 ** 3, base: "b", aliases: ["GB", "GiB", "gibibyte", "gibibytes", "gigabyte", "gigabytes"] },
  { scale: 8 * 1024 ** 4, base: "b", aliases: ["TB", "TiB", "tebibyte", "tebibytes", "terabyte", "terabytes"] },
];

const TEMPERATURE: Array<{ aliases: string[]; kind: "C" | "F" | "K" }> = [
  { aliases: ["c", "C", "°C", "celsius", "centigrade"],             kind: "C" },
  { aliases: ["f", "F", "°F", "fahrenheit"],                         kind: "F" },
  { aliases: ["k", "K", "kelvin", "kelvins"],                        kind: "K" },
];

/* 把别名表压扁成 map，alias → UnitDef */
function buildUnitMap<T extends UnitDef>(defs: T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const d of defs) for (const a of d.aliases) m.set(a.toLowerCase(), d);
  return m;
}
const UNIT_MAP: Map<string, UnitDef> = new Map([
  ...buildUnitMap(LENGTH),
  ...buildUnitMap(WEIGHT),
  ...buildUnitMap(TIME),
  ...buildUnitMap(DATA),
]);

const TEMPERATURE_MAP: Map<string, "C" | "F" | "K"> = (() => {
  const m = new Map<string, "C" | "F" | "K">();
  for (const t of TEMPERATURE) for (const a of t.aliases) m.set(a.toLowerCase(), t.kind);
  return m;
})();

const FUNCTIONS = new Set([
  "abs", "sqrt", "floor", "ceil", "round", "trunc", "sign",
  "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
  "ln", "log", "log2", "log10", "exp", "pow",
  "min", "max", "clamp",
]);

const CONSTANTS: Record<string, number> = {
  "pi": Math.PI, "π": Math.PI,
  "e": Math.E,
  "tau": Math.PI * 2,
  "phi": (1 + Math.sqrt(5)) / 2,
};

/* -------------------------------------------------------------------------- */
/*  Shunting-Yard + 求值                                                       */
/* -------------------------------------------------------------------------- */

function tokenize(raw: string): { tokens: Token[]; error?: string } {
  const s = raw.trim();
  if (!s) return { tokens: [], error: "empty" };
  const tokens: Token[] = [];
  let i = 0;
  // 允许用 "," 做千分位；不允许 "," 独立出现在参数列表之外
  while (i < s.length) {
    const ch = s[i];
    // 空白
    if (ch === " " || ch === "\t" || ch === "\n") { i++; continue; }
    // 数字（含小数、千分位逗号、科学计数法）
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(s[i + 1] || ""))) {
      let j = i;
      let hasDigit = false;
      let hasDot = false;
      if (ch === ".") hasDot = true;
      while (j < s.length) {
        const c = s[j];
        if (/[0-9]/.test(c)) { hasDigit = true; j++; continue; }
        if (c === "." && !hasDot) { hasDot = true; j++; continue; }
        // 千分位："," 前后都必须是数字，且不影响整体
        if (c === "," && /[0-9]/.test(s[j + 1] || "") && hasDigit) { j++; continue; }
        if ((c === "e" || c === "E") && hasDigit) {
          j++;
          if (s[j] === "+" || s[j] === "-") j++;
          while (j < s.length && /[0-9]/.test(s[j])) j++;
          break;
        }
        break;
      }
      const numStr = s.slice(i, j).replace(/,/g, "");
      const val = Number(numStr);
      if (!isFinite(val)) return { tokens: [], error: "invalid number" };
      tokens.push({ kind: "num", value: val });
      // 数字后面紧接单位？
      const rest = s.slice(j);
      const unitMatch = rest.match(/^[a-zA-Zμ°'"%]+/);
      if (unitMatch) {
        const unitAlias = unitMatch[0];
        const lower = unitAlias.toLowerCase();
        if (UNIT_MAP.has(lower)) {
          const def = UNIT_MAP.get(lower)!;
          tokens.push({ kind: "unit", value: lower, scale: def.scale, base: def.base });
          // num * unit_scale -> 当前 number 先与 unit 乘
          tokens.push({ kind: "op", value: "*" });
          tokens.push({ kind: "num", value: def.scale });
          j += unitMatch[0].length;
          i = j;
          continue;
        } else if (TEMPERATURE_MAP.has(lower)) {
          // 温度是 affine 转换，不作为乘法；留作后处理
          tokens.push({ kind: "unit", value: lower, scale: NaN, base: TEMPERATURE_MAP.get(lower)! });
          j += unitMatch[0].length;
          i = j;
          continue;
        } else if (lower === "%") {
          tokens.push({ kind: "op", value: "*" });
          tokens.push({ kind: "num", value: 0.01 });
          j += unitMatch[0].length;
          i = j;
          continue;
        }
      }
      i = j;
      continue;
    }
    // 运算符/括号
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%" || ch === "^" || ch === "(" || ch === ")" || ch === ",") {
      // 处理一元 +/-（prev 为空或为操作符/左括号/逗号）
      if ((ch === "+" || ch === "-") && (tokens.length === 0 ||
          (tokens[tokens.length - 1].kind === "op" &&
            (tokens[tokens.length - 1] as any).value !== ")"))) {
        tokens.push({ kind: "op", value: ch === "+" ? "u+" : "u-" });
        i++;
        continue;
      }
      tokens.push({ kind: "op", value: ch });
      i++;
      continue;
    }
    // 标识符（函数 / 常量 / 单位 / 关键字 to|in）
    if (/[a-zA-Zμ°π'"]/.test(ch)) {
      let j = i;
      while (j < s.length && /[a-zA-Zμ°π'"]/.test(s[j])) j++;
      const name = s.slice(i, j);
      const lower = name.toLowerCase();
      // 关键字
      if (lower === "to" || lower === "in") {
        tokens.push({ kind: "kw", value: lower });
        i = j;
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) {
        tokens.push({ kind: "num", value: CONSTANTS[name] });
        i = j;
        continue;
      }
      if (FUNCTIONS.has(lower)) {
        tokens.push({ kind: "fn", value: lower });
        i = j;
        continue;
      }
      if (UNIT_MAP.has(lower)) {
        const def = UNIT_MAP.get(lower)!;
        // 独立出现的单位（没有前导 num）→ 视作 1 * unit.scale
        tokens.push({ kind: "num", value: 1 });
        tokens.push({ kind: "op", value: "*" });
        tokens.push({ kind: "num", value: def.scale });
        tokens.push({ kind: "unit", value: lower, scale: def.scale, base: def.base });
        i = j;
        continue;
      }
      if (TEMPERATURE_MAP.has(lower)) {
        tokens.push({ kind: "num", value: 1 });
        tokens.push({ kind: "unit", value: lower, scale: NaN, base: TEMPERATURE_MAP.get(lower)! });
        i = j;
        continue;
      }
      return { tokens: [], error: `未知标识符：${name}` };
    }
    return { tokens: [], error: `非法字符：${ch}` };
  }
  return { tokens };
}

function opPrecedence(op: string): number {
  switch (op) {
    case "u+": case "u-": return 5;
    case "^": return 4;
    case "*": case "/": case "%": return 3;
    case "+": case "-": return 2;
    case ",": return 1;
    default: return 0;
  }
}
function opRightAssoc(op: string): boolean {
  return op === "^" || op === "u+" || op === "u-";
}

function toRPN(tokens: Token[]): { rpn: Token[]; error?: string } {
  const out: Token[] = [];
  const stack: Token[] = [];
  for (const t of tokens) {
    if (t.kind === "num" || t.kind === "unit") { out.push(t); continue; }
    if (t.kind === "fn") { stack.push(t); continue; }
    if (t.kind === "op") {
      const v = t.value;
      if (v === "(") { stack.push(t); continue; }
      if (v === ",") {
        while (stack.length && !(stack[stack.length - 1].kind === "op" && (stack[stack.length - 1] as any).value === "(")) {
          out.push(stack.pop()!);
        }
        if (!stack.length) return { rpn: [], error: "逗号前没有左括号" };
        continue;
      }
      if (v === ")") {
        while (stack.length && !(stack[stack.length - 1].kind === "op" && (stack[stack.length - 1] as any).value === "(")) {
          out.push(stack.pop()!);
        }
        if (!stack.length) return { rpn: [], error: "括号不匹配" };
        stack.pop();
        if (stack.length && stack[stack.length - 1].kind === "fn") out.push(stack.pop()!);
        continue;
      }
      // 普通运算符
      const p = opPrecedence(v);
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.kind === "fn") { out.push(stack.pop()!); continue; }
        if (top.kind !== "op") break;
        const topOp = (top as any).value;
        if (topOp === "(") break;
        const pTop = opPrecedence(topOp);
        if (pTop > p || (pTop === p && !opRightAssoc(v))) {
          out.push(stack.pop()!);
        } else break;
      }
      stack.push(t);
    }
  }
  while (stack.length) {
    const t = stack.pop()!;
    if (t.kind === "op" && ((t as any).value === "(" || (t as any).value === ")")) {
      return { rpn: [], error: "括号不匹配" };
    }
    out.push(t);
  }
  return { rpn: out };
}

function applyFn(name: string, args: number[]): number {
  switch (name) {
    case "abs": return Math.abs(args[0]);
    case "sqrt": return Math.sqrt(args[0]);
    case "floor": return Math.floor(args[0]);
    case "ceil": return Math.ceil(args[0]);
    case "round": return Math.round(args[0]);
    case "trunc": return Math.trunc(args[0]);
    case "sign": return Math.sign(args[0]);
    case "sin": return Math.sin(args[0]);
    case "cos": return Math.cos(args[0]);
    case "tan": return Math.tan(args[0]);
    case "asin": return Math.asin(args[0]);
    case "acos": return Math.acos(args[0]);
    case "atan": return Math.atan(args[0]);
    case "atan2": return Math.atan2(args[0], args[1]);
    case "ln": return Math.log(args[0]);
    case "log": case "log10": return Math.log10(args[0]);
    case "log2": return Math.log2(args[0]);
    case "exp": return Math.exp(args[0]);
    case "pow": return Math.pow(args[0], args[1]);
    case "min": return Math.min(...args);
    case "max": return Math.max(...args);
    case "clamp": return Math.min(Math.max(args[0], args[1]), args[2]);
    default: throw new Error("未知函数 " + name);
  }
}

function evalRPN(rpn: Token[]): { value: number; baseUnit?: string; tempKind?: "C" | "F" | "K" } {
  const stack: Array<number> = [];
  let baseUnit: string | undefined;
  let tempKind: "C" | "F" | "K" | undefined;
  // 简化：取第一个出现的 unit 的 base 作为「整体单位」
  for (const t of rpn) {
    if (t.kind === "num") { stack.push(t.value); continue; }
    if (t.kind === "unit") {
      if (!baseUnit) {
        if (!isNaN(t.scale)) baseUnit = t.base;
        else tempKind = t.base as any;
      }
      continue; // 单位乘法已经在 tokenize 阶段以 num 乘过
    }
    if (t.kind === "op") {
      const op = t.value as string;
      if (op === "u+") { continue; }
      if (op === "u-") {
        if (!stack.length) throw new Error("unary - 缺操作数");
        stack.push(-stack.pop()!);
        continue;
      }
      if (stack.length < 2) throw new Error("缺少操作数");
      const b = stack.pop()!, a = stack.pop()!;
      switch (op) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/":
          if (b === 0) throw new Error("除零");
          stack.push(a / b);
          break;
        case "%": stack.push(a % b); break;
        case "^": stack.push(Math.pow(a, b)); break;
        default: throw new Error("未知运算符 " + op);
      }
      continue;
    }
    if (t.kind === "fn") {
      // 读函数的参数数量：由 , 划分的参数已按 shunting-yard 压在栈上；
      // 简单做法：各函数固定参数数量
      const argn: Record<string, number> = {
        atan2: 2, pow: 2, min: 2, max: 2, clamp: 3,
      };
      const n = argn[t.value] ?? 1;
      if (stack.length < n) throw new Error("函数参数不足");
      const args: number[] = [];
      for (let i = 0; i < n; i++) args.unshift(stack.pop()!);
      stack.push(applyFn((t as any).value, args));
    }
  }
  if (stack.length !== 1) throw new Error("表达式无法求值");
  return { value: stack[0], baseUnit, tempKind };
}

/* 摄氏 / 华氏 / 开尔文互相转换（线性 affine，不是 scale 乘法） */
function convertTemperature(value: number, from: "C" | "F" | "K", to: "C" | "F" | "K"): number {
  // 归一化到 kelvin
  let k: number;
  if (from === "K") k = value;
  else if (from === "C") k = value + 273.15;
  else k = (value - 32) * 5 / 9 + 273.15;
  if (to === "K") return k;
  if (to === "C") return k - 273.15;
  return (k - 273.15) * 9 / 5 + 32;
}

function displayNumber(n: number, unit = ""): string {
  if (!isFinite(n)) return String(n);
  let s = n.toFixed(6);
  s = s.replace(/0+$/, "").replace(/\.$/, "");
  // 极大/极小：toPrecision
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e10 || abs < 1e-4)) s = n.toPrecision(6);
  return unit ? `${s} ${unit}` : s;
}

/* -------------------------------------------------------------------------- */
/*  Public useCalculator composable                                            */
/* -------------------------------------------------------------------------- */

export function useCalculator(inputRef?: Ref<string>) {
  const evaluate = (expr: string): CalcResult | null => {
    try {
      const line = expr.trim();
      if (!line) return null;
      // 必须至少含有一个数字或常数或运算符 — 纯字母不计算
      if (!/[0-9.+\-*/%^()πe]/.test(line) && !/^(to|in|pi|tau|phi|e|sqrt|abs|sin|cos|tan|log|exp|floor|ceil|round|min|max|clamp)\b/i.test(line)) {
        return null;
      }

      // 1) 识别 "x unit to/in unit2" 形式 — 先 tokenize 全部，再找 kw 位置
      const tok = tokenize(line);
      if (tok.error) return null;
      if (!tok.tokens.length) return null;
      const kwIdx = tok.tokens.findIndex(t => t.kind === "kw");
      if (kwIdx >= 0) {
        const leftTokens = tok.tokens.slice(0, kwIdx);
        const rightTokens = tok.tokens.slice(kwIdx + 1);
        // 右端最后一个 token 应该就是 unit 别名
        const unitTok = rightTokens[rightTokens.length - 1];
        let targetUnit: string | undefined;
        let targetBase: string | undefined;
        let targetTemp: "C" | "F" | "K" | undefined;
        if (unitTok && unitTok.kind === "unit") {
          targetUnit = (unitTok as any).value as string;
          targetBase = (unitTok as any).base as string;
          if (!isFinite((unitTok as any).scale as number)) targetTemp = targetBase as any;
        } else {
          // 右端可能是单独一个标识符（比如 "100 km to miles" — miles 不是 unit token），
          // tokenizer 会把它 token 成 unit；如果没有，就是非法单位，直接返回 null
          // 这里不再二次尝试
          return null;
        }

        // 计算左侧（返回值 = base 缩放后的数字 + 原始 base 信息）
        const leftRPN = toRPN(leftTokens);
        if (leftRPN.error) return null;
        const left = evalRPN(leftRPN.rpn);
        if (targetTemp) {
          // 温度转换：用左边识别的 tempKind
          if (!left.tempKind) return null;
          const val = convertTemperature(left.value, left.tempKind, targetTemp);
          return { expr: line, value: val, display: displayNumber(val, targetUnit!) };
        } else {
          // 普通比例单位：left.value 存的是「数字 × 原 scale」，所以除以 target.scale
          const targetDef = UNIT_MAP.get(targetUnit.toLowerCase());
          if (!targetDef) return null;
          if (left.baseUnit && left.baseUnit !== targetDef.base) return null;   // 跨 base（m→kg）拒绝
          const val = left.value / targetDef.scale;
          return { expr: line, value: val, display: displayNumber(val, targetUnit!), outUnit: targetUnit };
        }
      }

      // 2) 纯算术求值
      const rpn = toRPN(tok.tokens);
      if (rpn.error) return null;
      const v = evalRPN(rpn.rpn);
      // 如果用户写的是 "5 cm"，输出时回显到最紧凑的单位（原单位）；否则不带单位
      return { expr: line, value: v.value, display: displayNumber(v.value) };
    } catch {
      return null;
    }
  };

  /** 尝试把用户输入的任意一行解释为算式；失败返回 null（非算式：让上一层交给搜索）。 */
  const tryEvaluateLine = (line: string): CalcResult | null => {
    if (!line || line.length < 2) return null;
    // 纯中文/纯单词（不含数字和单位）不计算
    if (!/[0-9+\-*/%^()]/.test(line) && !/[°'"]/.test(line)) return null;
    return evaluate(line);
  };

  if (inputRef) {
    // 如果调用方提供了 inputRef：响应式 evaluate 是外部的事，这里只暴露函数
  }

  return { evaluate, tryEvaluateLine };
}

export default useCalculator;
