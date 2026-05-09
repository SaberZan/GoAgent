import { existsSync } from 'node:fs'
import type { AppSettings, TtsSynthesisRequest, TtsSynthesisResult, TtsVoice } from '@main/lib/types'
import { getTtsVolcengineApiKey } from '@main/lib/store'
import { audioDataUrl, cachedAudioPath, hashTtsInput, makeTtsResultId, mimeForFormat, writeAudio } from './cache'
import { assertSelectedProvider, type TtsProvider } from './ttsTypes'

const VOLCENGINE_ENDPOINT = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional'

const VOLCENGINE_VOICES: TtsVoice[] = [
  { id: 'zh_female_vv_uranus_bigtts', label: '中文女声 · 清亮自然', language: 'zh-CN', provider: 'volcengine-doubao' },
  { id: 'zh_female_xiaohe_uranus_bigtts', label: '中文女声 · 温和讲解', language: 'zh-CN', provider: 'volcengine-doubao' },
  { id: 'zh_male_bvlazysheep', label: '中文男声 · 沉稳口语', language: 'zh-CN', provider: 'volcengine-doubao' },
  { id: 'zh_male_ahu_conversation_wvae_bigtts', label: '中文男声 · 对话讲解', language: 'zh-CN', provider: 'volcengine-doubao' }
]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function speechRateFromSettings(rate: number): number {
  return Math.round(clamp((Number.isFinite(rate) ? rate : 1) - 1, -0.5, 1) * 100)
}

function loudnessFromSettings(volume: number): number {
  return Math.round(clamp((Number.isFinite(volume) ? volume : 1) - 1, -1, 2) * 50)
}

function endpoint(settings: AppSettings): string {
  return settings.ttsVolcengineEndpoint.trim() || VOLCENGINE_ENDPOINT
}

function apiKey(settings: AppSettings): string {
  return settings.ttsVolcengineApiKey.trim() || getTtsVolcengineApiKey().trim()
}

function voiceId(settings: AppSettings, request?: TtsSynthesisRequest): string {
  return request?.voiceId || settings.ttsVolcengineSpeaker || settings.ttsVoiceId || VOLCENGINE_VOICES[0].id
}

function parseJsonObjects(buffer: string): { objects: unknown[]; rest: string } {
  const objects: unknown[] = []
  let start = -1
  let depth = 0
  let inString = false
  let escaped = false
  for (let index = 0; index < buffer.length; index += 1) {
    const char = buffer[index]
    if (start < 0) {
      if (char === '{') {
        start = index
        depth = 1
      }
      continue
    }
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      const raw = buffer.slice(start, index + 1)
      try {
        objects.push(JSON.parse(raw))
      } catch {
        // Ignore malformed non-JSON fragments around the stream payload.
      }
      start = -1
    }
  }
  return { objects, rest: start >= 0 ? buffer.slice(start) : '' }
}

function normalizeStreamText(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.trimStart().startsWith('data:') ? line.trimStart().slice(5).trimStart() : line)
    .filter((line) => line.trim() !== '[DONE]')
    .join('\n')
}

function collectAudioChunk(payload: unknown, chunks: Buffer[]): void {
  if (!payload || typeof payload !== 'object') return
  const item = payload as Record<string, unknown>
  const code = typeof item.code === 'number' ? item.code : undefined
  if (code !== undefined && code !== 0 && code !== 20000000) {
    throw new Error(`火山引擎 TTS 返回错误: code=${code} message=${String(item.message ?? '')}`)
  }
  if (typeof item.data === 'string' && item.data.trim()) {
    chunks.push(Buffer.from(item.data.replace(/^data:audio\/[^;]+;base64,/, ''), 'base64'))
  }
}

async function readVolcengineAudio(response: Response): Promise<Buffer> {
  const chunks: Buffer[] = []
  if (!response.body) {
    const text = await response.text()
    for (const item of parseJsonObjects(normalizeStreamText(text)).objects) collectAudioChunk(item, chunks)
    if (!chunks.length) throw new Error('火山引擎 TTS 没有返回音频数据。')
    return Buffer.concat(chunks)
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    pending += normalizeStreamText(decoder.decode(value, { stream: true }))
    const parsed = parseJsonObjects(pending)
    pending = parsed.rest
    for (const item of parsed.objects) collectAudioChunk(item, chunks)
  }
  pending += normalizeStreamText(decoder.decode())
  for (const item of parseJsonObjects(pending).objects) collectAudioChunk(item, chunks)
  if (!chunks.length) throw new Error('火山引擎 TTS 没有返回音频数据。')
  return Buffer.concat(chunks)
}

export const volcengineDoubaoProvider: TtsProvider = {
  id: 'volcengine-doubao',
  label: '火山引擎 · 豆包语音',
  async inspect(settings) {
    assertSelectedProvider('volcengine-doubao', settings)
    if (!endpoint(settings)) return { ready: false, code: 'missing-endpoint', message: '火山引擎 TTS Endpoint 未配置。' }
    if (!apiKey(settings)) return { ready: false, code: 'missing-api-key', message: '火山引擎 API Key 未配置。' }
    if (!settings.ttsVolcengineResourceId.trim()) return { ready: false, code: 'missing-resource-id', message: '火山引擎 Resource ID 未配置。' }
    if (!settings.ttsVolcengineSpeaker.trim() && !settings.ttsVoiceId.trim()) return { ready: false, code: 'missing-speaker', message: '火山引擎发音人未配置。' }
    return { ready: true, code: 'ready', message: '火山引擎豆包语音已配置。' }
  },
  async listVoices(settings): Promise<TtsVoice[]> {
    assertSelectedProvider('volcengine-doubao', settings)
    const configured = settings.ttsVolcengineSpeaker.trim()
    if (configured && !VOLCENGINE_VOICES.some((voice) => voice.id === configured)) {
      return [{ id: configured, label: `${configured} · 自定义音色`, language: settings.ttsLanguage, provider: 'volcengine-doubao' }, ...VOLCENGINE_VOICES]
    }
    return VOLCENGINE_VOICES
  },
  async synthesize(request: TtsSynthesisRequest, settings: AppSettings): Promise<TtsSynthesisResult> {
    assertSelectedProvider('volcengine-doubao', settings)
    const readiness = await this.inspect(settings)
    if (!readiness.ready) throw new Error(readiness.message)
    const text = request.text.trim()
    if (!text) throw new Error('TTS text is empty')
    const format = 'mp3'
    const speaker = voiceId(settings, request)
    const resourceId = settings.ttsVolcengineResourceId.trim() || 'seed-tts-2.0'
    const model = settings.ttsVolcengineModel.trim()
    const sampleRate = Number.isFinite(settings.ttsVolcengineSampleRate) ? settings.ttsVolcengineSampleRate : 24000
    const cacheKey = hashTtsInput({
      provider: 'volcengine-doubao',
      endpoint: endpoint(settings),
      resourceId,
      model,
      speaker,
      sampleRate,
      text,
      rate: settings.ttsRate,
      volume: settings.ttsVolume,
      protocol: 'http-chunked-v3'
    })
    const output = cachedAudioPath('volcengine-doubao', cacheKey, format)
    const mimeType = mimeForFormat(format)
    if (settings.ttsCacheEnabled && existsSync(output)) {
      return { id: makeTtsResultId(), provider: 'volcengine-doubao', mimeType, audioPath: output, audioDataUrl: audioDataUrl(output, mimeType), cached: true, textHash: cacheKey, createdAt: new Date().toISOString() }
    }
    const response = await fetch(endpoint(settings), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey(settings),
        'X-Api-Resource-Id': resourceId,
        'X-Api-Request-Id': makeTtsResultId(),
        'X-Control-Require-Usage-Tokens-Return': 'text_words'
      },
      body: JSON.stringify({
        user: { uid: 'goagent-desktop' },
        namespace: 'BidirectionalTTS',
        req_params: {
          text,
          ...(model ? { model } : {}),
          speaker,
          audio_params: {
            format,
            sample_rate: sampleRate,
            speech_rate: speechRateFromSettings(settings.ttsRate),
            loudness_rate: loudnessFromSettings(settings.ttsVolume)
          }
        }
      })
    })
    if (!response.ok) {
      throw new Error(`火山引擎 TTS 请求失败: HTTP ${response.status} ${await response.text().catch(() => '')}`)
    }
    const audio = await readVolcengineAudio(response)
    const audioPath = writeAudio('volcengine-doubao', cacheKey, format, audio)
    return { id: makeTtsResultId(), provider: 'volcengine-doubao', mimeType, audioPath, audioDataUrl: audioDataUrl(audioPath, mimeType), cached: false, textHash: cacheKey, createdAt: new Date().toISOString() }
  }
}

export const __volcengineTtsTestHooks = {
  parseJsonObjects,
  normalizeStreamText,
  readVolcengineAudio
}
