"""Alert generation from code health metric thresholds."""

from typing import Any


def _generate_alerts(
    scale: dict, density: dict, reuse: dict, duplication: dict,
    max_file_warn: int, max_file_danger: int,
    comment_rate_warn: float, comment_rate_danger: float,
    reuse_rate_warn: float, reuse_rate_danger: float,
    dup_rate_warn: float, dup_rate_danger: float,
) -> list[dict[str, Any]]:
    alerts: list[dict[str, Any]] = []

    if scale["max_file"]["lines"] > max_file_danger:
        alerts.append({"level": "danger", "metric": "max_file_lines", "message": f"{scale['max_file']['path']} {scale['max_file']['lines']} 行，超过 {max_file_danger} 行危险阈值", "suggestion": "建议拆分为多个子组件或模块", "file": scale["max_file"]["path"]})
    elif scale["max_file"]["lines"] > max_file_warn:
        alerts.append({"level": "warn", "metric": "max_file_lines", "message": f"{scale['max_file']['path']} {scale['max_file']['lines']} 行，超过 {max_file_warn} 行警告阈值", "suggestion": "考虑拆分为多个子组件或模块", "file": scale["max_file"]["path"]})

    if density["comment_rate"] < comment_rate_danger:
        alerts.append({"level": "danger", "metric": "comment_rate", "message": f"注释率 {density['comment_rate']:.1%}，低于 {comment_rate_danger:.0%} 危险阈值", "suggestion": "建议为核心模块补充文档注释", "file": None})
    elif density["comment_rate"] < comment_rate_warn:
        alerts.append({"level": "warn", "metric": "comment_rate", "message": f"注释率 {density['comment_rate']:.1%}，低于 {comment_rate_warn:.0%} 警告阈值", "suggestion": "建议为核心模块补充文档注释", "file": None})

    if reuse["component_defs"] > 0:
        if reuse["reuse_rate"] < reuse_rate_danger:
            alerts.append({"level": "danger", "metric": "reuse_rate", "message": f"组件复用率 {reuse['reuse_rate']:.1f}x，低于 {reuse_rate_danger:.0f}x 危险阈值", "suggestion": "提取公共逻辑为可复用组件", "file": None})
        elif reuse["reuse_rate"] < reuse_rate_warn:
            alerts.append({"level": "warn", "metric": "reuse_rate", "message": f"组件复用率 {reuse['reuse_rate']:.1f}x，低于 {reuse_rate_warn:.0f}x 警告阈值", "suggestion": "检查是否有可提取的公共组件", "file": None})
        if len(reuse["unused_components"]) > 3:
            alerts.append({"level": "warn", "metric": "unused_components", "message": f"{len(reuse['unused_components'])} 个组件未被使用", "suggestion": "检查是否为废弃组件，可考虑删除以减少维护成本", "file": None})
        elif 0 < len(reuse["unused_components"]) <= 3:
            names = ", ".join(c["path"].split("/")[-1] for c in reuse["unused_components"])
            alerts.append({"level": "warn", "metric": "unused_components", "message": f"未使用组件: {names}", "suggestion": "检查是否为废弃组件，可考虑删除", "file": None})

    if duplication["duplicate_rate"] > dup_rate_danger:
        alerts.append({"level": "danger", "metric": "duplicate_rate", "message": f"代码重复率 {duplication['duplicate_rate']:.1%}，超过 {dup_rate_danger:.0%} 危险阈值（{duplication['duplicate_blocks']} 个重复块）", "suggestion": "提取重复代码为公共函数或组件，降低维护成本", "file": None})
    elif duplication["duplicate_rate"] > dup_rate_warn:
        alerts.append({"level": "warn", "metric": "duplicate_rate", "message": f"代码重复率 {duplication['duplicate_rate']:.1%}，超过 {dup_rate_warn:.0%} 警告阈值（{duplication['duplicate_blocks']} 个重复块）", "suggestion": "关注重复代码，考虑提取公共逻辑", "file": None})

    return alerts
