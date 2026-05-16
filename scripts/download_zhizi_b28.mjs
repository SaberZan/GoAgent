#!/usr/bin/env node
// Downloads the zhizi b28 KataGo model into data/katago/models/ and registers it
// in data/katago/manifest.json so the desktop builder bundles it into the release.
//
// Usage:
//   node scripts/download_zhizi_b28.mjs
//
// If the file already exists, the download is skipped. The script always runs
// prepare_katago_assets.mjs --extra-model afterwards to refresh manifest metadata.

import { spawnSync } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { mkdir, rename, stat, unlink } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const ZHIZI_B28_URL = 'https://media.katagotraining.org/uploaded/networks/models/kata1/kata1-zhizi-b28c512nbt-muonfd2.bin.gz'
const ZHIZI_B28_FILENAME = 'kata1-zhizi-b28c512nbt-muonfd2.bin.gz'

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function download(url, target) {
  const tmp = `${target}.download`
  await mkdir(dirname(target), { recursive: true })
  await unlink(tmp).catch(() => undefined)
  const response = await fetch(url, {
    headers: { 'User-Agent': 'GoAgent zhizi b28 fetch' }
  })
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`)
  }
  const total = Number(response.headers.get('content-length') ?? 0) || 0
  let received = 0
  const onChunk = (chunk) => {
    received += chunk.length
    if (total > 0) {
      const pct = Math.floor((received / total) * 100)
      process.stdout.write(`\r[zhizi-b28] ${pct}% (${(received / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024).toFixed(1)} MB)   `)
    }
  }
  const passthrough = new TransformStream({
    transform(chunk, controller) {
      onChunk(chunk)
      controller.enqueue(chunk)
    }
  })
  await pipeline(Readable.fromWeb(response.body.pipeThrough(passthrough)), createWriteStream(tmp))
  process.stdout.write('\n')
  await rename(tmp, target)
}

async function main() {
  const target = join(root, 'data', 'katago', 'models', ZHIZI_B28_FILENAME)
  if (await exists(target)) {
    console.log(`[zhizi-b28] already present at ${target}, skipping download`)
  } else {
    console.log(`[zhizi-b28] downloading from ${ZHIZI_B28_URL}`)
    await download(ZHIZI_B28_URL, target)
    console.log(`[zhizi-b28] saved to ${target}`)
  }
  const prepare = spawnSync('node', ['scripts/prepare_katago_assets.mjs', `--extra-model=${target}`], {
    cwd: root,
    stdio: 'inherit'
  })
  if (prepare.status !== 0) {
    process.exit(prepare.status ?? 1)
  }
}

main().catch((error) => {
  console.error(`[zhizi-b28] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
