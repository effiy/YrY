"""skill-creator 脚本的共享工具函数。"""

import os
from pathlib import Path


def parse_skill_md(skill_path: Path) -> tuple[str, str, str]:
    """解析 SKILL.md 文件，返回 (名称, 描述, 完整内容)。"""
    content = (skill_path / "SKILL.md").read_text()
    lines = content.split("\n")

    if lines[0].strip() != "---":
        raise ValueError("SKILL.md 缺少 frontmatter（没有开头的 ---）")

    end_idx = None
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        raise ValueError("SKILL.md 缺少 frontmatter（没有结尾的 ---）")

    name = ""
    description = ""
    frontmatter_lines = lines[1:end_idx]
    i = 0
    while i < len(frontmatter_lines):
        line = frontmatter_lines[i]
        if line.startswith("name:"):
            name = line[len("name:"):].strip().strip('"').strip("'")
        elif line.startswith("description:"):
            value = line[len("description:"):].strip()
            if value in (">", "|", ">-", "|-"):
                continuation_lines: list[str] = []
                i += 1
                while i < len(frontmatter_lines) and (
                    frontmatter_lines[i].startswith("  ")
                    or frontmatter_lines[i].startswith("\t")
                ):
                    continuation_lines.append(frontmatter_lines[i].strip())
                    i += 1
                description = " ".join(continuation_lines)
                continue
            else:
                description = value.strip('"').strip("'")
        i += 1

    return name, description, content


def find_project_root() -> Path:
    """从当前目录向上查找 .claude/ 目录，找到项目根目录。

    模拟 Claude Code 发现其项目根目录的方式，以便我们创建的命令文件
    最终位于 claude -p 会查找的位置。
    """
    current = Path.cwd()
    for parent in [current, *current.parents]:
        if (parent / ".claude").is_dir():
            return parent
    return current


def clean_claude_env() -> dict[str, str]:
    """返回移除了 CLAUDECODE 环境变量的 os.environ 副本。

    移除 CLAUDECODE 允许在 Claude Code 会话中嵌套 claude -p 子进程。
    该保护措施是为交互式终端冲突而设；程序化子进程使用是安全的。
    """
    return {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}