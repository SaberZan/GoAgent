# GoAgent v0.4.13

GoAgent v0.4.13 is a macOS KataGo reliability hotfix. It prevents Apple Silicon builds from accidentally launching the Intel KataGo binary, and prevents Intel builds from accidentally launching the Apple Silicon binary. This fixes the confusing macOS error `spawn Unknown system error -86` for users who downloaded the correct app but received a mismatched bundled KataGo path at runtime.

QQ 群：1030632742，欢迎一起交流、提建议、完善 GoAgent。

## v0.4 系列延续能力

This release keeps the broader v0.4 foundation: grounded shape recognition engine, local pattern matcher, knowledge source-policy gates, optimized move-range review, quality checks and eval gates, Real Eval / engine silver fixture gate, KataGo engine pool telemetry, Release artifact smoke, student level, student age, teacher persona style settings with evidence boundary, teacher sessions, selective PR #6 integration, Kokoro selected-provider TTS with offline synthesis, Windows OpenCL runtime bundle, KataGo OpenCL adjacent runtime files, GPU vendor OpenCL drivers, and the community contribution path from layiku and wimi321.

## 中文

### 下载前先选版本

| 平台 / 场景 | 推荐下载 |
| --- | --- |
| macOS Apple Silicon（M 系列） | GoAgent-0.4.13-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.13-mac-x64.dmg |
| Windows x64 安装版，普通用户推荐 | GoAgent-0.4.13-win-x64.exe |
| Windows x64 免安装版 | GoAgent-0.4.13-win-x64-portable.zip |
| Windows x64 NVIDIA 专版安装版 | GoAgent-0.4.13-win-x64-nvidia.exe |
| Windows x64 NVIDIA 专版免安装包 | GoAgent-0.4.13-win-x64-nvidia-portable.7z.001 and all following split parts |
| 校验文件 | SHA256SUMS.txt |

### 本版重点

- 修复 macOS 打包资源中 KataGo 架构选择不稳的问题，避免 Apple Silicon 误启动 Intel KataGo。
- 启动 KataGo 时会拒绝跨架构的内置 binary 路径，优先使用当前平台 manifest 中的正确路径。
- release 检查会验证 macOS KataGo binary 架构，减少错误安装包进入发布流程。
- 如果用户手动配置了不匹配的 KataGo 程序，会看到明确中文提示，而不是 `Unknown system error -86`。

## 繁體中文

### 下載前先選版本

| 平台 / 使用情境 | 建議下載 |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.13-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.13-mac-x64.dmg |
| Windows x64 安裝版 | GoAgent-0.4.13-win-x64.exe |
| Windows x64 免安裝版 | GoAgent-0.4.13-win-x64-portable.zip |
| Windows x64 NVIDIA 專版 | GoAgent-0.4.13-win-x64-nvidia.exe |
| Windows x64 NVIDIA 免安裝包 | GoAgent-0.4.13-win-x64-nvidia-portable.7z.001 and all following split parts |
| 校驗檔 | SHA256SUMS.txt |

### 本版重點

- 修復 macOS KataGo 架構選擇問題，避免 Apple Silicon 誤啟動 Intel KataGo。
- 內建 KataGo 路徑會檢查是否符合目前平台。
- 若使用者手動選錯 KataGo binary，會看到清楚錯誤提示。

## English

### Pick the right package before downloading

| Platform / use case | Recommended download |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.13-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.13-mac-x64.dmg |
| Windows x64 installer | GoAgent-0.4.13-win-x64.exe |
| Windows x64 portable ZIP | GoAgent-0.4.13-win-x64-portable.zip |
| Windows x64 NVIDIA installer | GoAgent-0.4.13-win-x64-nvidia.exe |
| Windows x64 NVIDIA portable package | GoAgent-0.4.13-win-x64-nvidia-portable.7z.001 and all following split parts |
| Checksums | SHA256SUMS.txt |

### Highlights

- Fixes macOS KataGo architecture selection so Apple Silicon builds do not launch the Intel binary by mistake.
- Bundled KataGo metadata is now ignored when it points to a different platform than the current machine.
- Release checks now verify macOS KataGo binary architecture.
- Wrong manually configured KataGo binaries now produce a readable architecture-mismatch error.

## 日本語

### ダウンロード前に選ぶもの

| 環境 | 推奨ファイル |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.13-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.13-mac-x64.dmg |
| Windows x64 インストーラー | GoAgent-0.4.13-win-x64.exe |
| Windows x64 ポータブル ZIP | GoAgent-0.4.13-win-x64-portable.zip |
| Windows x64 NVIDIA 版 | GoAgent-0.4.13-win-x64-nvidia.exe |
| Windows x64 NVIDIA ポータブル | GoAgent-0.4.13-win-x64-nvidia-portable.7z.001 and all following split parts |
| チェックサム | SHA256SUMS.txt |

### 主な変更

- macOS で KataGo のアーキテクチャ選択を修正しました。
- Apple Silicon 版が Intel 用 KataGo を誤って起動しないようにしました。
- 間違った KataGo binary を選んだ場合は分かりやすいエラーを表示します。

## 한국어

### 다운로드 전 선택

| 환경 | 권장 다운로드 |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.13-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.13-mac-x64.dmg |
| Windows x64 설치 프로그램 | GoAgent-0.4.13-win-x64.exe |
| Windows x64 포터블 ZIP | GoAgent-0.4.13-win-x64-portable.zip |
| Windows x64 NVIDIA 설치 프로그램 | GoAgent-0.4.13-win-x64-nvidia.exe |
| Windows x64 NVIDIA 포터블 | GoAgent-0.4.13-win-x64-nvidia-portable.7z.001 and all following split parts |
| 체크섬 | SHA256SUMS.txt |

### 이번 버전

- macOS KataGo 아키텍처 선택 문제를 수정했습니다.
- Apple Silicon 버전이 Intel KataGo를 잘못 실행하지 않도록 했습니다.
- 잘못된 수동 KataGo 경로에는 명확한 오류를 표시합니다.

## ภาษาไทย

### เลือกไฟล์ก่อนดาวน์โหลด

| แพลตฟอร์ม | ไฟล์ที่แนะนำ |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.13-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.13-mac-x64.dmg |
| Windows x64 installer | GoAgent-0.4.13-win-x64.exe |
| Windows x64 portable ZIP | GoAgent-0.4.13-win-x64-portable.zip |
| Windows x64 NVIDIA installer | GoAgent-0.4.13-win-x64-nvidia.exe |
| Windows x64 NVIDIA portable | GoAgent-0.4.13-win-x64-nvidia-portable.7z.001 and all following split parts |
| Checksums | SHA256SUMS.txt |

### จุดสำคัญของรุ่นนี้

- แก้ปัญหา macOS เลือกสถาปัตยกรรม KataGo ผิด
- Apple Silicon จะไม่เรียกใช้ KataGo สำหรับ Intel โดยไม่ตั้งใจ
- หากเลือก binary ผิดเอง แอปจะแสดงข้อความผิดพลาดที่อ่านเข้าใจได้

## Tiếng Việt

### Chọn gói tải xuống

| Nền tảng | Gói khuyến nghị |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.13-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.13-mac-x64.dmg |
| Windows x64 installer | GoAgent-0.4.13-win-x64.exe |
| Windows x64 portable ZIP | GoAgent-0.4.13-win-x64-portable.zip |
| Windows x64 NVIDIA installer | GoAgent-0.4.13-win-x64-nvidia.exe |
| Windows x64 NVIDIA portable | GoAgent-0.4.13-win-x64-nvidia-portable.7z.001 and all following split parts |
| Checksums | SHA256SUMS.txt |

### Điểm mới

- Sửa lỗi chọn sai kiến trúc KataGo trên macOS.
- Bản Apple Silicon sẽ không vô tình chạy KataGo dành cho Intel.
- Nếu người dùng tự chọn sai binary KataGo, GoAgent sẽ hiển thị lỗi dễ hiểu hơn.
