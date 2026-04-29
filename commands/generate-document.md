调用 generate-document 技能生成文档。

参数：$ARGUMENTS

常用示例：

- `/generate-document <功能名>-<一句话描述>`：生成 `docs/<功能名>/` 下全文档编号集（01-05, 07）
- `/generate-document weekly`：生成周报（单文档），落盘到 `docs/周报/<YYYY-MM-DD>~<YYYY-MM-DD>_周报.md`
- `/generate-document weekly <日期或起止日期>`：按自然周（周一~周日）生成周报

请使用 Skill 工具调用 generate-document 技能，传入上述参数。