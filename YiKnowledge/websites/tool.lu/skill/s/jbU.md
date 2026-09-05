---
title: issue-maker - 在线工具
url: https://tool.lu/skill/s/jbU
source: YiPet
---

---
title: "issue-maker - 在线工具"
url: "https://tool.lu/skill/s/jbU"
captured_at: 2026-08-31T15:02:35.362Z
source: YiPet
---

# issue-maker - 在线工具

在线工具
语言 
登录
开放注册
在线工具
搜索

解密字帖放假安排

token中转
排行榜
我的
首页
工具
文库
码库
软件
网址
话题
小摊
反馈
片段
类库
Skills
Agent Skills › pollinations/pollinations › issue-maker
issue-maker
GitHub

根据团队规范在 GitHub 仓库创建 Issue，支持研究现有问题、规划任务及生成标准化描述，用于追踪工作或计划功能。

.claude/skills/issue-maker/SKILL.md
 pollinations/pollinations
触发场景
用户要求创建 GitHub Issue
需要追踪工作任务
需要规划新功能
安装
npx skills add pollinations/pollinations --skill issue-maker -g -y
复制
更多选项
SKILL.md
Frontmatter
Issue-Maker

Turn any user request into GitHub issues following team conventions.

Hard Rules
Repo: pollinations/pollinations
Assignee: Assign to appropriate team member based on domain expertise
No local side-effects (no file creation/modification)
Workflow
1. Research First

Before creating any issues:

# Check @eulervoid's PRs for style inspiration (concise, bullet-point format)
gh search prs --repo pollinations/pollinations --author eulervoid --limit 5

# Search existing issues for patterns
gh search issues --repo pollinations/pollinations "KEYWORD" --limit 5

2. Plan

List all planned issues:

One sentence description per issue
Identify assignee and labels
Note related PRs or issues
3. Create
gh issue create --repo pollinations/pollinations \
  --title "EMOJI Short clear title" \
  --body "- Bullet point 1
- Bullet point 2
- Bullet point 3" \
  --assignee HANDLE \
  --label "LABEL"

4. Output

Provide Discord-compatible summary:

Bold titles with issue numbers
Plain URLs on separate lines (Discord auto-embeds)
Group by category
Team Handles
Name	GitHub	Domain
Thomas	@voodoohop	General, Models, Infra
Joshua	@eulervoid	Pollen, Backend, Auth
Elliot	@elliotetag	Community, Newsletter, UI
Common Labels
Label	Use Case
TRACKING	Meta/planning issues that track multiple sub-tasks
NEWS	Community announcements and updates
ext-issue	External user requests and support follow-ups
app:review	New project submission (under review)
app:info-needed	Submission awaiting user response
app:approved	Project approved and merged
app:denied	Submission rejected
Issue Templates
Standard Issue (max 3 bullets)
-   Adds X to Y
-   Fix Z by doing W
-   Related: #1234

Tracking Issue (more detailed)
## Overview

Brief description

## Tasks

-   [ ] Task 1
-   [ ] Task 2
-   [ ] Task 3

## Related

-   #issue1
-   #issue2

Account Support Request
-   Account support for @USERNAME
-   Qualification: [reason]
-   Related: #original_request_issue

Style Guide
Short, sharp, no fluff
Smart emojis (not overdone)
Bullet points over paragraphs
Reference @eulervoid's style: repo:pollinations/pollinations author:eulervoid
Example Commands

Create simple issue:

gh issue create --repo pollinations/pollinations \
  --title "🔧 Fix caching header for image service" \
  --body "- Update cache-control header
- Add proper ETag support
- Related: #4100" \
  --assignee voodoohop


Create tracking issue:

gh issue create --repo pollinations/pollinations \
  --title "📋 TRACKING: Q4 Model Updates" \
  --body "## Overview
Track all model-related updates for Q4

## Tasks
- [ ] Add Claude Sonnet 4.5
- [ ] Update pricing tiers
- [ ] Deprecate old models" \
  --label "TRACKING" \
  --assignee voodoohop


Comment on issue:

gh issue comment 1234 --repo pollinations/pollinations \
  --body "✅ Done! Merged in #5678"

版本历史
99bce92 当前 2026-07-25 10:38
同 Skill 集合
abuse-detection
.claude/skills/abuse-detection/SKILL.md
candidate-evaluation
.claude/skills/candidate-evaluation/SKILL.md
code-formatting
.claude/skills/code-formatting/SKILL.md
community-leaderboard
.claude/skills/community-leaderboard/SKILL.md
economics-provider-collection
.claude/skills/economics-provider-collection/SKILL.md
enter-services
.claude/skills/enter-services/SKILL.md
manage-vast-gpu-fleet
.claude/skills/manage-vast-gpu-fleet/SKILL.md
model-debugging
.claude/skills/model-debugging/SKILL.md
model-management
.claude/skills/model-management/SKILL.md
monitor-services
.claude/skills/monitor-services/SKILL.md
polli-video
.claude/skills/polli-video/SKILL.md
polli
.claude/skills/polli/SKILL.md
r2-glacier-migration
.claude/skills/r2-glacier-migration/SKILL.md
spending-analysis
.claude/skills/spending-analysis/SKILL.md
sync-production
.claude/skills/sync-production/SKILL.md
tinybird-deploy
.claude/skills/tinybird-deploy/SKILL.md
voting-status
.claude/skills/voting-status/SKILL.md
web-research
.claude/skills/web-research/SKILL.md
founder-meditation
apps/openclaw/skills/founder-meditation/SKILL.md
polli
packages/polli-cli/SKILL.md

查看所属 Skill 集合 ›

元信息
文件数
0
版本
0cc8109
Hash
fa387310
收录时间
2026-07-25 10:38
    存到桌面
据说喜欢分享的,后来都成了大神
知鸦日报
每日精选
 提交句子
不上不下的长相，不上不下的家庭，不上不下的学校，不上不下的人生。你，就是那个长相一般，成绩中游，没有特长，连同学都记不住你名字的人，没有爱情，没有钱。
文库
更多
1 The Cloudflare Blog – Brought to you by EmDash
2 面向 Agent 沙箱的内核全景观测
3 DeepSeek Harness：重新设计 Agent 运行时
4 How Warp builds self-improving agents on Claude
5 DBの性能検証を人の判断に委ねない ── ストアド改修の実行計画をCIで取得しLLMがレビューする仕組み
6 GoogleドライブからBoxへの大量データ移行 ── Box Shuttleと現場の協力で乗り越えた移行の壁
7 Beyond the Dashboard: Accelerating Real-Time Intelligence in the Age of AI
8 Data Mesh at Grab (Part III): Operationalizing data reliability with automated DPIs
9 MAPS: Netflix’s Multimodal Asset Personalization at Scale
10 万字字节AI全景：从豆包到全系产品布局的秘密
11 从替人写代码到为智能体造世界
12 场景营销互动&体验 AI Coding— AI Native 视觉还原的两个支点：上下文工程与循环工程
13 代码改了，文档却“死”了？携程机票“代码即文档”实践，让隐性知识随代码共同生长
14 屎会乖乖排队吗
15 AI工程范式的跃迁，一文讲透Context Engineering！

首页 - Wiki
Copyright © 2011-2026 iteam. Current version is 2.155.2. UTC+08:00, 2026-08-31 23:02
浙ICP备14020137号-1 $访客地图$