import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { join } from 'node:path'

const root = process.cwd()
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const notes = readFileSync(join(root, 'docs', `RELEASE_NOTES_v${packageJson.version}.md`), 'utf8')

test('release notes include multilingual download guidance', () => {
  for (const heading of ['## 中文', '## 繁體中文', '## English', '## 日本語', '## 한국어', '## ภาษาไทย', '## Tiếng Việt']) {
    assert.ok(notes.includes(heading), `missing ${heading}`)
  }
})

test('release notes list standard and NVIDIA artifacts', () => {
  for (const asset of [
    `GoAgent-${packageJson.version}-mac-arm64.dmg`,
    `GoAgent-${packageJson.version}-mac-x64.dmg`,
    `GoAgent-${packageJson.version}-win-x64-portable.zip`,
    `GoAgent-${packageJson.version}-win-x64.exe`,
    `GoAgent-${packageJson.version}-win-x64-nvidia.exe`,
    `GoAgent-${packageJson.version}-win-x64-nvidia-portable.7z.001`
  ]) {
    assert.ok(notes.includes(asset), `missing ${asset}`)
  }
})

test('release notes do not list retired Lite artifacts', () => {
  for (const asset of [
    `GoAgent-${packageJson.version}-mac-arm64-lite.dmg`,
    `GoAgent-${packageJson.version}-mac-x64-lite.dmg`,
    `GoAgent-${packageJson.version}-win-x64-lite.exe`,
    `GoAgent-${packageJson.version}-win-x64-lite-portable.zip`
  ]) {
    assert.equal(notes.includes(asset), false, `must not advertise ${asset}`)
  }
})
