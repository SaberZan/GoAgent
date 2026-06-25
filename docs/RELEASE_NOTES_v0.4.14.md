# GoAgent v0.4.14

GoAgent v0.4.14 is a Windows KataGo startup hotfix. It fixes a packaged-resource path bug where Windows portable builds could try to launch KataGo from `resources/app.asar/data/katago/...`, which cannot contain a runnable executable. GoAgent now resolves bundled KataGo from `resources/data/katago` or `resources/app.asar.unpacked/data/katago`, and never tries to spawn a binary from inside `app.asar`.

QQ 群：1030632742，欢迎一起交流、提建议、完善 GoAgent。

## v0.4 系列延续能力

This release keeps the broader v0.4 foundation: grounded shape recognition engine, local pattern matcher, knowledge source-policy gates, optimized move-range review, quality checks and eval gates, Real Eval / engine silver fixture gate, KataGo engine pool telemetry, Release artifact smoke, student level, student age, teacher persona style settings with evidence boundary, teacher sessions, selective PR #6 integration, Tool-first Agent runtime, Kokoro selected-provider TTS with offline synthesis, Windows OpenCL runtime bundle, KataGo OpenCL adjacent runtime files, GPU vendor OpenCL drivers, and the community contribution path from layiku and wimi321.

## 中文

### 下载前先选版本

| 平台 / 场景 | 推荐下载 |
| --- | --- |
| macOS Apple Silicon（M 系列） | GoAgent-0.4.14-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.14-mac-x64.dmg |
| Windows x64 安装版，普通用户推荐 | GoAgent-0.4.14-win-x64.exe |
| Windows x64 免安装版 | GoAgent-0.4.14-win-x64-portable.zip |
| Windows x64 NVIDIA 专版安装版 | GoAgent-0.4.14-win-x64-nvidia.exe |
| Windows x64 NVIDIA 专版免安装包 | GoAgent-0.4.14-win-x64-nvidia-portable.7z.001 and all following split parts |
| 校验文件 | SHA256SUMS.txt |

### 本版重点

- 修复 Windows 免安装包 / 安装包中 KataGo 路径误指向 `app.asar` 的问题。
- GoAgent 会优先从 `resources/data/katago` 和 `resources/app.asar.unpacked/data/katago` 查找内置 KataGo。
- 明确禁止从 `app.asar` 内部启动 KataGo，避免 `spawn ... ENOENT`。
- 默认仍使用本机 KataGo 分析；智子云远程算力只有用户在设置里显式启用才会使用。
- 设置页文案继续面向普通用户，减少开发者式说明。

## 繁體中文

### 下載前先選版本

| 平台 / 使用情境 | 建議下載 |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.14-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.14-mac-x64.dmg |
| Windows x64 安裝版 | GoAgent-0.4.14-win-x64.exe |
| Windows x64 免安裝版 | GoAgent-0.4.14-win-x64-portable.zip |
| Windows x64 NVIDIA 專版 | GoAgent-0.4.14-win-x64-nvidia.exe |
| Windows x64 NVIDIA 免安裝包 | GoAgent-0.4.14-win-x64-nvidia-portable.7z.001 and all following split parts |
| 校驗檔 | SHA256SUMS.txt |

### 本版重點

- 修復 Windows 套件中 KataGo 路徑誤指向 `app.asar` 的問題。
- 內建 KataGo 會從 `resources/data/katago` 或 `resources/app.asar.unpacked/data/katago` 啟動。
- GoAgent 不會從 `app.asar` 內部執行 KataGo。
- 預設仍使用本機 KataGo；智子雲只有手動啟用時才會使用。

## English

### Pick the right package before downloading

| Platform / use case | Recommended download |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.14-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.14-mac-x64.dmg |
| Windows x64 installer | GoAgent-0.4.14-win-x64.exe |
| Windows x64 portable ZIP | GoAgent-0.4.14-win-x64-portable.zip |
| Windows x64 NVIDIA installer | GoAgent-0.4.14-win-x64-nvidia.exe |
| Windows x64 NVIDIA portable package | GoAgent-0.4.14-win-x64-nvidia-portable.7z.001 and all following split parts |
| Checksums | SHA256SUMS.txt |

### Highlights

- Fixes Windows packaged KataGo resolution when the app is installed or extracted as a portable ZIP.
- GoAgent now resolves bundled KataGo from `resources/data/katago` or `resources/app.asar.unpacked/data/katago`.
- GoAgent never tries to spawn KataGo from inside `app.asar`, preventing `spawn ... ENOENT`.
- Local KataGo remains the default analysis engine; Zhizi Cloud is used only when the user explicitly enables it.
- Settings copy remains user-facing and avoids developer-oriented configuration wording.

## 日本語

### ダウンロード前に選ぶもの

| 環境 | 推奨ファイル |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.14-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.14-mac-x64.dmg |
| Windows x64 インストーラー | GoAgent-0.4.14-win-x64.exe |
| Windows x64 ポータブル ZIP | GoAgent-0.4.14-win-x64-portable.zip |
| Windows x64 NVIDIA 版 | GoAgent-0.4.14-win-x64-nvidia.exe |
| Windows x64 NVIDIA ポータブル | GoAgent-0.4.14-win-x64-nvidia-portable.7z.001 and all following split parts |
| チェックサム | SHA256SUMS.txt |

### 主な変更

- Windows パッケージで KataGo のパスが `app.asar` 内を指す問題を修正しました。
- KataGo は `resources/data/katago` または `resources/app.asar.unpacked/data/katago` から起動します。
- 既定ではローカル KataGo を使います。Zhizi Cloud はユーザーが明示的に有効化した場合のみ使われます。

## 한국어

### 다운로드 전 선택

| 환경 | 권장 다운로드 |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.14-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.14-mac-x64.dmg |
| Windows x64 설치 프로그램 | GoAgent-0.4.14-win-x64.exe |
| Windows x64 포터블 ZIP | GoAgent-0.4.14-win-x64-portable.zip |
| Windows x64 NVIDIA 설치 프로그램 | GoAgent-0.4.14-win-x64-nvidia.exe |
| Windows x64 NVIDIA 포터블 | GoAgent-0.4.14-win-x64-nvidia-portable.7z.001 and all following split parts |
| 체크섬 | SHA256SUMS.txt |

### 이번 버전

- Windows 패키지에서 KataGo 경로가 `app.asar` 내부를 가리키는 문제를 수정했습니다.
- KataGo는 `resources/data/katago` 또는 `resources/app.asar.unpacked/data/katago`에서 실행됩니다.
- 기본값은 로컬 KataGo이며, Zhizi Cloud는 사용자가 직접 켠 경우에만 사용됩니다.

## ภาษาไทย

### เลือกไฟล์ก่อนดาวน์โหลด

| แพลตฟอร์ม | ไฟล์ที่แนะนำ |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.14-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.14-mac-x64.dmg |
| Windows x64 installer | GoAgent-0.4.14-win-x64.exe |
| Windows x64 portable ZIP | GoAgent-0.4.14-win-x64-portable.zip |
| Windows x64 NVIDIA installer | GoAgent-0.4.14-win-x64-nvidia.exe |
| Windows x64 NVIDIA portable | GoAgent-0.4.14-win-x64-nvidia-portable.7z.001 and all following split parts |
| Checksums | SHA256SUMS.txt |

### จุดสำคัญของรุ่นนี้

- แก้ปัญหา Windows package ชี้ path ของ KataGo เข้าไปใน `app.asar`
- GoAgent จะเรียก KataGo จาก `resources/data/katago` หรือ `resources/app.asar.unpacked/data/katago`
- ค่าเริ่มต้นยังใช้ KataGo ในเครื่อง; Zhizi Cloud จะใช้เมื่อผู้ใช้เปิดเองเท่านั้น

## Tiếng Việt

### Chọn gói tải xuống

| Nền tảng | Gói khuyến nghị |
| --- | --- |
| macOS Apple Silicon | GoAgent-0.4.14-mac-arm64.dmg |
| macOS Intel | GoAgent-0.4.14-mac-x64.dmg |
| Windows x64 installer | GoAgent-0.4.14-win-x64.exe |
| Windows x64 portable ZIP | GoAgent-0.4.14-win-x64-portable.zip |
| Windows x64 NVIDIA installer | GoAgent-0.4.14-win-x64-nvidia.exe |
| Windows x64 NVIDIA portable | GoAgent-0.4.14-win-x64-nvidia-portable.7z.001 and all following split parts |
| Checksums | SHA256SUMS.txt |

### Điểm mới

- Sửa lỗi gói Windows trỏ đường dẫn KataGo vào bên trong `app.asar`.
- GoAgent chạy KataGo từ `resources/data/katago` hoặc `resources/app.asar.unpacked/data/katago`.
- Mặc định vẫn dùng KataGo cục bộ; Zhizi Cloud chỉ chạy khi người dùng bật rõ ràng.
