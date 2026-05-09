import { useState, type ReactElement } from 'react'
import type { TeacherArtifact } from '@main/lib/types'
import './teacher-pro.css'

interface TeacherArtifactCardProps {
  artifact?: TeacherArtifact
  compact?: boolean
  onJumpToMove?: (moveNumber: number) => void
  onAnalyzeMove?: (moveNumber: number) => void
  onFlashPoint?: (point: string) => void
}

interface FactCell {
  label: string
  value: string
  point?: string
  tone?: 'loss'
}

function formatWinrate(value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '暂无'
  return `${value.toFixed(1)}%`
}

function formatWinrateMaybe(value: number | undefined): string | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return `${value.toFixed(1)}%`
}

function formatScore(value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '暂无'
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}目`
}

function formatScoreMaybe(value: number | undefined): string | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(1)}目`
}

function colorLabel(value: unknown): string {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'w' || normalized === 'white' || normalized === '白') return '白'
  if (normalized === 'b' || normalized === 'black' || normalized === '黑') return '黑'
  return '落子方'
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return '时间未知'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}

function formatKind(kind: TeacherArtifact['kind']): string {
  const byKind: Record<TeacherArtifact['kind'], string> = {
    'current-move-review': '当前手复盘',
    'move-range-review': '片段复盘',
    'game-review': '整盘复盘',
    'training-plan': '训练计划',
    freeform: '自由讲解'
  }
  return byKind[kind]
}

function cleanInlineText(value: string | undefined): string {
  return String(value ?? '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
    .trim()
}

function judgementLabel(value: string | undefined): string {
  if (value === 'blunder') return '重大问题'
  if (value === 'mistake') return '问题手'
  if (value === 'inaccuracy') return '缓手'
  if (value === 'good_move') return '好手'
  return ''
}

function judgementTone(value: string | undefined): string {
  if (value === 'blunder' || value === 'mistake') return 'bad'
  if (value === 'inaccuracy') return 'warn'
  if (value === 'good_move') return 'good'
  return 'neutral'
}

function confidenceLabel(value: string | undefined): string {
  if (value === 'high') return '高置信'
  if (value === 'medium') return '中置信'
  if (value === 'low') return '低置信'
  return ''
}

function matchTypeLabel(value: string | undefined): string {
  if (value === 'joseki') return '定式'
  if (value === 'life_death') return '死活'
  if (value === 'tesuji') return '手筋'
  if (value === 'shape') return '棋形'
  if (value === 'concept') return '思路'
  return '知识'
}

function matchConfidenceLabel(value: string | undefined): string {
  if (value === 'exact') return '高度匹配'
  if (value === 'strong') return '很相关'
  if (value === 'partial') return '相似参考'
  if (value === 'weak') return '补充参考'
  return ''
}

function trainingKindLabel(value: string | undefined): string {
  if (value === 'life_death') return '死活'
  if (value === 'tesuji') return '手筋'
  if (value === 'concept') return '思路'
  return '练习'
}

function difficultyLabel(value: string | undefined): string {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return ''
  if (['basic', 'beginner', 'easy', '入门', '简单'].includes(normalized)) return '基础'
  if (['intermediate', 'medium', 'normal', '中级', '普通'].includes(normalized)) return '进阶'
  if (['advanced', 'hard', 'difficult', '高级', '困难'].includes(normalized)) return '挑战'
  return value ?? ''
}

function compactMeta(parts: Array<string | undefined>): string {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join(' · ')
}

function presentString(value: string | undefined): value is string {
  return Boolean(value && value.trim())
}

function buildArtifactCopyText(artifact: TeacherArtifact): string {
  const board = artifact.boardSnapshot
  const lines = [
    `${formatKind(artifact.kind)}：${artifact.title}`,
    cleanInlineText(artifact.summary)
  ]
  if (board) {
    const lossText = compactMeta([formatWinrateMaybe(board.winrateLoss), formatScoreMaybe(board.scoreLoss)])
    const boardLines = [
      board.moveNumber ? `手数：第 ${board.moveNumber} 手` : undefined,
      board.playedMove || board.bestMove ? `实战：${board.playedMove ?? '无'}；推荐：${board.bestMove ?? '无'}` : undefined,
      judgementLabel(board.judgement) ? `判断：${judgementLabel(board.judgement)}` : undefined,
      lossText ? `损失：${lossText}` : undefined
    ].filter(presentString)
    if (boardLines.length > 0) lines.push('', ...boardLines)
  }
  const candidates = artifact.candidates.slice(0, 3)
  if (candidates.length > 0) {
    lines.push('', 'KataGo 证据：')
    for (const candidate of candidates) {
      const pv = candidate.pv.length > 0 ? `；PV ${candidate.pv.slice(0, 6).join(' -> ')}` : ''
      lines.push(`- ${candidate.note ?? `第 ${candidate.rank} 选`} ${candidate.move}：${formatWinrate(candidate.winrate)}，${formatScore(candidate.scoreLead)}，${candidate.visits ?? 0} 搜索${pv}`)
    }
  }
  const keyMoves = artifact.keyMoves.slice(0, 3)
  if (keyMoves.length > 0) {
    lines.push('', '关键手：')
    for (const move of keyMoves) {
      lines.push(`- 第 ${move.moveNumber} 手${move.played ? ` ${move.played}` : ''}：${cleanInlineText(move.summary)}`)
    }
  }
  return lines.filter(Boolean).join('\n')
}

async function copyArtifactText(artifact: TeacherArtifact): Promise<void> {
  const text = buildArtifactCopyText(artifact)
  const desktopClipboard = window.goagent?.writeClipboardText
  if (typeof desktopClipboard === 'function') {
    await desktopClipboard(text)
    return
  }
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!copied) throw new Error('copy failed')
}

export function TeacherArtifactCard({
  artifact,
  compact = false,
  onJumpToMove,
  onAnalyzeMove,
  onFlashPoint
}: TeacherArtifactCardProps): ReactElement | null {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle')
  if (!artifact) return null
  const currentArtifact = artifact
  const board = artifact.boardSnapshot
  const topCandidates = artifact.candidates.slice(0, 2)
  const topVariation = artifact.variations[0]
  const topKeyMoves = artifact.keyMoves.slice(0, compact ? 2 : 3)
  const knowledge = artifact.knowledgeMatches.slice(0, 2)
  const trainingItems = artifact.trainingItems.slice(0, compact ? 1 : 2)
  const candidatePerspective = `${colorLabel(board?.currentColor)}胜率`
  const playedMove = board?.playedMove
  const bestMove = board?.bestMove
  const judgment = judgementLabel(board?.judgement)
  const tone = judgementTone(board?.judgement)
  const lossFactText = compactMeta([formatWinrateMaybe(board?.winrateLoss), formatScoreMaybe(board?.scoreLoss)])
  const factCells: FactCell[] = []
  if (board?.moveNumber) factCells.push({ label: '手数', value: `第 ${board.moveNumber} 手` })
  if (playedMove) factCells.push({ label: '实战', value: playedMove, point: playedMove })
  if (bestMove) factCells.push({ label: '推荐', value: bestMove, point: bestMove })
  if (lossFactText) factCells.push({ label: '损失', value: lossFactText, tone: 'loss' })
  const evidenceChips = [
    artifact.evidence.katagoReady ? 'KataGo 已核对' : undefined,
    artifact.evidence.boardImageReady ? '棋盘图已读取' : undefined,
    artifact.evidence.knowledgeMatchCount > 0 ? '已参考知识库' : undefined,
    artifact.evidence.recommendedProblemCount > 0 ? '已给练习建议' : undefined
  ].filter((chip): chip is string => Boolean(chip))
  const exportStatus = copyState === 'copied'
    ? '复制完成：讲解要点已写入剪贴板。'
    : copyState === 'manual'
      ? '当前环境不能直接写入剪贴板，已展开可手动复制的讲解文本。'
      : '复制的是当前讲解要点，适合发给学生或继续追问。'

  async function handleCopy(): Promise<void> {
    try {
      await copyArtifactText(currentArtifact)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1400)
    } catch {
      setCopyState('manual')
      window.setTimeout(() => {
        document.querySelector<HTMLTextAreaElement>('.teacher-artifact-card__manual-copy textarea')?.select()
      }, 50)
    }
  }

  return (
    <section className={`teacher-artifact-card${compact ? ' teacher-artifact-card--compact' : ''}`} aria-label="老师讲解卡片">
      <header className="teacher-artifact-card__head">
        <div>
          <span>老师批注 · {formatKind(artifact.kind)}</span>
          <strong>{artifact.title}</strong>
          <small>{formatDate(artifact.createdAt)} · {artifact.evidence.boardImageReady ? '已读棋盘图' : '未读棋盘图'}</small>
        </div>
        {judgment ? <span className={`teacher-artifact-card__badge is-${tone}`}>{judgment}</span> : null}
        <div className="teacher-artifact-card__actions" aria-label="复盘卡片操作">
          <button type="button" onClick={() => void handleCopy()}>
            {copyState === 'copied' ? '已复制' : copyState === 'manual' ? '手动复制' : '复制讲解'}
          </button>
          <small role="status" aria-live="polite">{exportStatus}</small>
        </div>
      </header>

      {copyState === 'manual' ? (
        <div className="teacher-artifact-card__manual-copy">
          <label>
            <span>讲解文本</span>
            <textarea readOnly value={buildArtifactCopyText(artifact)} onFocus={(event) => event.currentTarget.select()} />
          </label>
        </div>
      ) : null}

      <p className="teacher-artifact-card__summary">{cleanInlineText(artifact.summary)}</p>

      {factCells.length > 0 ? (
        <div className={`teacher-artifact-card__facts is-count-${Math.min(factCells.length, 4)}`} aria-label="核心结论">
          {factCells.map((cell) => (
            cell.point ? (
              <button key={cell.label} type="button" onClick={() => onFlashPoint?.(cell.point ?? '')}>
                <span>{cell.label}</span>
                <strong>{cell.value}</strong>
              </button>
            ) : (
              <div key={cell.label} className={cell.tone === 'loss' ? 'is-loss' : undefined}>
                <span>{cell.label}</span>
                <strong>{cell.value}</strong>
              </div>
            )
          ))}
        </div>
      ) : null}

      {topCandidates.length > 0 ? (
        <section className="teacher-artifact-section teacher-artifact-candidates" aria-label="KataGo候选点">
          <div className="teacher-artifact-section__head">
            <h4>关键证据</h4>
            <small>KataGo 一选与实战对照</small>
          </div>
          <div className="teacher-artifact-candidates__list">
            {topCandidates.map((candidate) => (
              <button
                key={`${candidate.rank}-${candidate.move}`}
                type="button"
                className={candidate.rank === 1 ? 'is-primary' : ''}
                onClick={() => onFlashPoint?.(candidate.move)}
              >
                <span>{candidate.note ?? `第 ${candidate.rank} 选`}</span>
                <strong>{candidate.move}</strong>
                <small>{compactMeta([
                  formatWinrateMaybe(candidate.winrate) ? `${candidatePerspective} ${formatWinrateMaybe(candidate.winrate)}` : undefined,
                  formatScoreMaybe(candidate.scoreLead),
                  typeof candidate.visits === 'number' ? `${candidate.visits} 搜索` : undefined
                ])}</small>
                {candidate.pv.length > 0 ? <em>{candidate.pv.slice(0, 5).join(' → ')}</em> : null}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {topVariation ? (
        <section className="teacher-artifact-section teacher-artifact-variation" aria-label="关键变化">
          <div className="teacher-artifact-section__head">
            <h4>这手为什么这样下</h4>
            {confidenceLabel(topVariation.confidence) ? <small>{confidenceLabel(topVariation.confidence)}</small> : null}
          </div>
          <article>
            <strong>{topVariation.label}</strong>
            <p>{cleanInlineText(topVariation.purpose)}</p>
            {topVariation.pv.length > 0 ? <small>{topVariation.pv.slice(0, 8).join(' → ')}</small> : null}
            <em>{cleanInlineText(topVariation.result)}</em>
          </article>
        </section>
      ) : null}

      {topKeyMoves.length > 0 ? (
        <section className="teacher-artifact-section teacher-artifact-keymoves" aria-label="关键问题手">
          <div className="teacher-artifact-section__head">
            <h4>关键问题手</h4>
            <small>{topKeyMoves.length} 个重点</small>
          </div>
          <div className="teacher-artifact-keymoves__list">
            {topKeyMoves.map((move) => (
              <article key={`${move.moveNumber}-${move.played ?? ''}`}>
                <div className="teacher-artifact-keymoves__top">
                  <button type="button" onClick={() => onJumpToMove?.(move.moveNumber)}>
                    第 {move.moveNumber} 手{move.played ? ` ${move.played}` : ''}
                  </button>
                  {move.errorType || judgementLabel(move.severity) ? <span>{move.errorType || judgementLabel(move.severity)}</span> : null}
                  {move.recommended ? <strong>建议 {move.recommended}</strong> : null}
                </div>
                <p>{cleanInlineText(move.summary)}</p>
                {onAnalyzeMove ? (
                  <button type="button" className="teacher-artifact-keymoves__analyze" onClick={() => onAnalyzeMove(move.moveNumber)}>
                    深挖这一手
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {knowledge.length > 0 || trainingItems.length > 0 ? (
        <div className="teacher-artifact-grid" aria-label="知识与练习">
          {knowledge.length > 0 ? (
            <section className="teacher-artifact-grid__panel">
              <h4>相关棋形</h4>
              {knowledge.map((match) => (
                <article key={match.id}>
                  <div>
                    <b>{match.title}</b>
                    <span>{compactMeta([matchTypeLabel(match.matchType), matchConfidenceLabel(match.confidence)])}</span>
                  </div>
                  <p>{cleanInlineText(match.teachingPayload.summary || match.applicability)}</p>
                </article>
              ))}
            </section>
          ) : null}
          {trainingItems.length > 0 ? (
            <section className="teacher-artifact-grid__panel">
              <h4>下一次怎么练</h4>
              {trainingItems.map((item) => (
                <article key={item.id}>
                  <div>
                    <b>{item.title}</b>
                    <span>{compactMeta([trainingKindLabel(item.kind), difficultyLabel(item.difficulty)])}</span>
                  </div>
                  <p>{cleanInlineText(item.objective)}</p>
                  {item.firstHint ? <small>提示：{cleanInlineText(item.firstHint)}</small> : null}
                </article>
              ))}
            </section>
          ) : null}
        </div>
      ) : null}

      {evidenceChips.length > 0 ? (
        <footer className="teacher-artifact-evidence" aria-label="证据摘要">
          {evidenceChips.map((chip) => <span key={chip}>{chip}</span>)}
        </footer>
      ) : null}

    </section>
  )
}
