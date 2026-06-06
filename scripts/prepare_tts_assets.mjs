#!/usr/bin/env node
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'

const root = process.cwd()
const targetRoot = join(root, 'data', 'tts', 'kokoro', 'zh-CN')
const revision = '6cc0f0d2ebe369a68b0df87c2b65c1af8c0ac3e3'
const base = `https://huggingface.co/onnx-community/Kokoro-82M-v1.1-zh-ONNX/resolve/${revision}`

const assets = [
  // kokoro-js resolves q8 models to this filename at runtime.
  ['onnx/model_quantized.onnx', 'onnx/model_quantized.onnx'],
  ['config.json', 'config.json'],
  ['tokenizer.json', 'tokenizer.json'],
  ['tokenizer_config.json', 'tokenizer_config.json'],
  ['voices/zf_001.bin', 'voices/zf_001.bin'],
  ['voices/zm_009.bin', 'voices/zm_009.bin']
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function retryDelayMs(response, attempt) {
  const retryAfter = response?.headers?.get?.('retry-after')
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : NaN
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(90_000, retryAfterSeconds * 1000)
  }
  const baseDelay = Math.min(60_000, 1500 * 2 ** Math.max(0, attempt - 1))
  const jitter = Math.floor(Math.random() * 900)
  return baseDelay + jitter
}

async function download(url, output) {
  mkdirSync(dirname(output), { recursive: true })
  if (existsSync(output)) {
    console.log(`[prepare-tts-assets] exists ${output}`)
    return
  }
  const partial = `${output}.part`
  let lastError
  const maxAttempts = Number(process.env.GOAGENT_TTS_DOWNLOAD_ATTEMPTS ?? 10)
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      rmSync(partial, { force: true })
      console.log(`[prepare-tts-assets] downloading ${url} (attempt ${attempt}/${maxAttempts})`)
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GoAgent-release-assets/1.0'
        }
      })
      if (!response.ok || !response.body) {
        const error = new Error(`HTTP ${response.status}`)
        error.response = response
        throw error
      }
      await pipeline(response.body, createWriteStream(partial))
      renameSync(partial, output)
      return
    } catch (error) {
      lastError = error
      rmSync(partial, { force: true })
      if (attempt < maxAttempts) {
        const delay = retryDelayMs(error?.response, attempt)
        console.warn(
          `[prepare-tts-assets] retrying ${url} in ${Math.round(delay / 1000)}s: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
        await sleep(delay)
      }
    }
  }
  throw new Error(`Failed to download ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`)
}

function normalizeTokenizerJson(path) {
  const text = readFileSync(path, 'utf8')
  try {
    JSON.parse(text)
    return
  } catch {
    // The upstream zh-ONNX tokenizer currently ships one malformed vocab entry
    // (`"$", 0`). Fix only that syntax bug and fail loudly if anything else is
    // still invalid, so release assets remain deterministic.
    const repaired = text.replace(/"vocab":\s*\{\s*"\$",\s*0,/, '"vocab": {\n      "$": 0,')
    JSON.parse(repaired)
    writeFileSync(path, repaired)
    console.log(`[prepare-tts-assets] normalized ${path}`)
  }
}

for (const [remote, local] of assets) {
  await download(`${base}/${remote}?download=true`, join(targetRoot, local))
}

normalizeTokenizerJson(join(targetRoot, 'tokenizer.json'))

console.log('[prepare-tts-assets] Kokoro zh-CN assets prepared.')
