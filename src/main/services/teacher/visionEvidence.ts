import type {
  TeacherRunMode,
  TeacherRunRequest,
  VisionEvidenceDetail,
  VisionEvidenceImage,
  VisionEvidenceImageRole,
  VisionEvidenceReport
} from '@main/lib/types'
import type { ChatContentPart } from '../llm/provider'

export const VISION_EVIDENCE_MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const VISION_EVIDENCE_RECOMMENDED_IMAGE_BYTES = 2 * 1024 * 1024
export const VISION_EVIDENCE_DEFAULT_DETAIL: VisionEvidenceDetail = 'high'

const DATA_URL_PATTERN = /^data:(image\/(png|jpeg|jpg));base64,([A-Za-z0-9+/=\s]+)$/i

interface RawVisionImage {
  url: string
  index: number
  role: VisionEvidenceImageRole
  moveNumber?: number
  caption: string
}

export interface VisionValidationResult {
  ok: boolean
  blockingIssues: string[]
  warnings: string[]
}

function nowIso(): string {
  return new Date().toISOString()
}

export function visionRequiredForMode(mode: TeacherRunMode | string | undefined): boolean {
  return mode === 'current-move' || mode === 'move-range'
}

export function visionRequiredForIntent(intent: string | undefined): boolean {
  return intent === 'current-move' || intent === 'move-range' || intent === 'game-review'
}

function normalizeMime(value: string | undefined): VisionEvidenceImage['mimeType'] {
  const lowered = (value ?? '').toLowerCase()
  if (lowered === 'image/png') return 'image/png'
  if (lowered === 'image/jpeg' || lowered === 'image/jpg') return 'image/jpeg'
  return 'unknown'
}

function byteLengthFromBase64(base64: string): number {
  const clean = base64.replace(/\s+/g, '')
  if (!clean) return 0
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((clean.length * 3) / 4) - padding)
}

function readPngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
  if (!pngSignature.every((value, index) => bytes[index] === value)) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return {
    width: view.getUint32(16, false),
    height: view.getUint32(20, false)
  }
}

function readJpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let offset = 2
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }
    const marker = bytes[offset + 1]
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3]
    if (length < 2) return null
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
    if (isStartOfFrame && offset + 8 < bytes.length) {
      return {
        height: (bytes[offset + 5] << 8) + bytes[offset + 6],
        width: (bytes[offset + 7] << 8) + bytes[offset + 8]
      }
    }
    offset += 2 + length
  }
  return null
}

function decodeSizeFromDataUrl(url: string, mimeType: VisionEvidenceImage['mimeType']): { width?: number; height?: number } {
  const match = url.match(DATA_URL_PATTERN)
  if (!match) return {}
  try {
    const bytes = Uint8Array.from(Buffer.from(match[3].replace(/\s+/g, ''), 'base64'))
    const size = mimeType === 'image/png'
      ? readPngSize(bytes)
      : mimeType === 'image/jpeg'
        ? readJpegSize(bytes)
        : null
    return size ?? {}
  } catch {
    return {}
  }
}

function imageBytes(url: string): number {
  const match = url.match(DATA_URL_PATTERN)
  if (!match) return 0
  return byteLengthFromBase64(match[3])
}

function imageMime(url: string): VisionEvidenceImage['mimeType'] {
  const match = url.match(DATA_URL_PATTERN)
  return normalizeMime(match?.[1])
}

function imageWarnings(input: RawVisionImage, bytes: number, mimeType: VisionEvidenceImage['mimeType']): string[] {
  const warnings: string[] = []
  if (!input.url.startsWith('data:image/')) {
    warnings.push('image is not a data:image URL')
  }
  if (mimeType === 'unknown') {
    warnings.push('unsupported image mime type')
  }
  if (bytes <= 0) {
    warnings.push('image bytes are empty or invalid')
  }
  if (bytes > VISION_EVIDENCE_RECOMMENDED_IMAGE_BYTES) {
    warnings.push(`image is larger than recommended ${VISION_EVIDENCE_RECOMMENDED_IMAGE_BYTES} bytes`)
  }
  if (bytes > VISION_EVIDENCE_MAX_IMAGE_BYTES) {
    warnings.push(`image exceeds hard limit ${VISION_EVIDENCE_MAX_IMAGE_BYTES} bytes`)
  }
  return warnings
}

function rawImagesFromRequest(request: TeacherRunRequest, intentOrMode?: string): RawVisionImage[] {
  const mode = request.mode ?? intentOrMode
  const moveRange = request.moveRange
  const output: RawVisionImage[] = []
  if (request.boardImageDataUrl) {
    output.push({
      url: request.boardImageDataUrl,
      index: output.length,
      role: mode === 'move-range' ? 'range-key-move' : 'current-board',
      moveNumber: request.moveNumber,
      caption: request.moveNumber
        ? `图 ${output.length + 1}: 第 ${request.moveNumber} 手棋盘截图；请结合 KataGo 数据核对实战手、候选点和棋形。`
        : `图 ${output.length + 1}: 当前棋盘截图；请结合 KataGo 数据核对实战手、候选点和棋形。`
    })
  }
  for (const url of request.boardImageDataUrls ?? []) {
    const summaryMove = request.moveRangeSummary?.keyMoves?.[output.length]?.moveNumber
    const moveNumber = summaryMove ?? (moveRange ? moveRange.start + output.length : undefined)
    output.push({
      url,
      index: output.length,
      role: 'range-key-move',
      moveNumber,
      caption: moveNumber
        ? `图 ${output.length + 1}: 区间关键手第 ${moveNumber} 手棋盘截图；先看区间走势，再讲此关键手得失。`
        : `图 ${output.length + 1}: 区间关键手棋盘截图；先看区间走势，再讲关键手得失。`
    })
  }
  return output
}

export function buildVisionEvidenceReport(request: TeacherRunRequest, intentOrMode?: string): VisionEvidenceReport {
  const required = visionRequiredForMode(request.mode) || visionRequiredForIntent(intentOrMode)
  const images = rawImagesFromRequest(request, intentOrMode).map<VisionEvidenceImage>((input) => {
    const bytes = imageBytes(input.url)
    const mimeType = imageMime(input.url)
    const warnings = imageWarnings(input, bytes, mimeType)
    const size = decodeSizeFromDataUrl(input.url, mimeType)
    return {
      id: `vision-${input.index + 1}`,
      index: input.index,
      role: input.role,
      moveNumber: input.moveNumber,
      mimeType,
      bytes,
      ...size,
      detail: VISION_EVIDENCE_DEFAULT_DETAIL,
      caption: input.caption,
      valid: warnings.every((warning) => !/exceeds hard limit|empty|invalid|unsupported/.test(warning)),
      warnings
    }
  })
  const warnings = images.flatMap((image) => image.warnings.map((warning) => `${image.id}: ${warning}`))
  const blockingIssues: string[] = []
  if (required && images.length === 0) {
    blockingIssues.push('this teacher task requires a board image, but none was attached')
  }
  for (const image of images) {
    if (!image.valid) blockingIssues.push(`${image.id} is not valid for vision input`)
    if (image.bytes > VISION_EVIDENCE_MAX_IMAGE_BYTES) blockingIssues.push(`${image.id} exceeds the maximum supported vision input size`)
  }
  return {
    required,
    attached: images.length > 0,
    imageCount: images.length,
    providerSupportsVision: 'unknown',
    images,
    warnings,
    blockingIssues,
    createdAt: nowIso()
  }
}

export function validateVisionEvidenceForIntent(report: VisionEvidenceReport, intentOrMode?: string): VisionValidationResult {
  const required = report.required || visionRequiredForIntent(intentOrMode)
  const blockingIssues = [...report.blockingIssues]
  if (required && !report.attached) {
    blockingIssues.push('required board image was not attached')
  }
  if (required && report.images.every((image) => !image.valid)) {
    blockingIssues.push('no valid board image is available for required vision task')
  }
  return {
    ok: blockingIssues.length === 0,
    blockingIssues: [...new Set(blockingIssues)],
    warnings: report.warnings
  }
}

export function formatVisionEvidenceForPrompt(report: VisionEvidenceReport): string {
  const header = report.attached
    ? `【棋盘图证据】本轮已附 ${report.imageCount} 张棋盘图，detail=high。`
    : `【棋盘图证据】本轮未附棋盘图。required=${report.required ? 'true' : 'false'}。`
  const lines = report.images.map((image) => [
    `- ${image.id}: ${image.caption}`,
    `  role=${image.role}, move=${image.moveNumber ?? 'unknown'}, mime=${image.mimeType}, bytes=${image.bytes}, size=${image.width ?? '?'}x${image.height ?? '?'}, valid=${image.valid}`
  ].join('\n'))
  const warnings = report.warnings.length ? [`警告: ${report.warnings.join('；')}`] : []
  const guard = report.attached
    ? ['本轮已经提供棋盘图。除非 visionEvidence.attached=false，否则严禁说“没有棋盘图”“看不到棋盘”“未提供图片”。']
    : ['如果任务需要棋盘图而未提供，请直接说明需要重新生成棋盘截图，不要假装看到了图。']
  return [header, ...lines, ...warnings, ...guard].join('\n')
}

export function buildVisionImageContentParts(request: TeacherRunRequest, report: VisionEvidenceReport): ChatContentPart[] {
  const raw = rawImagesFromRequest(request)
  const parts: ChatContentPart[] = []
  for (const image of report.images) {
    const source = raw[image.index]
    if (!source || !image.valid) continue
    parts.push({ type: 'text', text: image.caption })
    parts.push({ type: 'image_url', image_url: { url: source.url, detail: image.detail } })
  }
  return parts
}

export function visionEvidenceForLog(report: VisionEvidenceReport): Omit<VisionEvidenceReport, 'images'> & { images: VisionEvidenceImage[] } {
  return {
    ...report,
    images: report.images.map((image) => ({ ...image }))
  }
}
