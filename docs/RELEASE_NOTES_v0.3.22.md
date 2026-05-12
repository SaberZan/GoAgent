# GoAgent v0.3.22

GoAgent v0.3.22 is a winrate and timeline accuracy release. It fixes suspicious Fox SGF `KM[0]` records being treated as true zero-komi positions, stabilizes the quick winrate graph, and corrects timeline hover/click mapping after window resizing.

QQ 群：1030632742，欢迎一起交流、提建议、完善 GoAgent。

## 中文

### 下载前先选版本

| 平台 / 场景 | 推荐下载 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.22-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.22-mac-x64.dmg` |
| Windows 普通版，OpenCL 推荐包 | `GoAgent-0.3.22-win-x64.exe` 或 `GoAgent-0.3.22-win-x64-portable.zip` |
| Windows NVIDIA 专版，适合 NVIDIA 显卡和 CUDA 环境 | `GoAgent-0.3.22-win-x64-nvidia.exe` 或 `GoAgent-0.3.22-win-x64-nvidia-portable.zip` |
| 校验文件 | `SHA256SUMS.txt` |

### 本版重点

- 修复部分野狐棋谱 `KM[0] HA[0]` 被误当成 0 贴目，导致开局黑胜率异常到 90%+ 的问题。
- 快速胜率图改用更稳定的快速 visits，并关闭宽根噪声，减少曲线抖动和误判。
- 胜率图 hover、点击、拖拽改用 SVG 坐标矩阵换算，窗口缩放后手数不再漂移。
- 快速图生成中，hover 竖线会跟随鼠标对应手数；该手还没分析完时显示分析中，不再吸附到附近已有点。

## 繁體中文

### 下載前先選版本

| 平台 / 使用情境 | 建議下載 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.22-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.22-mac-x64.dmg` |
| Windows 一般版，OpenCL 推薦包 | `GoAgent-0.3.22-win-x64.exe` 或 `GoAgent-0.3.22-win-x64-portable.zip` |
| Windows NVIDIA 專版 | `GoAgent-0.3.22-win-x64-nvidia.exe` 或 `GoAgent-0.3.22-win-x64-nvidia-portable.zip` |
| 校驗檔 | `SHA256SUMS.txt` |

### 本版重點

- 修正部分 Fox 棋譜 `KM[0]` 造成開局黑棋勝率異常偏高的問題。
- 快速勝率圖使用更穩定的搜尋設定，曲線更可靠。
- 勝率圖的滑鼠位置、手數、提示線在視窗縮放後保持一致。

## English

### Pick the right package before downloading

| Platform / use case | Recommended download |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.22-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.22-mac-x64.dmg` |
| Standard Windows x64, OpenCL recommended | `GoAgent-0.3.22-win-x64.exe` or `GoAgent-0.3.22-win-x64-portable.zip` |
| Windows NVIDIA edition for NVIDIA GPUs and CUDA runtimes | `GoAgent-0.3.22-win-x64-nvidia.exe` or `GoAgent-0.3.22-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### Why update

- Fixes suspicious Fox SGF `KM[0]` records that could make the opening black winrate jump above 90%.
- Makes quick winrate generation more stable by using stronger fast visits and removing wide-root noise.
- Fixes timeline hover, click, and drag mapping after responsive resizing by using real SVG coordinates.

## 日本語

### ダウンロード前に選ぶもの

| 環境 | 推奨ファイル |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.22-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.22-mac-x64.dmg` |
| Windows 標準版、OpenCL 推奨 | `GoAgent-0.3.22-win-x64.exe` または `GoAgent-0.3.22-win-x64-portable.zip` |
| NVIDIA GPU / CUDA 向け Windows NVIDIA 版 | `GoAgent-0.3.22-win-x64-nvidia.exe` または `GoAgent-0.3.22-win-x64-nvidia-portable.zip` |
| チェックサム | `SHA256SUMS.txt` |

### 主な変更

- Fox 棋譜の `KM[0]` により序盤の黒勝率が異常に高くなる問題を修正しました。
- 簡易勝率グラフの探索設定を安定化しました。
- ウィンドウサイズ変更後も、勝率グラフ上のマウス位置と手数が一致します。

## 한국어

### 다운로드 전 선택

| 환경 | 권장 다운로드 |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.22-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.22-mac-x64.dmg` |
| Windows 표준 x64, OpenCL 권장 | `GoAgent-0.3.22-win-x64.exe` 또는 `GoAgent-0.3.22-win-x64-portable.zip` |
| NVIDIA GPU / CUDA용 Windows NVIDIA 에디션 | `GoAgent-0.3.22-win-x64-nvidia.exe` 또는 `GoAgent-0.3.22-win-x64-nvidia-portable.zip` |
| 체크섬 | `SHA256SUMS.txt` |

### 이번 버전

- 일부 Fox SGF의 `KM[0]` 때문에 초반 흑 승률이 비정상적으로 높게 보이던 문제를 수정했습니다.
- 빠른 승률 그래프의 탐색 설정을 더 안정적으로 조정했습니다.
- 창 크기 변경 후에도 승률 그래프의 마우스 위치와 수순이 정확히 맞습니다.

## ภาษาไทย

### เลือกไฟล์ก่อนดาวน์โหลด

| แพลตฟอร์ม | ไฟล์ที่แนะนำ |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.22-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.22-mac-x64.dmg` |
| Windows x64 มาตรฐาน แนะนำ OpenCL | `GoAgent-0.3.22-win-x64.exe` หรือ `GoAgent-0.3.22-win-x64-portable.zip` |
| Windows NVIDIA edition สำหรับ NVIDIA GPU และ CUDA | `GoAgent-0.3.22-win-x64-nvidia.exe` หรือ `GoAgent-0.3.22-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### จุดสำคัญของรุ่นนี้

- แก้ปัญหา SGF จาก Fox ที่มี `KM[0]` แล้วทำให้อัตราชนะของดำช่วงต้นเกมสูงผิดปกติ
- ปรับกราฟอัตราชนะเร็วให้เสถียรมากขึ้น
- แก้การชี้เมาส์และคลิกบนกราฟอัตราชนะให้ตรงกับตาที่เลือกหลังปรับขนาดหน้าต่าง

## Tiếng Việt

### Chọn gói tải xuống

| Nền tảng | Gói khuyến nghị |
| --- | --- |
| macOS Apple Silicon | `GoAgent-0.3.22-mac-arm64.dmg` |
| macOS Intel | `GoAgent-0.3.22-mac-x64.dmg` |
| Windows x64 tiêu chuẩn, khuyến nghị OpenCL | `GoAgent-0.3.22-win-x64.exe` hoặc `GoAgent-0.3.22-win-x64-portable.zip` |
| Windows NVIDIA edition cho GPU NVIDIA và CUDA | `GoAgent-0.3.22-win-x64-nvidia.exe` hoặc `GoAgent-0.3.22-win-x64-nvidia-portable.zip` |
| Checksums | `SHA256SUMS.txt` |

### Điểm mới

- Sửa lỗi một số SGF Fox có `KM[0]` làm tỷ lệ thắng đầu ván của đen tăng bất thường.
- Ổn định biểu đồ winrate nhanh với cấu hình tìm kiếm đáng tin cậy hơn.
- Sửa vị trí hover/click/drag trên biểu đồ winrate để luôn khớp với nước cờ sau khi thay đổi kích thước cửa sổ.

## Quality baseline

This release keeps the existing top-quality baseline: grounded shape recognition engine, local pattern matcher, knowledge source-policy gates, optimized move-range review, quality checks and eval gates, Real Eval / engine silver fixture gate, KataGo engine pool telemetry, Release artifact smoke, student level, student age, teacher persona style settings with evidence boundary, teacher sessions, selective PR #6 integration, strict selected-provider TTS, offline synthesis validation for Kokoro, Vision Evidence Chain, KataGo Trace Translator, Volcengine / Doubao TTS, and multilingual release guidance.

Windows packages continue to follow the OpenCL and NVIDIA split. The standard Windows package includes the Windows OpenCL runtime bundle and KataGo OpenCL adjacent runtime files; GPU vendor OpenCL drivers still come from the user's NVIDIA / AMD / Intel graphics driver.

Thanks to layiku and wimi321.
