# Vision Evidence Chain

GoAgent 的老师任务必须同时使用 KataGo 数据、棋盘图和本地知识库。过去如果某一次请求没有真正附上棋盘图，或兼容代理丢弃了图片，LLM 可能会说“因为没有棋盘图”。本模块把棋盘图从隐式假设升级为显式证据链。

## 目标

- 当前手分析和区间复盘必须显式记录是否附图。
- 图片必须经过大小、MIME、data URL 合法性检查。
- 发送给 LLM 的图片默认使用 `detail=high`。
- 每张图都有 caption，说明是当前手棋盘图还是区间关键手图。
- 如果已附图，老师严禁说“没有棋盘图 / 看不到图片”。
- 如果任务要求图片但没有图片，程序应阻止任务，而不是让 LLM 猜。

## 数据结构

`VisionEvidenceReport` 记录：

```text
required          当前任务是否要求棋盘图
attached          本轮是否附图
imageCount        图片数量
images            每张图的 role / moveNumber / bytes / mime / size / caption
warnings          非阻塞警告
blockingIssues    必须阻止任务的问题
```

## 哪些任务要求图片

```text
current-move  必须有当前棋盘图
move-range    必须有区间关键手图
freeform      不强制，但如果提供图片仍会记录证据
```

## 图片限制

硬限制：

```text
单图最大 8MB
MIME 只允许 image/png 或 image/jpeg
必须是 data:image/...;base64 URL
```

推荐限制：

```text
单图最好小于 2MB
推荐 1024x1024 或接近尺寸
```

## Prompt 行为

老师 prompt 会包含：

```text
【棋盘图证据】本轮已附 N 张棋盘图，detail=high。
本轮已经提供棋盘图。除非 visionEvidence.attached=false，否则严禁说“没有棋盘图”。
```

每张图之前会插入一条文字 caption，例如：

```text
图 1: 第 87 手棋盘截图；请结合 KataGo 数据核对实战手、候选点和棋形。
```

## Verifier

`verifyVisionEvidenceMarkdown()` 会检查：

- `visionEvidence.attached=true` 时，回答不得声称没有棋盘图。
- `visionEvidence.required=true` 且未附图时，标记为 error。

## Provider 约束

`ChatContentPart` 支持：

```ts
{ type: 'image_url', image_url: { url, detail: 'high' } }
```

OpenAI-compatible provider 的 vision probe 也使用 `detail=high`。如果某个兼容代理不支持图片或丢弃图片，应该在设置测试阶段暴露，而不是让老师运行时猜。

## 后续建议

下一步可以继续做：

1. Renderer UI 显示“已附棋盘图 1 张 · 842KB · high detail”。
2. LLM 设置页增加 vision capability test，并保存 `llmSupportsVision`。
3. 失败时把 `VisionEvidenceReport` 写入报告 JSON，但不保存 base64 图片。
4. 在 `qualityGate` 中合并 vision verifier，使错误自动进入修复轮。

## 质量检查

```bash
pnpm eval:vision-evidence
pnpm test
```

`eval:vision-evidence` 是 contract gate，确保 vision evidence 类型、服务、teacherAgent wiring、provider `detail=high` 和 verifier 都存在。
