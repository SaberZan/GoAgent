# 火山引擎豆包语音接入

GoAgent 支持把老师讲解朗读交给火山引擎豆包语音。这个能力是显式选择的云端 provider：

- 默认语音仍是 `kokoro-bundled` 本地离线语音。
- 只有用户在设置里选择 `火山引擎 · 豆包语音` 时，GoAgent 才会把朗读文本发送给火山引擎。
- 火山调用失败时直接显示错误，不会自动切换到 Kokoro、自定义 API 或系统语音。
- API Key 使用 Electron `safeStorage` 保存，不写入普通 settings、日志或报告。

## 接口策略

第一版使用火山官方 HTTP Chunked V3 接口：

```text
POST https://openspeech.bytedance.com/api/v3/tts/unidirectional
```

请求头：

- `X-Api-Key`: 火山控制台 API Key
- `X-Api-Resource-Id`: 默认 `seed-tts-2.0`
- `X-Api-Request-Id`: GoAgent 每次请求生成的随机 ID

GoAgent 会读取火山流式返回的 JSON，把 `data` 字段里的 base64 音频片段拼接成 MP3 文件，再交给现有播放器。

## 推荐配置

- Resource ID: `seed-tts-2.0`
- Model: `seed-tts-2.0-standard`
- Format: `mp3`
- Sample rate: `24000`

预置音色仅作为便捷入口。若火山控制台给出的 speaker ID 与预置不同，可以在“自定义 speaker”里直接填入控制台音色 ID。

## 隐私边界

使用火山 provider 时，发送给火山的内容是当前朗读文本，也就是老师讲解中准备播放的文本。GoAgent 不会上传棋谱文件、学生画像或 KataGo 原始缓存，除非这些内容已经包含在用户要求朗读的文本里。

## 后续方向

- 支持 SSE 事件解析的播放进度。
- 支持 WebSocket 双向流式，实现更低延迟的边生成边播放。
- 支持按语种/老师风格维护更完整的音色预设。
