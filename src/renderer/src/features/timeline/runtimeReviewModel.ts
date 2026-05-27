import type { KataGoMoveAnalysis, KnowledgeMatch } from '@main/lib/types'
import { buildBoardPvPreviewState } from '../board/pvInteraction'
import { buildVariationPlaybackState, type VariationPlaybackState } from '../board/variationPlayback'
import { buildTeacherEvidencePanel, type TeacherEvidencePanelSection } from '../teacher/evidencePanelModel'
import { buildTimelineReviewItems, describeTimelineReviewItem, type TimelineReviewItem } from './reviewNavigator'
import {
  activePvPreview,
  createReviewNavigatorSession,
  selectReviewMove,
  setHoveredPv,
  toggleLockedPv,
  type ReviewNavigatorSession
} from './reviewSession'

export interface RuntimeReviewModel {
  session: ReviewNavigatorSession
  timelineItems: TimelineReviewItem[]
  activeAnalysis?: KataGoMoveAnalysis
  activeDescription: string
  evidencePanel: TeacherEvidencePanelSection[]
  variationPlayback: VariationPlaybackState | null
  runtimeStatus: {
    cacheStatus?: string
    readinessLevel?: string
    shouldDeepen: boolean
    safeWording?: string
  }
}

function analysisByMove(evaluations: Record<number, KataGoMoveAnalysis>, moveNumber?: number): KataGoMoveAnalysis | undefined {
  return typeof moveNumber === 'number' ? evaluations[moveNumber] : undefined
}

function defaultActiveMove(items: TimelineReviewItem[]): number | undefined {
  return items[0]?.moveNumber
}

export function buildRuntimeReviewModel(input: {
  evaluations: Record<number, KataGoMoveAnalysis>
  session?: ReviewNavigatorSession
  activeMoveNumber?: number
  knowledgeMatchesByMove?: Record<number, KnowledgeMatch[]>
  includeGoodMoves?: boolean
}): RuntimeReviewModel {
  const timelineItems = buildTimelineReviewItems(input.evaluations, { includeGoodMoves: input.includeGoodMoves, limit: 16 })
  const baseSession = input.session ?? createReviewNavigatorSession(timelineItems)
  const activeMoveNumber = input.activeMoveNumber ?? baseSession.activeMoveNumber ?? defaultActiveMove(timelineItems)
  const session = activeMoveNumber ? selectReviewMove({ ...baseSession, items: timelineItems }, activeMoveNumber) : { ...baseSession, items: timelineItems }
  const activeAnalysis = analysisByMove(input.evaluations, session.activeMoveNumber)
  const evidencePanel = activeAnalysis
    ? buildTeacherEvidencePanel({ analysis: activeAnalysis, knowledgeMatches: input.knowledgeMatchesByMove?.[activeAnalysis.moveNumber] ?? [] })
    : []
  const pvPreview = activeAnalysis ? buildBoardPvPreviewState({ analysis: activeAnalysis }) : activePvPreview(session)
  const nextSession = pvPreview && !session.lockedPv ? setHoveredPv(session, pvPreview) : session
  const variationPlayback = buildVariationPlaybackState(activePvPreview(nextSession), nextSession.pvStepIndex)
  const activeItem = timelineItems.find((item) => item.moveNumber === session.activeMoveNumber)
  return {
    session: nextSession,
    timelineItems,
    activeAnalysis,
    activeDescription: activeItem ? describeTimelineReviewItem(activeItem) : '暂无可复盘关键手。',
    evidencePanel,
    variationPlayback,
    runtimeStatus: {
      cacheStatus: activeAnalysis?.runtimeEvidence?.cacheStatus,
      readinessLevel: activeAnalysis?.runtimeEvidence?.teachingReadiness?.level,
      shouldDeepen: Boolean(activeAnalysis?.runtimeEvidence?.teachingReadiness?.shouldDeepen || activeAnalysis?.moveClassification?.shouldDeepen || activeAnalysis?.pvConfidence?.shouldDeepen),
      safeWording: activeAnalysis?.runtimeEvidence?.teachingReadiness?.safeWording
    }
  }
}

export function hoverRuntimeCandidate(input: {
  model: RuntimeReviewModel
  analysis: KataGoMoveAnalysis
  candidateMove?: string
}): RuntimeReviewModel {
  const pv = buildBoardPvPreviewState({ analysis: input.analysis, candidateMove: input.candidateMove })
  const session = setHoveredPv(input.model.session, pv)
  return { ...input.model, session, variationPlayback: buildVariationPlaybackState(activePvPreview(session), session.pvStepIndex) }
}

export function lockRuntimeCandidate(input: {
  model: RuntimeReviewModel
  analysis: KataGoMoveAnalysis
  candidateMove?: string
}): RuntimeReviewModel {
  const pv = buildBoardPvPreviewState({ analysis: input.analysis, candidateMove: input.candidateMove, locked: true })
  const session = toggleLockedPv(input.model.session, pv)
  return { ...input.model, session, variationPlayback: buildVariationPlaybackState(activePvPreview(session), session.pvStepIndex) }
}

export function runtimeReviewModelCopyText(model: RuntimeReviewModel): string {
  return [
    model.activeDescription,
    model.runtimeStatus.cacheStatus ? `缓存：${model.runtimeStatus.cacheStatus}` : '',
    model.runtimeStatus.readinessLevel ? `讲解准备度：${model.runtimeStatus.readinessLevel}` : '',
    model.runtimeStatus.safeWording ? `安全措辞：${model.runtimeStatus.safeWording}` : '',
    model.variationPlayback?.statusText ?? '',
    model.evidencePanel.map((section) => `## ${section.title}\n${section.summary}`).join('\n\n')
  ].filter(Boolean).join('\n')
}
