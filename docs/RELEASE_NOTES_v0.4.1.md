# GoAgent v0.4.1

GoAgent v0.4.1 is a hotfix release for v0.4.0. It unblocks freeform teacher chat that was raising "棋盘图证据不完整" for prompts the backend classifier interpreted as vision-required, and gives KataGo whole-game analysis a larger timeout budget so heavy networks (e.g. the bundled zhizi b28) can finish a long game without aborting partway through.

QQ 群：1030632742，欢迎一起交流、提建议、完善 GoAgent。

> `GoAgent-0.4.1-win-x64-nvidia-portable.zip` is not attached to this release because its packaged size exceeds GitHub's 2 GB single-asset upload limit; if you need an NVIDIA portable build, run `pnpm dist:local:win` locally.

## 中文

### 下载前先选版本

| 平台 / 场景 | 推荐下载 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.1-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.1-mac-x64.dmg` |
| Windows 普通版，OpenCL 推荐包 | `GoAgent-0.4.1-win-x64.exe` 或 `GoAgent-0.4.1-win-x64-portable.zip` |
| Windows NVIDIA 专版 | `GoAgent-0.4.1-win-x64-nvidia.exe`（`GoAgent-0.4.1-win-x64-nvidia-portable.zip` 超出 GitHub 2 GB 上传限制，请用 `pnpm dist:local:win` 本机打包） |
| 校验文件 | `SHA256SUMS.txt` |

### 本版重点

- 修复手动给老师输入问题时，遇到「为什么这里」「这里不好」「分析一下」等关键词被分类器错判为需要棋盘图的任务，从而抛出「棋盘图证据不完整」错误而无法发送。现在棋盘图是否必需仅由前端显式 `request.mode` 决定（`current-move` / `move-range`），freeform 聊天即使分类器推断出 current-move 也不再阻断，agent 收到 `boardImageAttached=false` 的上下文后会改用 SGF / KataGo 工具回答。
- 修复 KataGo 整盘胜率分析跑到一半超时、曲线只画出前几手的问题。把单局查询预算从 2.5 秒/手提到 5 秒/手（最低 180 秒），让 zhizi b28 等重网络也有足够时间跑完一整盘。

## 繁體中文

### 下載前先選版本

| 平台 / 使用情境 | 建議下載 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.1-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.1-mac-x64.dmg` |
| Windows 一般版，OpenCL 推薦包 | `GoAgent-0.4.1-win-x64.exe` 或 `GoAgent-0.4.1-win-x64-portable.zip` |
| Windows NVIDIA 專版 | `GoAgent-0.4.1-win-x64-nvidia.exe`（`GoAgent-0.4.1-win-x64-nvidia-portable.zip` 因 GitHub 單檔 2 GB 上限未上傳） |
| 校驗檔 | `SHA256SUMS.txt` |

### 本版重點

- 修復手動向老師輸入問題時，因關鍵詞被分類器判定為需要棋盤圖而拋出「棋盤圖證據不完整」的問題。
- 修復整盤胜率分析跑到一半超時的問題，分析預算提升到 5 秒/手。

## English

### Pick the right package before downloading

| Platform / use case | Recommended download |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.1-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.1-mac-x64.dmg` |
| Standard Windows x64, OpenCL recommended | `GoAgent-0.4.1-win-x64.exe` or `GoAgent-0.4.1-win-x64-portable.zip` |
| Windows NVIDIA edition | `GoAgent-0.4.1-win-x64-nvidia.exe` (the `GoAgent-0.4.1-win-x64-nvidia-portable.zip` artifact exceeds GitHub's 2 GB per-asset limit; build it locally with `pnpm dist:local:win`) |
| Checksums | `SHA256SUMS.txt` |

### Why update

- Manual freeform prompts to the teacher no longer raise "棋盘图证据不完整 (board image evidence incomplete)" when the question matches keywords like `为什么这里` / `这里不好` / `分析一下` that the backend classifier interpreted as a vision-required intent. Image requirement is now driven only by the renderer's explicit `request.mode`; freeform chats route as freeform regardless of inferred intent, and the agent receives the same `boardImageAttached=false` context so it falls back to SGF / KataGo tools instead of refusing.
- KataGo whole-game analysis no longer times out partway through long games. The per-query budget is raised from 2.5 s to 5 s (and the floor from 120 s to 180 s), giving the bundled zhizi b28 network enough room to finish a 200-move sweep without leaving the winrate curve stuck on the opening moves.

## 日本語

### ダウンロード前に選ぶもの

| 環境 | 推奨ファイル |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.1-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.1-mac-x64.dmg` |
| Windows 標準版、OpenCL 推奨 | `GoAgent-0.4.1-win-x64.exe` または `GoAgent-0.4.1-win-x64-portable.zip` |
| Windows NVIDIA 版 | `GoAgent-0.4.1-win-x64-nvidia.exe`（`GoAgent-0.4.1-win-x64-nvidia-portable.zip` は GitHub の 2 GB 制限を超えるため未配布） |
| チェックサム | `SHA256SUMS.txt` |

### 主な変更

- フリーフォームの質問が分類器によって画像必須と誤判定され、「棋盘图证据不完整」で送信できなくなる不具合を修正しました。
- 整局勝率分析が途中でタイムアウトする不具合を修正し、1 手あたりの予算を 5 秒に拡大しました。

## 한국어

### 다운로드 전 선택

| 환경 | 권장 다운로드 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.1-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.1-mac-x64.dmg` |
| Windows 표준 x64, OpenCL 권장 | `GoAgent-0.4.1-win-x64.exe` 또는 `GoAgent-0.4.1-win-x64-portable.zip` |
| Windows NVIDIA 에디션 | `GoAgent-0.4.1-win-x64-nvidia.exe`(`GoAgent-0.4.1-win-x64-nvidia-portable.zip`은 GitHub의 2GB 단일 자산 한도를 초과하여 업로드되지 않았습니다) |
| 체크섬 | `SHA256SUMS.txt` |

### 이번 버전

- 사용자가 자유롭게 입력한 질문이 분류기에 의해 이미지 필수 작업으로 잘못 분류되어 "棋盘图证据不完整" 오류가 발생하던 문제를 수정했습니다.
- 전체 대국 승률 분석이 도중에 타임아웃되는 문제를 수정하고 수당 분석 예산을 5초로 늘렸습니다.

## ภาษาไทย

### เลือกไฟล์ก่อนดาวน์โหลด

| แพลตฟอร์ม | ไฟล์ที่แนะนำ |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.1-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.1-mac-x64.dmg` |
| Windows x64 มาตรฐาน แนะนำ OpenCL | `GoAgent-0.4.1-win-x64.exe` หรือ `GoAgent-0.4.1-win-x64-portable.zip` |
| Windows รุ่น NVIDIA | `GoAgent-0.4.1-win-x64-nvidia.exe` (ไฟล์ `GoAgent-0.4.1-win-x64-nvidia-portable.zip` ใหญ่เกินขีดจำกัด 2 GB ของ GitHub จึงไม่ถูกอัปโหลด) |
| Checksums | `SHA256SUMS.txt` |

### จุดสำคัญของรุ่นนี้

- แก้ปัญหาที่คำถามอิสระบางคำถูกตีความว่าเป็นงานที่ต้องใช้ภาพกระดาน จนทำให้แสดงข้อผิดพลาด "棋盘图证据不完整"
- แก้ปัญหาที่การวิเคราะห์อัตราชนะตลอดทั้งเกมหมดเวลากลางทาง โดยขยายงบประมาณต่อหมากจาก 2.5 วินาทีเป็น 5 วินาที

## Tiếng Việt

### Chọn gói tải xuống

| Nền tảng | Gói khuyến nghị |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.1-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.1-mac-x64.dmg` |
| Windows x64 tiêu chuẩn, khuyến nghị OpenCL | `GoAgent-0.4.1-win-x64.exe` hoặc `GoAgent-0.4.1-win-x64-portable.zip` |
| Windows phiên bản NVIDIA | `GoAgent-0.4.1-win-x64-nvidia.exe` (gói `GoAgent-0.4.1-win-x64-nvidia-portable.zip` vượt giới hạn 2 GB của GitHub nên chưa được tải lên) |
| Checksums | `SHA256SUMS.txt` |

### Điểm mới

- Khắc phục lỗi khi câu hỏi tự do bị bộ phân loại hiểu là tác vụ cần ảnh bàn cờ, dẫn đến lỗi "棋盘图证据不完整".
- Khắc phục lỗi phân tích winrate cả ván bị hết thời gian giữa chừng, tăng ngân sách mỗi nước lên 5 giây.

## Quality baseline

This release keeps the existing top-quality baseline: grounded shape recognition engine, local pattern matcher, knowledge source-policy gates, optimized move-range review, quality checks and eval gates, Real Eval / engine silver fixture gate, KataGo engine pool telemetry, Release artifact smoke, student level, student age, teacher persona style settings with evidence boundary, teacher sessions, selective PR #6 integration, strict selected-provider TTS, offline synthesis validation for Kokoro, Vision Evidence Chain, KataGo Trace Translator, Volcengine / Doubao TTS, and multilingual release guidance.


Thanks to layiku and wimi321.
