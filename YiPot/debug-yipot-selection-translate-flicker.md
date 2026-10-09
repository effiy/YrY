# Debug Session: yipot-selection-translate-flicker
- **Status**: [OPEN]
- **progress_status**: collecting
- **Issue**: YiPot 全局快捷键触发划词翻译时翻译窗口持续闪烁（上一轮修复在用户机器无改善）。
- **Evidence Source**: HTTP Debug Server（优先），否则回退到 tauri-plugin-log 的本地日志（LogDir）。
- **Evidence Directory**: /var/folders/_trae/yipot-selection-translate-flicker
- **Debug Server**: TBD after probe
- **Log File**: /var/folders/_trae/yipot-selection-translate-flicker/trae-debug-log-yipot-selection-translate-flicker.ndjson

## Reproduction Steps
1. 启动 YiPot Tauri 应用（已编译最新）。
2. 在任意 App 中选中一段文本（如备忘录、VS Code）。
3. 按下「划词翻译」全局热键。
4. 观察：翻译窗出现后闪烁 ≥ 2 次 / 持续抖动。

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | 同一热键单次按下仍触发多次 `selection_translate()`（后端 handler 叠加 / macOS 全局热键 keyDown+keyUp 各触发一次） | High | Low | Pending |
| B | `show()`/`setFocus()` 在「从其它 App 抢焦点」过程中触发瞬时 blur→focus 循环，300ms 阈值仍然不够 | High | Low | Pending |
| C | `build_window` 每次热键都走 visible(false)→position/size→emit→(前端) show，存在瞬时 hide→show→hide 的可见状态抖动 | Med | Med | Pending |
| D | `window.rs::set_focus().unwrap()` 在 `build_window` 的 exists 分支里与前端后续的 `show/setFocus` 并发冲突（同一帧多次 setFocus） | Med | Low | Pending |
| E | `selection::get_text()` 通过 accessibility / 剪切板读取，产生多次系统事件，导致应用焦点被其它进程瞬间抢占并归还，进而触发 blur 关闭 | Low | Med | Pending |

## Log Evidence
(待收集后填充)

## Verification Conclusion
(待 post-fix 证据填入)

## Final Evidence Gate
- **Evidence Sources**: (填写)
- **progress_status**: collecting
- **Hypothesis Conclusions**: A=Pending / B=Pending / C=Pending / D=Pending / E=Pending
