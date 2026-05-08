# GoAgent v0.3.17

GoAgent v0.3.17 is a focused TTS quality release. It fixes the bundled Kokoro zh-CN path so Chinese teacher text is synthesized through the Chinese tokenizer path instead of the English phonemizer path, and adds runtime language checks so mismatched text and voice packs fail clearly instead of producing the wrong spoken language.

QQ群：1030632742，欢迎一起交流、提建议、完善 GoAgent。

## 中文

### 下载前先选版本

| 平台 / 场景 | 推荐下载 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.17-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.17-mac-x64.dmg` |
| Windows 普通版，OpenCL 推荐包 | `GoAgent-0.3.17-win-x64.exe` 或 `GoAgent-0.3.17-win-x64-portable.zip` |
| Windows NVIDIA 专版，适合 NVIDIA 显卡和 CUDA 环境 | `GoAgent-0.3.17-win-x64-nvidia.exe` 或 `GoAgent-0.3.17-win-x64-nvidia-portable.zip` |
| 校验文件 | `SHA256SUMS.txt` |

### 本版重点

- 修复 Kokoro 中文离线 TTS 朗读时语言和文字不匹配的问题。
- 中文语音现在直接使用 Kokoro tokenizer 和 `generate_from_ids`，不再走英文音素路径。
- 新增文本语言与当前语音包匹配校验；如果明显不匹配，会提示用户切换语言包或显式选择自定义 TTS API。
- 保持严格 selected-provider TTS：当前选择哪个 provider，就只使用哪个 provider。

## 繁體中文

### 下載前先選版本

| 平台 / 使用情境 | 建議下載 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.17-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.17-mac-x64.dmg` |
| Windows 一般版，OpenCL 推薦包 | `GoAgent-0.3.17-win-x64.exe` 或 `GoAgent-0.3.17-win-x64-portable.zip` |
| Windows NVIDIA 專版 | `GoAgent-0.3.17-win-x64-nvidia.exe` 或 `GoAgent-0.3.17-win-x64-nvidia-portable.zip` |
| 校驗檔 | `SHA256SUMS.txt` |

### 本版重點

- 修正 Kokoro 中文離線 TTS 朗讀時語言與文字不一致的問題。
- 中文語音改走 Kokoro tokenizer 與 `generate_from_ids`，不再走英文 phonemizer。
- 新增文字語言與語音包的匹配檢查；明顯不匹配時會顯示清楚錯誤。
- 維持 strict selected-provider TTS，不自動切換 provider。

## English

### Pick the right package before downloading

| Platform / use case | Recommended download |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.17-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.17-mac-x64.dmg` |
| Standard Windows x64, OpenCL recommended | `GoAgent-0.3.17-win-x64.exe` or `GoAgent-0.3.17-win-x64-portable.zip` |
| Windows NVIDIA edition for NVIDIA GPUs and CUDA runtimes | `GoAgent-0.3.17-win-x64-nvidia.exe` or `GoAgent-0.3.17-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### Why update

- Fixes the bundled Kokoro zh-CN TTS path so spoken language matches Chinese teacher text.
- Chinese synthesis now uses the Kokoro tokenizer and `generate_from_ids`, avoiding the English phonemizer path.
- Adds a language-match guard: clearly mismatched text and selected voice packs now fail with a readable error.
- Keeps strict selected-provider TTS: the selected provider is the only provider used.

## 日本語

### ダウンロード前に選ぶもの

| 環境 | 推奨ファイル |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.17-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.17-mac-x64.dmg` |
| Windows 標準版、OpenCL 推奨 | `GoAgent-0.3.17-win-x64.exe` または `GoAgent-0.3.17-win-x64-portable.zip` |
| NVIDIA GPU / CUDA 向け Windows NVIDIA 版 | `GoAgent-0.3.17-win-x64-nvidia.exe` または `GoAgent-0.3.17-win-x64-nvidia-portable.zip` |
| チェックサム | `SHA256SUMS.txt` |

### 主な変更

- Kokoro zh-CN の読み上げで、文字と言語が合わない問題を修正しました。
- 中国語は Kokoro tokenizer と `generate_from_ids` を使い、英語 phonemizer を通しません。
- テキストと言語パックが明らかに合わない場合は、誤った音声を生成せず明確なエラーを出します。
- strict selected-provider TTS を維持し、自動 provider 切替はしません。

## 한국어

### 다운로드 전 선택

| 환경 | 권장 다운로드 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.17-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.17-mac-x64.dmg` |
| Windows 표준 x64, OpenCL 권장 | `GoAgent-0.3.17-win-x64.exe` 또는 `GoAgent-0.3.17-win-x64-portable.zip` |
| NVIDIA GPU / CUDA용 Windows NVIDIA 에디션 | `GoAgent-0.3.17-win-x64-nvidia.exe` 또는 `GoAgent-0.3.17-win-x64-nvidia-portable.zip` |
| 체크섬 | `SHA256SUMS.txt` |

### 이번 버전

- Kokoro zh-CN 오프라인 TTS에서 텍스트와 음성 언어가 맞지 않던 문제를 수정했습니다.
- 중국어 합성은 Kokoro tokenizer와 `generate_from_ids`를 사용하며 영어 phonemizer를 거치지 않습니다.
- 텍스트와 선택한 음성팩 언어가 명확히 다르면 잘못 읽지 않고 읽기 쉬운 오류를 표시합니다.
- strict selected-provider TTS 정책을 유지합니다.

## ภาษาไทย

### เลือกไฟล์ก่อนดาวน์โหลด

| แพลตฟอร์ม | ไฟล์ที่แนะนำ |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.17-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.17-mac-x64.dmg` |
| Windows x64 มาตรฐาน แนะนำ OpenCL | `GoAgent-0.3.17-win-x64.exe` หรือ `GoAgent-0.3.17-win-x64-portable.zip` |
| Windows NVIDIA edition สำหรับ NVIDIA GPU และ CUDA | `GoAgent-0.3.17-win-x64-nvidia.exe` หรือ `GoAgent-0.3.17-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### จุดสำคัญของรุ่นนี้

- แก้ปัญหา Kokoro zh-CN offline TTS อ่านออกเสียงไม่ตรงกับภาษาของข้อความ
- เสียงภาษาจีนใช้ Kokoro tokenizer และ `generate_from_ids` โดยไม่ผ่าน English phonemizer
- หากข้อความกับ voice pack ที่เลือกไม่ตรงกันอย่างชัดเจน ระบบจะแจ้งข้อผิดพลาดแทนการสร้างเสียงผิดภาษา
- ยังคงใช้นโยบาย strict selected-provider TTS

## Tiếng Việt

### Chọn gói tải xuống

| Nền tảng | Gói khuyến nghị |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.17-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.17-mac-x64.dmg` |
| Windows x64 tiêu chuẩn, khuyến nghị OpenCL | `GoAgent-0.3.17-win-x64.exe` hoặc `GoAgent-0.3.17-win-x64-portable.zip` |
| Windows NVIDIA edition cho GPU NVIDIA và CUDA | `GoAgent-0.3.17-win-x64-nvidia.exe` hoặc `GoAgent-0.3.17-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### Điểm mới

- Sửa lỗi Kokoro zh-CN offline TTS đọc sai ngôn ngữ so với nội dung văn bản.
- Tiếng Trung nay dùng Kokoro tokenizer và `generate_from_ids`, không đi qua English phonemizer.
- Nếu văn bản và gói giọng nói được chọn không khớp rõ ràng, ứng dụng báo lỗi dễ hiểu thay vì tạo âm thanh sai ngôn ngữ.
- Giữ nguyên chính sách strict selected-provider TTS.

## Quality baseline

This release keeps the existing top-quality baseline: grounded shape recognition engine, local pattern matcher, knowledge source-policy gates, optimized move-range review, quality checks and eval gates, Real Eval / engine silver fixture gate, KataGo engine pool telemetry, Release artifact smoke, student level, student age, teacher persona style settings with evidence boundary, teacher sessions, and selective PR #6 integration.

It also keeps Kokoro selected-provider TTS, strict offline synthesis validation, offline synthesis smoke, and release packaging checks for bundled zh-CN speech assets. Windows packages continue to follow the OpenCL and NVIDIA split. The standard Windows package includes the Windows OpenCL runtime bundle and KataGo OpenCL adjacent runtime files; GPU vendor OpenCL drivers still come from the user's NVIDIA / AMD / Intel graphics driver.

Thanks to layiku and wimi321.
