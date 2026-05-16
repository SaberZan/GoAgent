# GoAgent v0.4.0

GoAgent v0.4.0 is a UX and bundling release. It ships the zhizi b28 KataGo network inside the installer so the app is ready to analyze on first launch, redesigns the winrate timeline to a Lizzie-clean light theme with severity dots drawn directly on the curve, switches the LLM model picker to dynamic auto-fetch (no more hard-coded GPT defaults), and makes every field in the LLM settings panel auto-save while you type.

QQ 群：1030632742，欢迎一起交流、提建议、完善 GoAgent。

> Heads-up: installers are larger than v0.3.22 because the official zhizi b28 weight (`kata1-zhizi-b28c512nbt-muonfd2.bin.gz`, ~259 MB) is now packaged inside the app. Settings → Apply Selected Weight detects the bundled model and no longer triggers a download for the b28 preset.
>
> `GoAgent-0.4.0-win-x64-nvidia-portable.zip` is not attached to this release because its packaged size exceeds GitHub's 2 GB single-asset upload limit; if you need an NVIDIA portable build, run `pnpm dist:local:win` locally (see `package.json`).

## 中文

### 下载前先选版本

| 平台 / 场景 | 推荐下载 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.0-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.0-mac-x64.dmg` |
| Windows 普通版，OpenCL 推荐包 | `GoAgent-0.4.0-win-x64.exe` 或 `GoAgent-0.4.0-win-x64-portable.zip` |
| Windows NVIDIA 专版，适合 NVIDIA 显卡和 CUDA 环境 | `GoAgent-0.4.0-win-x64-nvidia.exe`（`GoAgent-0.4.0-win-x64-nvidia-portable.zip` 超出 GitHub 2 GB 上传限制，请用 `pnpm dist:local:win` 本机打包） |
| 校验文件 | `SHA256SUMS.txt` |

### 本版重点

- 内置 KataGo zhizi b28 模型，安装后即可使用，设置里的「应用权重」对 b28 不再触发下载，也不再报"配置失败"。
- 胜率曲线与上方信息条按顶级项目标准重做（Lizzie-clean 风格）：单行 KPI（手数、黑胜率±差值、目差、严重度计数、范围 chip），浅色画布与全局主题一致，严重度小圆点（重大/问题/缓手）直接画在曲线对应手位置上。
- LLM 模型列表改为动态拉取：不再硬编码 `gpt-5.5` / `claude-3-5-sonnet-latest` 等默认项；填好 Base URL 与 API Key 后自动调用代理的 `/models` 接口生成模型选择项。
- LLM 设置全部边输边存：Base URL / 模型 / 权重预设 / 界面语言改动即写入，API Key 失焦时写入（空串不会覆盖已存 Key），「测试」「刷新模型」按钮直接基于已保存配置工作，不再要求先点保存。

## 繁體中文

### 下載前先選版本

| 平台 / 使用情境 | 建議下載 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.0-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.0-mac-x64.dmg` |
| Windows 一般版，OpenCL 推薦包 | `GoAgent-0.4.0-win-x64.exe` 或 `GoAgent-0.4.0-win-x64-portable.zip` |
| Windows NVIDIA 專版 | `GoAgent-0.4.0-win-x64-nvidia.exe`（`GoAgent-0.4.0-win-x64-nvidia-portable.zip` 因 GitHub 單檔 2 GB 上限未上傳，請以 `pnpm dist:local:win` 自行打包） |
| 校驗檔 | `SHA256SUMS.txt` |

### 本版重點

- 內建 KataGo zhizi b28 權重，安裝完成即可分析，設定中的「套用權重」對 b28 不再下載也不再報錯。
- 勝率曲線與上方資訊列改為 Lizzie 風的淺色設計：單行 KPI 與彩色嚴重度小圓點直接畫在曲線上。
- LLM 模型清單改為依據使用者代理動態拉取，不再內建 GPT/Claude 預設模型。
- LLM 設定（Base URL、API Key、模型、權重預設、語言）全部邊輸入邊自動儲存，「測試」與「重新整理模型」按鈕無需先點儲存。

## English

### Pick the right package before downloading

| Platform / use case | Recommended download |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.0-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.0-mac-x64.dmg` |
| Standard Windows x64, OpenCL recommended | `GoAgent-0.4.0-win-x64.exe` or `GoAgent-0.4.0-win-x64-portable.zip` |
| Windows NVIDIA edition for NVIDIA GPUs and CUDA runtimes | `GoAgent-0.4.0-win-x64-nvidia.exe` (the `GoAgent-0.4.0-win-x64-nvidia-portable.zip` artifact exceeds GitHub's 2 GB per-asset limit; build it locally with `pnpm dist:local:win`) |
| Checksums | `SHA256SUMS.txt` |

### Why update

- KataGo zhizi b28 (`kata1-zhizi-b28c512nbt-muonfd2.bin.gz`) is bundled with the installer; the settings page now detects the bundled weight and no longer triggers an unnecessary download for the b28 preset.
- Winrate timeline redesigned to a Lizzie-clean light theme: a single-line KPI strip (move counter, black winrate with delta chip, score lead, severity counts, range chip), a porcelain canvas that matches the rest of the app, and severity dots (blunder / mistake / inaccuracy) drawn directly on the curve at the offending move.
- LLM model picker no longer hard-codes provider-specific defaults (`gpt-5.5`, `claude-3-5-sonnet-latest`, etc.). It auto-fetches the model list from your proxy's `/models` endpoint whenever a Base URL and API key are configured.
- All LLM settings auto-save while you edit (Base URL / model / preset / locale on change, API key on blur, empty key does not overwrite a saved one). Test and Refresh Models work against the latest saved configuration without a separate Save click; the Save button is replaced by an "Auto-saved" status indicator.

## 日本語

### ダウンロード前に選ぶもの

| 環境 | 推奨ファイル |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.0-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.0-mac-x64.dmg` |
| Windows 標準版、OpenCL 推奨 | `GoAgent-0.4.0-win-x64.exe` または `GoAgent-0.4.0-win-x64-portable.zip` |
| Windows NVIDIA 版 | `GoAgent-0.4.0-win-x64-nvidia.exe`（`GoAgent-0.4.0-win-x64-nvidia-portable.zip` は GitHub の 2 GB 制限を超えるため未配布。必要なら `pnpm dist:local:win` でローカル作成してください） |
| チェックサム | `SHA256SUMS.txt` |

### 主な変更

- KataGo zhizi b28 ネットワークをインストーラに同梱しました。設定の「ウェイトを適用」は同梱モデルを検出し、b28 のダウンロードを行いません。
- 勝率推移グラフと上部情報バーを Lizzie 風の明色テーマに刷新し、重大手・問題手・緩手のドットを曲線上に直接描画します。
- LLM のモデル一覧をハードコードされた既定値ではなく、設定したプロキシの `/models` から自動取得します。
- LLM 設定（Base URL / API Key / モデル / ウェイト / 言語）は編集と同時に自動保存されます。

## 한국어

### 다운로드 전 선택

| 환경 | 권장 다운로드 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.0-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.0-mac-x64.dmg` |
| Windows 표준 x64, OpenCL 권장 | `GoAgent-0.4.0-win-x64.exe` 또는 `GoAgent-0.4.0-win-x64-portable.zip` |
| Windows NVIDIA 에디션 | `GoAgent-0.4.0-win-x64-nvidia.exe`(`GoAgent-0.4.0-win-x64-nvidia-portable.zip`은 GitHub의 2GB 단일 자산 한도를 초과하여 업로드되지 않았습니다. 필요하다면 `pnpm dist:local:win`으로 로컬 빌드하세요) |
| 체크섬 | `SHA256SUMS.txt` |

### 이번 버전

- KataGo zhizi b28 가중치를 인스톨러에 포함했습니다. 설정의 "가중치 적용"이 번들된 모델을 감지하여 b28 다운로드를 트리거하지 않습니다.
- 승률 타임라인과 상단 정보 바를 Lizzie 스타일의 밝은 테마로 다시 디자인했고, 중대한 실수/실수/부정확 점을 곡선 위에 직접 표시합니다.
- LLM 모델 목록을 하드코딩된 기본값이 아닌, 설정된 프록시의 `/models` 엔드포인트에서 자동으로 불러옵니다.
- LLM 설정 입력값(Base URL / API Key / 모델 / 가중치 / 언어)은 편집과 동시에 자동 저장됩니다.

## ภาษาไทย

### เลือกไฟล์ก่อนดาวน์โหลด

| แพลตฟอร์ม | ไฟล์ที่แนะนำ |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.0-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.0-mac-x64.dmg` |
| Windows x64 มาตรฐาน แนะนำ OpenCL | `GoAgent-0.4.0-win-x64.exe` หรือ `GoAgent-0.4.0-win-x64-portable.zip` |
| Windows รุ่น NVIDIA | `GoAgent-0.4.0-win-x64-nvidia.exe` (ไฟล์ `GoAgent-0.4.0-win-x64-nvidia-portable.zip` ใหญ่เกินขีดจำกัด 2 GB ของ GitHub จึงไม่ถูกอัปโหลด หากต้องการ ให้ใช้ `pnpm dist:local:win` เพื่อสร้างเองในเครื่อง) |
| Checksums | `SHA256SUMS.txt` |

### จุดสำคัญของรุ่นนี้

- รวมโมเดล KataGo zhizi b28 ไว้ในตัวติดตั้ง ปุ่ม "ใช้น้ำหนัก" ในหน้าตั้งค่าจะตรวจพบและไม่ดาวน์โหลดซ้ำสำหรับพรีเซ็ต b28
- ออกแบบกราฟอัตราชนะและแถบข้อมูลด้านบนใหม่ในสไตล์ Lizzie สีอ่อน พร้อมจุดความรุนแรงของหมาก (blunder / mistake / inaccuracy) ที่วาดบนเส้นกราฟโดยตรง
- รายการโมเดล LLM ดึงจาก `/models` ของพร็อกซีที่ผู้ใช้ตั้งไว้แบบอัตโนมัติ แทนการเขียนค่าเริ่มต้นแบบฮาร์ดโค้ด
- ค่าทั้งหมดในหน้าตั้งค่า LLM บันทึกอัตโนมัติขณะแก้ไข

## Tiếng Việt

### Chọn gói tải xuống

| Nền tảng | Gói khuyến nghị |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.4.0-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.4.0-mac-x64.dmg` |
| Windows x64 tiêu chuẩn, khuyến nghị OpenCL | `GoAgent-0.4.0-win-x64.exe` hoặc `GoAgent-0.4.0-win-x64-portable.zip` |
| Windows phiên bản NVIDIA | `GoAgent-0.4.0-win-x64-nvidia.exe` (gói `GoAgent-0.4.0-win-x64-nvidia-portable.zip` vượt giới hạn 2 GB của GitHub nên chưa được tải lên; bạn có thể tự build bằng `pnpm dist:local:win`) |
| Checksums | `SHA256SUMS.txt` |

### Điểm mới

- Đóng gói sẵn mạng KataGo zhizi b28 trong bộ cài. Nút "Áp dụng trọng số" trong cài đặt phát hiện trọng số có sẵn và không tải lại khi chọn b28.
- Thiết kế lại biểu đồ winrate và thanh thông tin phía trên theo phong cách Lizzie sáng màu, vẽ điểm mức độ sai lầm trực tiếp lên đường cong.
- Danh sách mô hình LLM được lấy động từ endpoint `/models` của proxy mà người dùng cấu hình, không còn mặc định cứng.
- Toàn bộ cài đặt LLM tự lưu khi chỉnh sửa.

## Quality baseline

This release keeps the existing top-quality baseline: grounded shape recognition engine, local pattern matcher, knowledge source-policy gates, optimized move-range review, quality checks and eval gates, Real Eval / engine silver fixture gate, KataGo engine pool telemetry, Release artifact smoke, student level, student age, teacher persona style settings with evidence boundary, teacher sessions, selective PR #6 integration, strict selected-provider TTS, offline synthesis validation for Kokoro, Vision Evidence Chain, KataGo Trace Translator, Volcengine / Doubao TTS, and multilingual release guidance.


Thanks to layiku and wimi321.
