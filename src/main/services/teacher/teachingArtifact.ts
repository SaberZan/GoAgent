import type {
  KataGoCandidate,
  KataGoMoveAnalysis,
  KnowledgeMatch,
  KnowledgePacket,
  RecommendedProblem,
  StructuredTeacherResult,
  StudentProfile,
  TeacherArtifact,
  TeacherArtifactBoardSnapshot,
  TeacherArtifactCandidate,
  TeacherArtifactEvidenceSummary,
  TeacherArtifactKeyMove,
  TeacherArtifactKind,
  TeacherArtifactSandboxHtml,
  TeacherArtifactSandboxScriptPolicy,
  TeacherArtifactSource,
  TeacherArtifactTrainingItem,
  TeacherArtifactVariation,
  TeacherRunRequest,
  TeachingPacingAdvice,
  VisionEvidenceReport
} from '@main/lib/types'

type ArtifactIntent = 'current-move' | 'move-range' | 'game-review' | 'batch-review' | 'training-plan' | 'open-ended' | 'freeform'
type TeacherArtifactDraft = Omit<TeacherArtifact, 'exportHtml' | 'exportFileName'>

export interface BuildTeacherArtifactInput {
  id: string
  title: string
  intent: ArtifactIntent
  request: TeacherRunRequest
  markdown: string
  analysis?: KataGoMoveAnalysis
  rangeAnalyses?: KataGoMoveAnalysis[]
  structured?: StructuredTeacherResult
  knowledge?: KnowledgePacket[]
  knowledgeMatches?: KnowledgeMatch[]
  recommendedProblems?: RecommendedProblem[]
  teachingPacing?: TeachingPacingAdvice
  visionEvidence?: VisionEvidenceReport
  studentProfile?: StudentProfile
}

export interface CreateTeachingArtifactOptions {
  id?: string
  title?: string
  kind?: TeacherArtifactKind
  source?: TeacherArtifactSource
  createdAt?: string
  exportFileName?: string
  evidence?: Partial<TeacherArtifactEvidenceSummary>
  allowSandboxScripts?: boolean
}

export interface TeachingArtifactValidationResult {
  ok: boolean
  artifact?: TeacherArtifact
  errors: string[]
  warnings: string[]
}

export interface StaticTeacherArtifactHtmlValidationResult {
  ok: boolean
  errors: string[]
}

type UnknownRecord = Record<string, unknown>

const ARTIFACT_KINDS: TeacherArtifactKind[] = ['current-move-review', 'move-range-review', 'game-review', 'training-plan', 'freeform']
const MAX_TITLE_CHARS = 120
const MAX_SUMMARY_CHARS = 900
const MAX_TEXT_CHARS = 420
const MAX_CANDIDATES = 8
const MAX_VARIATIONS = 6
const MAX_KEY_MOVES = 8
const MAX_KNOWLEDGE_MATCHES = 4
const MAX_TRAINING_ITEMS = 6
const MAX_PV_MOVES = 16
const MAX_SANDBOX_HTML_CHARS = 60_000

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function numericValue(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(parsed) ? parsed : undefined
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function positiveInteger(value: unknown, fallback: number, max = 999): number {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(1, Math.min(max, Math.trunc(parsed)))
}

function nonNegativeInteger(value: unknown, fallback: number, max = 999): number {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(0, Math.min(max, Math.trunc(parsed)))
}

function normalizeRankValue(value: unknown, index: number, zeroBased = false): number {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(parsed)) return index + 1
  const rank = Math.trunc(parsed)
  if (zeroBased && rank >= 0) return rank + 1
  if (rank >= 1) return rank
  return index + 1
}

function redactSensitiveText(value: string): string {
  const secretKeyPattern = '(?:api[_-]?key|apikey|llmApiKey|ttsCustomApiKey|ttsVolcengineApiKey|ttsVolcengineAccessToken|proxyApiKey|token|password|secret|authorization|github[_-]?token|gh[_-]?token|csc_link|apple_app_specific_password)'
  return value
    .replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=_-]+/gi, '[REDACTED_IMAGE_DATA]')
    .replace(/javascript:/gi, 'javascript-removed:')
    .replace(/file:\/\/[^\s"'<>)]*/gi, '[REDACTED_LOCAL_PATH]')
    .replace(/(^|[\s"'(])(?:\/Users|\/home|\/var|\/private|\/tmp|\/Volumes)\/[^\s"'<>)]*/g, '$1[REDACTED_LOCAL_PATH]')
    .replace(/\b[A-Za-z]:\\[^\s"'<>)]*/g, '[REDACTED_LOCAL_PATH]')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, 'Bearer [REDACTED]')
    .replace(/\b(sk-[A-Za-z0-9_-]{12,}|github_pat_[A-Za-z0-9_]{12,}|ghp_[A-Za-z0-9_]{12,}|xox[baprs]-[A-Za-z0-9-]{12,}|AKIA[A-Z0-9]{12,})\b/g, '[REDACTED_TOKEN]')
    .replace(new RegExp(`["']?${secretKeyPattern}["']?\\s*[:=]\\s*["'][^"']+["']`, 'gi'), '[REDACTED_SECRET]')
    .replace(new RegExp(`(["']?${secretKeyPattern}["']?\\s*[:=]\\s*["'])[^"']+(["'])`, 'gi'), '$1[REDACTED]$2')
    .replace(new RegExp(`(["']?${secretKeyPattern}["']?\\s*[:=]\\s*)[^\\s"',}\\]]+`, 'gi'), '$1[REDACTED]')
}

function sanitizeText(value: unknown, maxChars = MAX_TEXT_CHARS): string {
  const text = redactSensitiveText(String(value ?? ''))
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim()
  return text.length > maxChars ? text.slice(0, maxChars).trimEnd() : text
}

function sanitizeId(value: unknown, fallback: string): string {
  const id = sanitizeText(value, 120)
    .replace(/[^\p{L}\p{N}_:.@-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return id || fallback
}

function sanitizeStringArray(value: unknown, limit: number, maxChars = 80): string[] {
  return arrayValue(value)
    .map((item) => sanitizeText(item, maxChars))
    .filter(Boolean)
    .slice(0, limit)
}

function firstParagraph(markdown: string): string {
  return markdown
    .split(/\n+/)
    .map((line) => line.trim())
    .find(Boolean) ?? ''
}

function normalizeWinrate(value: number | undefined): number | undefined {
  if (typeof value !== 'number') return undefined
  if (value >= 0 && value <= 1) return value * 100
  return value
}

function clampWinrate(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.max(0, Math.min(100, value))
}

function isWhiteColor(value: unknown): boolean {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === 'w' || normalized === 'white' || normalized === '白'
}

function currentPlayerWinrate(blackWinrate: number | undefined, color: unknown): number | undefined {
  const winrate = clampWinrate(normalizeWinrate(blackWinrate))
  if (typeof winrate !== 'number') return undefined
  return isWhiteColor(color) ? 100 - winrate : winrate
}

function currentPlayerScoreLead(blackScoreLead: number | undefined, color: unknown): number | undefined {
  if (typeof blackScoreLead !== 'number' || !Number.isFinite(blackScoreLead)) return undefined
  return isWhiteColor(color) ? -blackScoreLead : blackScoreLead
}

function formatWinrate(value: number | undefined): string {
  const next = normalizeWinrate(value)
  return typeof next === 'number' ? `${next.toFixed(1)}%` : '暂无'
}

function formatScore(value: number | undefined): string {
  if (typeof value !== 'number') return '暂无'
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}目`
}

function sanitizeFileName(value: string): string {
  const safe = value
    .trim()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
  return safe || 'goagent-review'
}

function artifactKind(intent: ArtifactIntent): TeacherArtifactKind {
  if (intent === 'current-move') return 'current-move-review'
  if (intent === 'move-range') return 'move-range-review'
  if (intent === 'game-review' || intent === 'batch-review') return 'game-review'
  if (intent === 'training-plan') return 'training-plan'
  return 'freeform'
}

function candidateNote(candidate: KataGoCandidate, rank: number, playedMove?: string): string {
  if (playedMove && candidate.move === playedMove) return '实战点'
  if (rank === 1) return 'KataGo 首选'
  return `第 ${rank} 选`
}

function buildCandidates(analysis?: KataGoMoveAnalysis): TeacherArtifactCandidate[] {
  const topMoves = analysis?.before.topMoves ?? []
  const zeroBasedOrder = topMoves[0]?.order === 0
  const currentColor = analysis?.currentMove?.color
  return topMoves.slice(0, 5).map((candidate, index) => {
    const rank = normalizeRankValue(candidate.order, index, zeroBasedOrder)
    return {
      rank,
      move: sanitizeText(candidate.move, 24),
      winrate: currentPlayerWinrate(candidate.winrate, currentColor),
      scoreLead: currentPlayerScoreLead(finiteNumber(candidate.scoreLead), currentColor),
      visits: finiteNumber(candidate.visits),
      pv: candidate.pv.slice(0, 12).map((move) => sanitizeText(move, 24)).filter(Boolean),
      note: candidateNote(candidate, rank, analysis?.playedMove?.move)
    }
  })
}

function buildVariations(
  candidates: TeacherArtifactCandidate[],
  teachingPacing?: TeachingPacingAdvice
): TeacherArtifactVariation[] {
  const pacingVariations = (teachingPacing?.variationTeachingHints ?? []).slice(0, 3).map((hint) => ({
    label: hint.move,
    purpose: hint.purpose,
    pv: hint.pv.slice(0, 12),
    result: hint.result,
    confidence: hint.confidence
  }))
  if (pacingVariations.length > 0) return pacingVariations

  return candidates.slice(0, 3).flatMap((candidate) => {
    if (candidate.pv.length === 0) return []
    return [{
      label: candidate.move,
      purpose: candidate.rank === 1 ? '首选变化' : `第 ${candidate.rank} 选变化`,
      pv: candidate.pv,
      result: `${formatWinrate(candidate.winrate)} · ${formatScore(candidate.scoreLead)}`,
      confidence: candidate.rank === 1 ? 'high' : 'medium'
    }]
  })
}

function buildKeyMoves(structured?: StructuredTeacherResult): TeacherArtifactKeyMove[] {
  return (structured?.keyMistakes ?? []).flatMap((move) => {
    if (typeof move.moveNumber !== 'number') return []
    return [{
      moveNumber: move.moveNumber,
      color: move.color,
      played: move.played,
      recommended: move.recommended,
      severity: move.severity,
      errorType: move.errorType,
      summary: move.explanation || move.evidence || '关键问题手'
    }]
  }).slice(0, 6)
}

function buildAnalysisKeyMoves(analysis?: KataGoMoveAnalysis): TeacherArtifactKeyMove[] {
  if (!analysis?.currentMove) return []
  const loss = analysis.playedMove?.winrateLoss ?? 0
  if (loss <= 0 && (analysis.judgement === 'good_move' || analysis.judgement === 'unknown')) return []
  const bestMove = analysis.before.topMoves[0]?.move
  const played = analysis.playedMove?.move ?? analysis.currentMove.gtp
  const lossText = typeof loss === 'number' && Number.isFinite(loss) ? `胜率损失约 ${loss.toFixed(1)}%` : '胜率损失待确认'
  const scoreText = typeof analysis.playedMove?.scoreLoss === 'number'
    ? `，目差约 ${analysis.playedMove.scoreLoss.toFixed(1)}目`
    : ''
  return [{
    moveNumber: analysis.moveNumber,
    color: analysis.currentMove.color,
    played,
    recommended: bestMove,
    severity: analysis.judgement,
    errorType: analysis.judgement === 'good_move' ? '好手' : analysis.judgement === 'unknown' ? '待判断' : 'KataGo 标记的关键手',
    summary: bestMove
      ? `实战 ${played}，KataGo 首选 ${bestMove}；${lossText}${scoreText}。`
      : `实战 ${played}；${lossText}${scoreText}。`
  }]
}

function buildRangeAnalysisKeyMoves(analyses: KataGoMoveAnalysis[] = []): TeacherArtifactKeyMove[] {
  return analyses.flatMap((analysis) => buildAnalysisKeyMoves(analysis))
}

function buildRangeSummaryKeyMoves(request: TeacherRunRequest): TeacherArtifactKeyMove[] {
  return (request.moveRangeSummary?.keyMoves ?? []).flatMap((move) => {
    if (typeof move.moveNumber !== 'number') return []
    const loss = typeof move.winrateLoss === 'number' && Number.isFinite(move.winrateLoss)
      ? `胜率损失约 ${move.winrateLoss.toFixed(1)}%`
      : '胜率损失待确认'
    const score = typeof move.scoreLoss === 'number' && Number.isFinite(move.scoreLoss)
      ? `，目差约 ${move.scoreLoss.toFixed(1)}目`
      : ''
    return [{
      moveNumber: move.moveNumber,
      played: sanitizeText(move.playedMove, 24) || undefined,
      recommended: sanitizeText(move.bestMove, 24) || undefined,
      severity: sanitizeText(move.judgement, 32) || undefined,
      errorType: '区间快扫关键手',
      summary: move.bestMove
        ? `实战 ${move.playedMove || '未知'}，建议 ${move.bestMove}；${loss}${score}。`
        : `实战 ${move.playedMove || '未知'}；${loss}${score}。`
    }]
  })
}

function dedupeKeyMoves(moves: TeacherArtifactKeyMove[]): TeacherArtifactKeyMove[] {
  const seen = new Set<number>()
  const deduped: TeacherArtifactKeyMove[] = []
  for (const move of moves) {
    if (seen.has(move.moveNumber)) continue
    seen.add(move.moveNumber)
    deduped.push(move)
    if (deduped.length >= MAX_KEY_MOVES) break
  }
  return deduped
}

function buildTrainingItems(
  recommendedProblems: RecommendedProblem[] = [],
  structured?: StructuredTeacherResult
): TeacherArtifactTrainingItem[] {
  const problems = recommendedProblems.slice(0, 3).map((problem) => ({
    id: problem.id,
    title: problem.title,
    kind: problem.problemType,
    difficulty: problem.difficulty,
    objective: problem.objective,
    firstHint: problem.firstHint
  }))
  const drills = (structured?.drills ?? []).slice(0, Math.max(0, 3 - problems.length)).map((drill, index) => ({
    id: `drill-${index + 1}`,
    title: `训练 ${index + 1}`,
    kind: 'concept' as const,
    objective: drill
  }))
  return [...problems, ...drills]
}

function sanitizeKind(value: unknown, fallback: TeacherArtifactKind): TeacherArtifactKind {
  return ARTIFACT_KINDS.includes(value as TeacherArtifactKind) ? value as TeacherArtifactKind : fallback
}

function sanitizeSource(value: unknown, fallback: TeacherArtifactSource): TeacherArtifactSource {
  return value === 'agent-json' || value === 'runtime-derived' ? value : fallback
}

function sanitizeCreatedAt(value: unknown, fallback?: string): string {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return value
  if (fallback && !Number.isNaN(Date.parse(fallback))) return fallback
  return new Date().toISOString()
}

function sanitizeBoardSnapshot(value: unknown): TeacherArtifactBoardSnapshot | undefined {
  if (!isRecord(value)) return undefined
  const boardSize = positiveInteger(value.boardSize, 19, 25)
  const snapshot: TeacherArtifactBoardSnapshot = { boardSize }
  const moveNumber = numericValue(value.moveNumber)
  if (typeof moveNumber === 'number') snapshot.moveNumber = Math.max(0, Math.trunc(moveNumber))
  if (value.currentColor === 'B' || value.currentColor === 'W') snapshot.currentColor = value.currentColor
  const judgement = sanitizeText(value.judgement, 24)
  if (['good_move', 'inaccuracy', 'mistake', 'blunder', 'unknown'].includes(judgement)) {
    snapshot.judgement = judgement as KataGoMoveAnalysis['judgement']
  }
  const playedMove = sanitizeText(value.playedMove, 24)
  const bestMove = sanitizeText(value.bestMove, 24)
  if (playedMove) snapshot.playedMove = playedMove
  if (bestMove) snapshot.bestMove = bestMove
  const numericFields = [
    'winrateBefore',
    'winrateAfter',
    'playerWinrateAfter',
    'winrateLoss',
    'scoreLeadBefore',
    'scoreLeadAfter',
    'playerScoreLeadAfter',
    'scoreLoss'
  ] as const
  for (const field of numericFields) {
    const valueNumber = numericValue(value[field])
    if (typeof valueNumber === 'number') snapshot[field] = valueNumber
  }
  return snapshot
}

function sanitizeCandidates(value: unknown): TeacherArtifactCandidate[] {
  const items = arrayValue(value)
  const first = isRecord(items[0]) ? numericValue(items[0].rank) ?? numericValue(items[0].order) : undefined
  const zeroBased = first === 0
  return items.slice(0, MAX_CANDIDATES).flatMap((item, index) => {
    if (!isRecord(item)) return []
    const move = sanitizeText(item.move, 24)
    if (!move) return []
    const rank = normalizeRankValue(item.rank ?? item.order, index, zeroBased)
    return [{
      rank,
      move,
      winrate: normalizeWinrate(numericValue(item.winrate)),
      scoreLead: numericValue(item.scoreLead),
      visits: numericValue(item.visits),
      pv: sanitizeStringArray(item.pv, MAX_PV_MOVES, 24),
      note: sanitizeText(item.note, 80) || (rank === 1 ? 'KataGo 首选' : `第 ${rank} 选`)
    }]
  })
}

function sanitizeVariations(value: unknown): TeacherArtifactVariation[] {
  return arrayValue(value).slice(0, MAX_VARIATIONS).flatMap((item) => {
    if (!isRecord(item)) return []
    const label = sanitizeText(item.label, 80)
    const pv = sanitizeStringArray(item.pv, MAX_PV_MOVES, 24)
    if (!label && pv.length === 0) return []
    const confidence = item.confidence === 'high' || item.confidence === 'medium' || item.confidence === 'low'
      ? item.confidence
      : undefined
    return [{
      label: label || pv[0] || '变化',
      purpose: sanitizeText(item.purpose, 160) || '教学变化',
      pv,
      result: sanitizeText(item.result, 160) || '暂无结论',
      confidence
    }]
  })
}

function sanitizeKeyMoves(value: unknown): TeacherArtifactKeyMove[] {
  return arrayValue(value).slice(0, MAX_KEY_MOVES).flatMap((item) => {
    if (!isRecord(item)) return []
    const moveNumber = numericValue(item.moveNumber)
    if (typeof moveNumber !== 'number') return []
    const color = item.color === 'B' || item.color === 'W' ? item.color : undefined
    return [{
      moveNumber: Math.max(0, Math.trunc(moveNumber)),
      color,
      played: sanitizeText(item.played, 24) || undefined,
      recommended: sanitizeText(item.recommended, 24) || undefined,
      severity: sanitizeText(item.severity, 32) || undefined,
      errorType: sanitizeText(item.errorType, 80) || undefined,
      summary: sanitizeText(item.summary ?? item.explanation ?? item.evidence, MAX_TEXT_CHARS) || '关键问题手'
    }]
  })
}

function sanitizeTrainingItems(value: unknown): TeacherArtifactTrainingItem[] {
  return arrayValue(value).slice(0, MAX_TRAINING_ITEMS).flatMap((item, index) => {
    if (!isRecord(item)) return []
    const title = sanitizeText(item.title, 120)
    const objective = sanitizeText(item.objective, MAX_TEXT_CHARS)
    if (!title && !objective) return []
    const kind = item.kind === 'life_death' || item.kind === 'tesuji' || item.kind === 'concept' ? item.kind : 'concept'
    return [{
      id: sanitizeId(item.id, `training-${index + 1}`),
      title: title || `训练 ${index + 1}`,
      kind,
      difficulty: sanitizeText(item.difficulty, 80) || undefined,
      objective: objective || '围绕本轮关键点做专项练习',
      firstHint: sanitizeText(item.firstHint, 180) || undefined
    }]
  })
}

function sanitizeKnowledgeMatches(value: unknown): KnowledgeMatch[] {
  return arrayValue(value).slice(0, MAX_KNOWLEDGE_MATCHES).flatMap((item, index) => {
    if (!isRecord(item)) return []
    const teachingPayload = isRecord(item.teachingPayload) ? item.teachingPayload : {}
    const title = sanitizeText(item.title, 120)
    const summary = sanitizeText(teachingPayload.summary ?? item.summary ?? item.applicability, MAX_TEXT_CHARS)
    if (!title && !summary) return []
    const matchType = ['joseki', 'life_death', 'tesuji', 'shape', 'concept'].includes(String(item.matchType))
      ? item.matchType as KnowledgeMatch['matchType']
      : 'concept'
    const confidence = ['exact', 'strong', 'partial', 'weak'].includes(String(item.confidence))
      ? item.confidence as KnowledgeMatch['confidence']
      : 'partial'
    const sourceKind = ['original', 'common-pattern', 'licensed-source'].includes(String(teachingPayload.sourceKind))
      ? teachingPayload.sourceKind as KnowledgeMatch['teachingPayload']['sourceKind']
      : 'common-pattern'
    return [{
      id: sanitizeId(item.id, `knowledge-${index + 1}`),
      matchType,
      title: title || `知识点 ${index + 1}`,
      confidence,
      score: numericValue(item.score) ?? 0,
      reason: sanitizeStringArray(item.reason, 4, 160),
      applicability: sanitizeText(item.applicability, MAX_TEXT_CHARS) || summary || '可迁移到本轮局面。',
      teachingPayload: {
        summary: summary || title || '本轮可引用知识点。',
        recognition: sanitizeText(teachingPayload.recognition, MAX_TEXT_CHARS),
        correctIdea: sanitizeText(teachingPayload.correctIdea, MAX_TEXT_CHARS),
        keyVariations: sanitizeStringArray(teachingPayload.keyVariations, 4, 160),
        memoryCue: sanitizeText(teachingPayload.memoryCue, 160),
        commonMistakes: sanitizeStringArray(teachingPayload.commonMistakes, 4, 160),
        drills: sanitizeStringArray(teachingPayload.drills, 4, 160),
        boundary: sanitizeText(teachingPayload.boundary, MAX_TEXT_CHARS),
        sourceKind
      },
      relatedProblems: []
    }]
  })
}

function hasRemoteAssetReference(html: string): boolean {
  return /<(?:img|script|iframe|link|source|video|audio|object|embed)\b[^>]*(?:src|href|data|poster)\s*=\s*["']?\s*(?:https?:|\/\/|file:|data:)/i.test(html) ||
    /(?:url\(|@import\s+)(?:\s*["']?)?(?:https?:|\/\/|file:|data:image)/i.test(html)
}

function hasLocalPathOrSecret(value: string): boolean {
  return /file:\/\//i.test(value) ||
    /(^|[\s"'(])(?:\/Users|\/home|\/var|\/private|\/tmp|\/Volumes)\/[^\s"'<>)]*/.test(value) ||
    /\b[A-Za-z]:\\[^\s"'<>)]*/.test(value) ||
    /\b(sk-[A-Za-z0-9_-]{12,}|github_pat_[A-Za-z0-9_]{12,}|ghp_[A-Za-z0-9_]{12,}|xox[baprs]-[A-Za-z0-9-]{12,}|AKIA[A-Z0-9]{12,})\b/.test(value) ||
    /["']?(?:api[_-]?key|apikey|llmApiKey|ttsCustomApiKey|ttsVolcengineApiKey|ttsVolcengineAccessToken|proxyApiKey|token|password|secret|authorization)["']?\s*[=:]\s*["']?[^\s"',}`<>]+/i.test(value)
}

function sanitizeSandboxHtml(value: unknown, allowSandboxScripts: boolean): { sandboxHtml?: TeacherArtifactSandboxHtml; warnings: string[] } {
  const warnings: string[] = []
  if (!value) return { warnings }
  const input = typeof value === 'string' ? { html: value } : isRecord(value) ? value : undefined
  if (!input) return { warnings: ['sandboxHtml ignored because it was not an object or string.'] }

  const requestedPolicy = sanitizeText(input.scriptPolicy, 40)
  const scriptPolicy: TeacherArtifactSandboxScriptPolicy =
    allowSandboxScripts && requestedPolicy === 'sandbox-iframe-only' ? 'sandbox-iframe-only' : 'disabled'
  let html = redactSensitiveText(String(input.html ?? '')).slice(0, MAX_SANDBOX_HTML_CHARS)

  if (!html.trim()) return { warnings }
  if (scriptPolicy === 'disabled' && /<script\b/i.test(html)) {
    warnings.push('sandboxHtml scripts were removed because scriptPolicy is disabled.')
    html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '')
  }
  if (scriptPolicy === 'disabled' && /\son[a-z]+\s*=/i.test(html)) {
    warnings.push('sandboxHtml inline event handlers were removed because scriptPolicy is disabled.')
    html = html.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  }
  if (scriptPolicy === 'disabled' && /javascript:/i.test(html)) {
    warnings.push('sandboxHtml javascript: URLs were neutralized because scriptPolicy is disabled.')
    html = html.replace(/javascript:/gi, '')
  }
  if (hasRemoteAssetReference(html)) {
    warnings.push('sandboxHtml remote, local or data asset tags were removed.')
    html = html
      .replace(/<(?:img|script|iframe|link|source|video|audio|object|embed)\b[^>]*(?:src|href|data|poster)\s*=\s*["']?\s*(?:https?:|\/\/|file:|data:)[\s\S]*?>/gi, '')
      .replace(/url\(\s*["']?(?:https?:|\/\/|file:|data:image)[^)]+\)/gi, 'none')
      .replace(/@import\s+[^;]+;/gi, '')
  }
  if (/data:image\/[a-z0-9.+-]+;base64/i.test(html) || hasLocalPathOrSecret(html)) {
    warnings.push('sandboxHtml sensitive inline data was redacted.')
    html = redactSensitiveText(html)
  }
  const sandboxErrors = validateSandboxHtmlFragment(html, scriptPolicy)
  if (sandboxErrors.length > 0) {
    return { warnings: [...warnings, ...sandboxErrors.map((error) => `sandboxHtml ignored: ${error}`)] }
  }
  return {
    sandboxHtml: {
      html,
      enabled: booleanValue(input.enabled, false) && html.trim().length > 0,
      scriptPolicy,
      iframeSandbox: scriptPolicy === 'sandbox-iframe-only' ? 'allow-scripts' : '',
      warnings
    },
    warnings
  }
}

function validateSandboxHtmlFragment(html: string, scriptPolicy: TeacherArtifactSandboxScriptPolicy): string[] {
  const errors: string[] = []
  if (scriptPolicy === 'disabled' && /<script\b/i.test(html)) errors.push('scripts are disabled')
  if (scriptPolicy === 'disabled' && /\son[a-z]+\s*=/i.test(html)) errors.push('inline event handlers are disabled')
  if (scriptPolicy === 'disabled' && /javascript:/i.test(html)) errors.push('javascript URLs are disabled')
  if (hasRemoteAssetReference(html)) errors.push('remote, local and data assets are not allowed')
  if (/data:image\/[a-z0-9.+-]+;base64/i.test(html)) errors.push('base64 images are not allowed')
  if (hasLocalPathOrSecret(html)) errors.push('local paths and API keys are not allowed')
  return errors
}

export function validateStaticTeacherArtifactHtml(html: string): StaticTeacherArtifactHtmlValidationResult {
  const errors: string[] = []
  if (/<script\b/i.test(html)) errors.push('static export must not include script tags')
  if (/<base\b/i.test(html)) errors.push('static export must not include base tags')
  if (/<[^>]+\son[a-z]+\s*=/i.test(html)) errors.push('static export must not include inline event handlers')
  if (/<[^>]+(?:href|src)\s*=\s*["']?\s*javascript:/i.test(html)) errors.push('static export must not include javascript URLs')
  if (hasRemoteAssetReference(html)) errors.push('static export must not include remote, local or data assets')
  if (/data:image\/[a-z0-9.+-]+;base64/i.test(html)) errors.push('static export must not include base64 images')
  if (hasLocalPathOrSecret(html)) errors.push('static export must not include local paths or API keys')
  return { ok: errors.length === 0, errors }
}

function hasVisibleEvidence(artifact: TeacherArtifactDraft): boolean {
  return Boolean(artifact.boardSnapshot) ||
    artifact.candidates.length > 0 ||
    artifact.variations.length > 0 ||
    artifact.keyMoves.length > 0 ||
    artifact.knowledgeMatches.length > 0 ||
    artifact.trainingItems.length > 0
}

export function validateTeachingArtifact(input: unknown, options: CreateTeachingArtifactOptions = {}): TeachingArtifactValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const payload = isRecord(input) && isRecord(input.artifact) ? input.artifact : input
  if (!isRecord(payload)) {
    return {
      ok: false,
      errors: ['TeachingArtifact input must be a JSON object.'],
      warnings
    }
  }

  const title = sanitizeText(payload.title, MAX_TITLE_CHARS) || sanitizeText(options.title, MAX_TITLE_CHARS) || 'GoAgent Teaching Artifact'
  const kind = sanitizeKind(payload.kind, options.kind ?? 'freeform')
  const source = sanitizeSource(payload.source, options.source ?? 'agent-json')
  const boardSnapshot = sanitizeBoardSnapshot(payload.boardSnapshot)
  const candidates = sanitizeCandidates(payload.candidates)
  const variations = sanitizeVariations(payload.variations)
  const keyMoves = sanitizeKeyMoves(payload.keyMoves)
  const knowledgeMatches = sanitizeKnowledgeMatches(payload.knowledgeMatches)
  const trainingItems = sanitizeTrainingItems(payload.trainingItems)
  const evidenceInput = isRecord(payload.evidence) ? payload.evidence : {}
  const sandbox = sanitizeSandboxHtml(payload.sandboxHtml, options.allowSandboxScripts === true)
  warnings.push(...sandbox.warnings)

  const draft: TeacherArtifactDraft = {
    id: sanitizeId(payload.id, options.id ?? 'teaching-artifact'),
    kind,
    source,
    title,
    createdAt: sanitizeCreatedAt(payload.createdAt, options.createdAt),
    summary: sanitizeText(payload.summary, MAX_SUMMARY_CHARS) || title,
    boardSnapshot,
    candidates,
    variations,
    keyMoves,
    knowledgeMatches,
    trainingItems,
    evidence: {
      katagoReady: booleanValue(evidenceInput.katagoReady, options.evidence?.katagoReady ?? Boolean(boardSnapshot || candidates.length)),
      boardImageReady: booleanValue(evidenceInput.boardImageReady, options.evidence?.boardImageReady ?? false),
      knowledgeMatchCount: nonNegativeInteger(
        evidenceInput.knowledgeMatchCount ?? options.evidence?.knowledgeMatchCount,
        knowledgeMatches.length,
        MAX_KNOWLEDGE_MATCHES
      ),
      recommendedProblemCount: nonNegativeInteger(
        evidenceInput.recommendedProblemCount ?? options.evidence?.recommendedProblemCount,
        trainingItems.length,
        MAX_TRAINING_ITEMS
      ),
      sourceNote: sanitizeText(
        evidenceInput.sourceNote ?? options.evidence?.sourceNote,
        360
      ) || 'Artifact 由 GoAgent 运行时验证、裁剪并生成安全静态导出。'
    },
    sandboxHtml: sandbox.sandboxHtml
  }

  if (!hasVisibleEvidence(draft)) {
    errors.push('TeachingArtifact requires at least one evidence-backed section.')
  }

  const exportHtml = renderTeacherArtifactHtml(draft)
  const htmlValidation = validateStaticTeacherArtifactHtml(exportHtml)
  if (!htmlValidation.ok) {
    errors.push(...htmlValidation.errors)
  }

  if (errors.length > 0) {
    return { ok: false, errors, warnings }
  }

  return {
    ok: true,
    artifact: {
      ...draft,
      exportHtml,
      exportFileName: options.exportFileName || `${sanitizeFileName(title)}.html`
    },
    errors,
    warnings
  }
}

export function createTeachingArtifact(input: unknown, options: CreateTeachingArtifactOptions = {}): TeacherArtifact | undefined {
  return validateTeachingArtifact(input, options).artifact
}

export const validateTeacherArtifact = validateTeachingArtifact
export const createTeacherArtifact = createTeachingArtifact

function escapeHtml(value: unknown): string {
  return redactSensitiveText(String(value ?? ''))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderCandidateRows(candidates: TeacherArtifactCandidate[]): string {
  if (candidates.length === 0) {
    return '<p class="muted">本轮没有可展示候选点。</p>'
  }
  return `
    <table>
      <thead><tr><th>顺位</th><th>点位</th><th>落子方胜率</th><th>落子方目差</th><th>搜索</th><th>PV</th></tr></thead>
      <tbody>
        ${candidates.map((candidate) => `
          <tr>
            <td>${escapeHtml(candidate.note ?? `第 ${candidate.rank} 选`)}</td>
            <td><strong>${escapeHtml(candidate.move)}</strong></td>
            <td>${escapeHtml(formatWinrate(candidate.winrate))}</td>
            <td>${escapeHtml(formatScore(candidate.scoreLead))}</td>
            <td>${escapeHtml(candidate.visits ?? '暂无')}</td>
            <td>${escapeHtml(candidate.pv.slice(0, 8).join(' → '))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function renderKnowledge(matches: KnowledgeMatch[]): string {
  if (matches.length === 0) return '<p class="muted">本轮没有强制引用知识条目。</p>'
  return matches.slice(0, 4).map((match) => `
    <article class="mini-card">
      <span>${escapeHtml(match.matchType)} · ${escapeHtml(match.confidence)}</span>
      <h3>${escapeHtml(match.title)}</h3>
      <p>${escapeHtml(match.teachingPayload.summary || match.applicability)}</p>
    </article>
  `).join('')
}

function renderTraining(items: TeacherArtifactTrainingItem[]): string {
  if (items.length === 0) return '<p class="muted">老师本轮没有追加专项题。</p>'
  return items.map((item) => `
    <article class="mini-card">
      <span>${escapeHtml(item.kind)}${item.difficulty ? ` · ${escapeHtml(item.difficulty)}` : ''}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.objective)}</p>
      ${item.firstHint ? `<small>提示：${escapeHtml(item.firstHint)}</small>` : ''}
    </article>
  `).join('')
}

export function renderTeacherArtifactHtml(artifact: TeacherArtifactDraft): string {
  const board = artifact.boardSnapshot
  const keyMoves = artifact.keyMoves.length > 0
    ? `<ol>${artifact.keyMoves.map((move) => `<li>第 ${escapeHtml(move.moveNumber)} 手 ${escapeHtml(move.played ?? '')}：${escapeHtml(move.summary)}</li>`).join('')}</ol>`
    : '<p class="muted">本轮没有单独列出问题手。</p>'
  const variations = artifact.variations.length > 0
    ? artifact.variations.map((variation) => `
      <article class="variation">
        <h3>${escapeHtml(variation.label)} · ${escapeHtml(variation.purpose)}</h3>
        <p>${escapeHtml(variation.pv.join(' → '))}</p>
        <small>${escapeHtml(variation.result)}</small>
      </article>
    `).join('')
    : '<p class="muted">暂无可导出的变化图文本。</p>'

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(artifact.title)} · GoAgent</title>
  <style>
    :root { color-scheme: light; font-family: Inter, "SF Pro Display", "PingFang SC", system-ui, sans-serif; color: #1b2624; background: #f6f0e5; }
    body { margin: 0; background: radial-gradient(circle at 20% 0%, #fff7e8, #f2eadc 44%, #e7ddca); }
    main { width: min(1040px, calc(100vw - 40px)); margin: 0 auto; padding: 44px 0 56px; }
    header { padding: 26px 28px; border: 1px solid rgba(60, 47, 26, .12); border-radius: 24px; background: rgba(255,255,255,.62); box-shadow: 0 24px 80px rgba(68, 51, 25, .14); }
    .eyebrow, .pill, .mini-card span { color: #25736b; font-size: 12px; font-weight: 760; letter-spacing: .04em; text-transform: uppercase; }
    h1 { margin: 8px 0 10px; font-size: clamp(32px, 5vw, 56px); line-height: 1; letter-spacing: -0.02em; }
    p { color: #4f5b56; line-height: 1.72; }
    .grid { display: grid; gap: 14px; grid-template-columns: repeat(4, 1fr); margin: 18px 0 0; }
    .pill { padding: 11px 12px; border: 1px solid rgba(44, 104, 96, .14); border-radius: 16px; background: rgba(255,255,255,.56); text-transform: none; }
    section { margin-top: 18px; padding: 22px 24px; border: 1px solid rgba(60, 47, 26, .11); border-radius: 22px; background: rgba(255,255,255,.54); box-shadow: 0 18px 52px rgba(68, 51, 25, .08); }
    h2 { margin: 0 0 12px; font-size: 19px; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 16px; background: rgba(255,255,255,.58); }
    th, td { padding: 11px 12px; border-bottom: 1px solid rgba(60, 47, 26, .08); text-align: left; font-size: 13px; }
    th { color: #65726b; font-size: 12px; }
    ol { margin: 0; padding-left: 20px; color: #3b4742; line-height: 1.74; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .mini-card, .variation { padding: 15px; border: 1px solid rgba(44, 104, 96, .12); border-radius: 18px; background: rgba(255,255,255,.56); }
    .mini-card h3, .variation h3 { margin: 5px 0 7px; font-size: 15px; }
    .mini-card p, .variation p { margin: 0; font-size: 13px; }
    .mini-card small, .variation small { display: block; margin-top: 8px; color: #78837e; line-height: 1.5; }
    .muted { color: #7a857f; }
    footer { margin-top: 22px; color: #7a857f; font-size: 12px; text-align: center; }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr 1fr; } main { width: min(100vw - 24px, 1040px); padding-top: 18px; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="eyebrow">GoAgent Teaching Artifact</div>
      <h1>${escapeHtml(artifact.title)}</h1>
      <p>${escapeHtml(artifact.summary)}</p>
      <div class="grid">
        <div class="pill">手数：${escapeHtml(board?.moveNumber ?? '暂无')}</div>
        <div class="pill">实战：${escapeHtml(board?.playedMove ?? '暂无')}</div>
        <div class="pill">首选：${escapeHtml(board?.bestMove ?? '暂无')}</div>
        <div class="pill">胜率损失：${escapeHtml(formatWinrate(board?.winrateLoss))}</div>
      </div>
    </header>
    <section><h2>KataGo 候选点</h2>${renderCandidateRows(artifact.candidates)}</section>
    <section><h2>关键变化</h2>${variations}</section>
    <section><h2>问题手</h2>${keyMoves}</section>
    <section><h2>知识匹配</h2><div class="cards">${renderKnowledge(artifact.knowledgeMatches)}</div></section>
    <section><h2>训练建议</h2><div class="cards">${renderTraining(artifact.trainingItems)}</div></section>
    <footer>由 GoAgent 生成。KataGo 是事实依据，知识库用于教学迁移。</footer>
  </main>
</body>
</html>`
}

export function buildTeacherArtifact(input: BuildTeacherArtifactInput): TeacherArtifact | undefined {
  const candidates = buildCandidates(input.analysis)
  const analysisKeyMoves = buildAnalysisKeyMoves(input.analysis)
  const trustedKeyMoves = dedupeKeyMoves([
    ...analysisKeyMoves,
    ...buildRangeAnalysisKeyMoves(input.rangeAnalyses),
    ...buildRangeSummaryKeyMoves(input.request)
  ])
  const keyMoves = trustedKeyMoves.length > 0 ? trustedKeyMoves : buildKeyMoves(input.structured)
  const knowledgeMatches = (input.knowledgeMatches ?? input.structured?.knowledgeMatches ?? []).slice(0, 4)
  const trainingItems = buildTrainingItems(input.recommendedProblems ?? input.structured?.recommendedProblems, input.structured)
  const hasEvidence = Boolean(input.analysis) || keyMoves.length > 0 || knowledgeMatches.length > 0 || trainingItems.length > 0
  if (!hasEvidence) return undefined

  const boardSnapshot = input.analysis ? {
    boardSize: input.analysis.boardSize,
    moveNumber: input.analysis.moveNumber,
    currentColor: input.analysis.currentMove?.color,
    playedMove: input.analysis.playedMove?.move ?? input.analysis.currentMove?.gtp,
    bestMove: input.analysis.before.topMoves[0]?.move,
    judgement: input.analysis.judgement,
    winrateBefore: normalizeWinrate(input.analysis.before.winrate),
    winrateAfter: normalizeWinrate(input.analysis.after.winrate),
    playerWinrateAfter: normalizeWinrate(input.analysis.playedMove?.playerWinrate ?? input.analysis.playedMove?.winrate),
    winrateLoss: normalizeWinrate(input.analysis.playedMove?.winrateLoss),
    scoreLeadBefore: finiteNumber(input.analysis.before.scoreLead),
    scoreLeadAfter: finiteNumber(input.analysis.after.scoreLead),
    playerScoreLeadAfter: finiteNumber(input.analysis.playedMove?.playerScoreLead ?? input.analysis.playedMove?.scoreLead),
    scoreLoss: finiteNumber(input.analysis.playedMove?.scoreLoss)
  } : undefined
  const summary = input.structured?.headline || input.structured?.summary || firstParagraph(input.markdown) || input.title
  const draft: TeacherArtifactDraft = {
    id: `${input.id}-artifact`,
    kind: artifactKind(input.intent),
    source: 'runtime-derived',
    title: input.title,
    createdAt: new Date().toISOString(),
    summary,
    boardSnapshot,
    candidates,
    variations: buildVariations(candidates, input.teachingPacing),
    keyMoves,
    knowledgeMatches,
    trainingItems,
    evidence: {
      katagoReady: Boolean(input.analysis),
      boardImageReady: Boolean(input.visionEvidence?.images.some((image) => image.valid)),
      knowledgeMatchCount: knowledgeMatches.length,
      recommendedProblemCount: trainingItems.length,
      sourceNote: 'Artifact 只使用 GoAgent 已执行工具返回的 KataGo、棋盘图元数据、知识匹配和老师文本摘要。'
    }
  }

  return createTeachingArtifact(draft, {
    id: draft.id,
    title: draft.title,
    kind: draft.kind,
    source: 'runtime-derived',
    createdAt: draft.createdAt,
    evidence: draft.evidence,
    exportFileName: `${sanitizeFileName(input.title)}.html`
  })
}
