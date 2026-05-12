# GoAgent v0.3.21

GoAgent v0.3.21 is a teaching wording and score-normalization release. The teacher now speaks about score in the way ordinary players expect: “black is ahead by X points” or “white is ahead by X points.” Terminal Fox-style results are normalized before display and before they are sent to the teacher, so encoded records such as `B+22.75` are no longer explained as a confusing half-sized lead.

QQ 群：1030632742，欢迎一起交流、提建议、完善 GoAgent。

## 中文

### 下载前先选版本

| 平台 / 场景 | 推荐下载 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.21-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.21-mac-x64.dmg` |
| Windows 普通版，OpenCL 推荐包 | `GoAgent-0.3.21-win-x64.exe` 或 `GoAgent-0.3.21-win-x64-portable.zip` |
| Windows NVIDIA 专版，适合 NVIDIA 显卡和 CUDA 环境 | `GoAgent-0.3.21-win-x64-nvidia.exe` 或 `GoAgent-0.3.21-win-x64-nvidia-portable.zip` |
| 校验文件 | `SHA256SUMS.txt` |

### 本版重点

- 老师讲解目差时更像真人讲棋：直接说“黑领先约 X 目”或“白领先约 X 目”，不再把底层平台记录、贴目换算、KataGo 符号解释都堆给用户。
- 终局优先使用棋谱记录结果，并对 Fox 常见编码做归一化。例如记录里的 `B+22.75` 会按用户习惯解释为“黑领先 45.5 目”。
- 中盘和当前手仍以 KataGo 当前局面估值为事实依据；KataGo 数据不足时会降低语气，不编造确定目差。
- 顶部与胜率区同步使用更清楚的终局结果显示，并保留 KataGo 当前估值作为辅助参考。

## 繁體中文

### 下載前先選版本

| 平台 / 使用情境 | 建議下載 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.21-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.21-mac-x64.dmg` |
| Windows 一般版，OpenCL 推薦包 | `GoAgent-0.3.21-win-x64.exe` 或 `GoAgent-0.3.21-win-x64-portable.zip` |
| Windows NVIDIA 專版 | `GoAgent-0.3.21-win-x64-nvidia.exe` 或 `GoAgent-0.3.21-win-x64-nvidia-portable.zip` |
| 校驗檔 | `SHA256SUMS.txt` |

### 本版重點

- 老師講目差時會直接說黑棋或白棋領先多少目，不再把底層記錄格式講得太複雜。
- 終局會優先使用棋譜結果，並修正 Fox 類型的結果編碼。
- 中盤與當前手仍以 KataGo 估值作為事實依據。

## English

### Pick the right package before downloading

| Platform / use case | Recommended download |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.21-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.21-mac-x64.dmg` |
| Standard Windows x64, OpenCL recommended | `GoAgent-0.3.21-win-x64.exe` or `GoAgent-0.3.21-win-x64-portable.zip` |
| Windows NVIDIA edition for NVIDIA GPUs and CUDA runtimes | `GoAgent-0.3.21-win-x64-nvidia.exe` or `GoAgent-0.3.21-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### Why update

- Teacher score wording is now simpler and more player-friendly: it says black or white is ahead by a clear number of points.
- Final-position SGF records are normalized before being shown or sent to the teacher, including Fox-style encoded results.
- Midgame explanations still use KataGo’s current position estimate as the factual source.

## 日本語

### ダウンロード前に選ぶもの

| 環境 | 推奨ファイル |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.21-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.21-mac-x64.dmg` |
| Windows 標準版、OpenCL 推奨 | `GoAgent-0.3.21-win-x64.exe` または `GoAgent-0.3.21-win-x64-portable.zip` |
| NVIDIA GPU / CUDA 向け Windows NVIDIA 版 | `GoAgent-0.3.21-win-x64-nvidia.exe` または `GoAgent-0.3.21-win-x64-nvidia-portable.zip` |
| チェックサム | `SHA256SUMS.txt` |

### 主な変更

- 先生は目差をより自然に、黒または白が何目リードしているかとして説明します。
- 終局では棋譜の結果を優先し、Fox 形式の結果もユーザー向けに正規化します。
- 中盤では KataGo の現在局面評価を事実根拠として使います。

## 한국어

### 다운로드 전 선택

| 환경 | 권장 다운로드 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.21-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.21-mac-x64.dmg` |
| Windows 표준 x64, OpenCL 권장 | `GoAgent-0.3.21-win-x64.exe` 또는 `GoAgent-0.3.21-win-x64-portable.zip` |
| NVIDIA GPU / CUDA용 Windows NVIDIA 에디션 | `GoAgent-0.3.21-win-x64-nvidia.exe` 또는 `GoAgent-0.3.21-win-x64-nvidia-portable.zip` |
| 체크섬 | `SHA256SUMS.txt` |

### 이번 버전

- 교사는 이제 흑 또는 백이 몇 집 앞서는지를 더 직접적으로 설명합니다.
- 종국에서는 SGF 결과를 우선 사용하고 Fox식 결과 기록을 사용자 기준으로 정규화합니다.
- 중반 설명은 계속 KataGo의 현재 국면 평가를 사실 근거로 사용합니다.

## ภาษาไทย

### เลือกไฟล์ก่อนดาวน์โหลด

| แพลตฟอร์ม | ไฟล์ที่แนะนำ |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.21-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.21-mac-x64.dmg` |
| Windows x64 มาตรฐาน แนะนำ OpenCL | `GoAgent-0.3.21-win-x64.exe` หรือ `GoAgent-0.3.21-win-x64-portable.zip` |
| Windows NVIDIA edition สำหรับ NVIDIA GPU และ CUDA | `GoAgent-0.3.21-win-x64-nvidia.exe` หรือ `GoAgent-0.3.21-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### จุดสำคัญของรุ่นนี้

- ครูจะอธิบายคะแนนแบบเข้าใจง่ายขึ้น ว่าฝ่ายดำหรือฝ่ายขาวนำอยู่กี่แต้ม
- ผลจบเกมจาก SGF และรูปแบบ Fox จะถูกปรับให้อ่านง่ายก่อนนำไปแสดงและส่งให้ครู
- ระหว่างเกมยังใช้การประเมินจาก KataGo เป็นหลักฐานจริง

## Tiếng Việt

### Chọn gói tải xuống

| Nền tảng | Gói khuyến nghị |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.21-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.21-mac-x64.dmg` |
| Windows x64 tiêu chuẩn, khuyến nghị OpenCL | `GoAgent-0.3.21-win-x64.exe` hoặc `GoAgent-0.3.21-win-x64-portable.zip` |
| Windows NVIDIA edition cho GPU NVIDIA và CUDA | `GoAgent-0.3.21-win-x64-nvidia.exe` hoặc `GoAgent-0.3.21-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### Điểm mới

- Giáo viên giờ giải thích điểm dẫn một cách dễ hiểu hơn: đen hoặc trắng đang dẫn bao nhiêu điểm.
- Kết quả cuối ván trong SGF, bao gồm định dạng Fox, được chuẩn hóa trước khi hiển thị và gửi cho giáo viên.
- Ở trung bàn, GoAgent vẫn dùng đánh giá hiện tại của KataGo làm nguồn sự thật.

## Quality baseline

This release keeps the existing top-quality baseline: grounded shape recognition engine, local pattern matcher, knowledge source-policy gates, optimized move-range review, quality checks and eval gates, Real Eval / engine silver fixture gate, KataGo engine pool telemetry, Release artifact smoke, student level, student age, teacher persona style settings with evidence boundary, teacher sessions, selective PR #6 integration, strict selected-provider TTS, offline synthesis validation for Kokoro, Vision Evidence Chain, KataGo Trace Translator, Volcengine / Doubao TTS, and multilingual release guidance.

Windows packages continue to follow the OpenCL and NVIDIA split. The standard Windows package includes the Windows OpenCL runtime bundle and KataGo OpenCL adjacent runtime files; GPU vendor OpenCL drivers still come from the user's NVIDIA / AMD / Intel graphics driver.

Thanks to layiku and wimi321.
