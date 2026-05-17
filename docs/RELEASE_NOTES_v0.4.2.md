# GoAgent v0.4.2

GoAgent v0.4.2 makes the teacher runtime more agentic and removes the macOS keychain friction from API key settings. The AI teacher can now call board screenshots, KataGo analysis, trace packets, move comparison, local knowledge search, joseki, life-and-death and tesuji tools as first-class tools, then explain from the returned evidence instead of relying on a fixed preprocessing path.

QQ 群：1030632742，欢迎一起交流、提建议、完善 GoAgent。

> v0.4.2 provides the Windows NVIDIA edition as `GoAgent-0.4.2-win-x64-nvidia-portable.zip`. The NVIDIA installer is not attached in this local release because the NSIS package is too large for reliable local compression; use the portable ZIP for NVIDIA runtime.

> macOS packages are signed with an Apple Developer ID certificate. Notarization is not attached to this local release because Apple notarization waiting did not complete in time, so Gatekeeper may still ask for confirmation on first launch.

## 中文

### 下载前先选版本

| 平台 / 场景 | 推荐下载 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.2-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.2-mac-x64.dmg` |
| Windows 普通版，OpenCL 推荐包 | `GoAgent-0.4.2-win-x64.exe` 或 `GoAgent-0.4.2-win-x64-portable.zip` |
| Windows NVIDIA 专版 | `GoAgent-0.4.2-win-x64-nvidia-portable.zip` |
| 校验文件 | `SHA256SUMS.txt` |

macOS 安装包已使用 Apple Developer ID 签名；本机发布时 Apple 公证等待未及时完成，所以首次打开仍可能出现 Gatekeeper 提示。

### 本版重点

- 老师改成 Tool-first 围棋 Agent：截图、KataGo 当前局面、整盘/区间分析、Trace Packet、候选点比较、本地知识库、定式、死活、手筋、学生画像都作为 LLM 可自主调用的工具。
- 当前手、整盘、区间和自由提问入口不再硬编码完整固定流程；按钮只发起任务，老师根据任务自己拿证据。
- 棋盘截图成为真实工具调用结果，会以高细节图片回填给多模态 LLM，并纳入 Vision Evidence Chain，避免老师误说“没有棋盘图”。
- 老师任务启动时会暂停后台 quick/live KataGo 工作，减少手动讲解时的引擎抢资源和超时。
- 当前手已有缓存分析时会复用缓存，避免重复跑 KataGo。
- API Key / TTS Key 不再使用系统钥匙串或 Electron safeStorage，改为 GoAgent 本机 secret store，避免 macOS 频繁弹授权密码。
- 文档同步说明新的本机密钥存储策略；旧钥匙串加密记录不会自动读取，重新粘贴保存一次后就会写入新本机存储。

## 繁體中文

### 下載前先選版本

| 平台 / 使用情境 | 建議下載 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.2-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.2-mac-x64.dmg` |
| Windows 一般版，OpenCL 推薦包 | `GoAgent-0.4.2-win-x64.exe` 或 `GoAgent-0.4.2-win-x64-portable.zip` |
| Windows NVIDIA 專版 | `GoAgent-0.4.2-win-x64-nvidia-portable.zip` |
| 校驗檔 | `SHA256SUMS.txt` |

### 本版重點

- 老師升級為 Tool-first 圍棋 Agent，可自主調用棋盤截圖、KataGo、Trace Packet、候選點比較、本地知識庫、定式、死活、手筋與學生畫像。
- 棋盤截圖會作為高細節多模態證據回填給 LLM，避免缺圖誤判。
- 老師講解時會暫停後台 KataGo 任務，並優先復用已有分析快取。
- API Key / TTS Key 改用 GoAgent 本機 secret store，不再觸發 macOS 鑰匙圈授權彈窗。

## English

### Pick the right package before downloading

| Platform / use case | Recommended download |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.2-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.2-mac-x64.dmg` |
| Standard Windows x64, OpenCL recommended | `GoAgent-0.4.2-win-x64.exe` or `GoAgent-0.4.2-win-x64-portable.zip` |
| Windows NVIDIA edition | `GoAgent-0.4.2-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### Why update

- The teacher runtime is now tool-first: board screenshots, KataGo position/game/range analysis, trace packets, move comparison, local knowledge, joseki, life-and-death, tesuji and student profile data are exposed as LLM-callable tools.
- Board screenshots are real tool results and are injected back into the multimodal conversation with high-detail image evidence.
- Teacher runs pause background quick/live KataGo work and reuse current-move cache when available, reducing resource contention.
- API keys no longer use the OS keychain / Electron safeStorage. GoAgent stores them in its own local secret store to avoid repeated macOS authorization prompts.

## 日本語

### ダウンロード前に選ぶもの

| 環境 | 推奨ファイル |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.2-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.2-mac-x64.dmg` |
| Windows 標準版、OpenCL 推奨 | `GoAgent-0.4.2-win-x64.exe` または `GoAgent-0.4.2-win-x64-portable.zip` |
| Windows NVIDIA 版 | `GoAgent-0.4.2-win-x64-nvidia-portable.zip` |
| チェックサム | `SHA256SUMS.txt` |

### 主な変更

- AI 教師が盤面画像、KataGo、候補手比較、知識ベース、定石、死活、手筋をツールとして自律的に呼び出せるようになりました。
- 盤面画像は高精細の視覚証拠として LLM に渡されます。
- API キー保存で macOS キーチェーンの確認ダイアログが出ないよう、GoAgent ローカル secret store に変更しました。

## 한국어

### 다운로드 전 선택

| 환경 | 권장 다운로드 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.2-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.2-mac-x64.dmg` |
| Windows 표준 x64, OpenCL 권장 | `GoAgent-0.4.2-win-x64.exe` 또는 `GoAgent-0.4.2-win-x64-portable.zip` |
| Windows NVIDIA 에디션 | `GoAgent-0.4.2-win-x64-nvidia-portable.zip` |
| 체크섬 | `SHA256SUMS.txt` |

### 이번 버전

- AI 선생님이 보드 스크린샷, KataGo 분석, 후보수 비교, 로컬 지식베이스, 정석, 사활, 맥점을 직접 도구로 호출합니다.
- 보드 이미지는 고해상도 멀티모달 증거로 전달됩니다.
- API 키 저장에서 macOS 키체인 팝업을 제거하고 GoAgent 로컬 secret store를 사용합니다.

## ภาษาไทย

### เลือกไฟล์ก่อนดาวน์โหลด

| แพลตฟอร์ม | ไฟล์ที่แนะนำ |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.2-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.2-mac-x64.dmg` |
| Windows x64 มาตรฐาน แนะนำ OpenCL | `GoAgent-0.4.2-win-x64.exe` หรือ `GoAgent-0.4.2-win-x64-portable.zip` |
| Windows รุ่น NVIDIA | `GoAgent-0.4.2-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### จุดสำคัญของรุ่นนี้

- ครู AI เรียกใช้ภาพกระดาน, KataGo, การเปรียบเทียบตัวเลือก, ฐานความรู้, joseki, life-and-death และ tesuji เป็นเครื่องมือได้เอง
- ภาพกระดานถูกส่งกลับเป็นหลักฐานภาพความละเอียดสูงให้โมเดล multimodal
- การเก็บ API key ไม่ใช้ macOS Keychain แล้ว จึงไม่ขึ้นหน้าต่างขอรหัสผ่านซ้ำ

## Tiếng Việt

### Chọn gói tải xuống

| Nền tảng | Gói khuyến nghị |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.2-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.2-mac-x64.dmg` |
| Windows x64 tiêu chuẩn, khuyến nghị OpenCL | `GoAgent-0.4.2-win-x64.exe` hoặc `GoAgent-0.4.2-win-x64-portable.zip` |
| Windows phiên bản NVIDIA | `GoAgent-0.4.2-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### Điểm mới

- Giáo viên AI có thể tự gọi công cụ: ảnh bàn cờ, KataGo, so sánh nước đi, knowledge base, joseki, sống-chết và tesuji.
- Ảnh bàn cờ được gửi như bằng chứng thị giác độ chi tiết cao cho LLM đa phương thức.
- API key không còn dùng macOS Keychain, tránh hộp thoại xin quyền lặp lại.

## Quality baseline

Validated locally with:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm check:teacher-quality`

The release keeps the existing grounded-teaching quality gates: grounded shape recognition engine, local pattern matcher, knowledge source-policy gates, optimized move-range review, quality checks and eval gates, Real Eval / engine silver fixture gate, KataGo engine pool telemetry, Release artifact smoke, student level, student age, teacher persona style settings with evidence boundary, teacher sessions, selective PR #6 integration, Kokoro selected-provider TTS, offline synthesis, Vision Evidence Chain, KataGo Trace Translator, Volcengine / Doubao TTS, Windows OpenCL runtime bundle, KataGo OpenCL adjacent runtime files, and explicit guidance that GPU vendor OpenCL drivers still come from the user's installed graphics driver.

Thanks to layiku and wimi321.
