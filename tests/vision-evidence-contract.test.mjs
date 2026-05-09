import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')

test('vision evidence types are explicit and attached to teacher requests/results', () => {
  const types = read('src/main/lib/types.ts')
  assert.match(types, /export interface VisionEvidenceReport/)
  assert.match(types, /export interface VisionEvidenceImage/)
  assert.match(types, /providerSupportsVision: boolean \| 'unknown'/)
  assert.match(types, /blockingIssues: string\[\]/)
  assert.match(types, /TeacherRunRequest[\s\S]*visionEvidence\?: VisionEvidenceReport/)
  assert.match(types, /TeacherRunResult[\s\S]*visionEvidence\?: VisionEvidenceReport/)
})

test('vision evidence service validates image presence and sends high-detail image parts', () => {
  const source = read('src/main/services/teacher/visionEvidence.ts')
  assert.match(source, /VISION_EVIDENCE_MAX_IMAGE_BYTES = 8 \* 1024 \* 1024/)
  assert.match(source, /VISION_EVIDENCE_RECOMMENDED_IMAGE_BYTES = 2 \* 1024 \* 1024/)
  assert.match(source, /visionRequiredForMode/)
  assert.match(source, /intent === 'game-review'/)
  assert.match(source, /buildVisionEvidenceReport/)
  assert.match(source, /validateVisionEvidenceForIntent/)
  assert.match(source, /buildVisionImageContentParts/)
  assert.match(source, /detail: image\.detail/)
  assert.match(source, /本轮已经提供棋盘图/)
})

test('selected-game freeform chat is not implicitly promoted to image-required review', () => {
  const classifier = read('src/main/services/teacher/intentClassifier.ts')
  assert.match(classifier, /intent: 'open-ended'[\s\S]*rationale: 'empty prompt'/)
  assert.match(classifier, /rationale: 'no strong signal'/)
  assert.doesNotMatch(classifier, /request\.gameId \? 'game-review' : 'open-ended'/)
})

test('teacher agent includes vision evidence instructions and refuses missing required images', () => {
  const source = read('src/main/services/teacherAgent.ts')
  assert.match(source, /buildVisionEvidenceReport/)
  assert.match(source, /validateVisionEvidenceForIntent/)
  assert.match(source, /棋盘图证据不完整/)
  assert.match(source, /formatVisionEvidenceForPrompt\(visionEvidence\)/)
  assert.match(source, /intent 是 game-review/)
  assert.match(source, /严禁说“没有棋盘图”/)
  assert.match(source, /buildVisionImageContentParts\(state\.request, visionEvidence\)/)
  assert.match(source, /verifyVisionEvidenceMarkdown\(finalText, visionEvidence\)/)
  assert.match(source, /buildVisionEvidenceRepairNote\(visionIssues\)/)
  assert.match(source, /visionEvidence,?/)
})

test('provider image parts support high-detail vision input', () => {
  const provider = read('src/main/services/llm/provider.ts')
  const openai = read('src/main/services/llm/openaiCompatibleProvider.ts')
  assert.match(provider, /detail\?: 'low' \| 'high' \| 'auto'/)
  assert.match(openai, /image_url: \{ url: tinyPng, detail: 'high' \}/)
})

test('vision verifier catches false no-board-image claims', () => {
  const source = read('src/main/services/teacher/visionEvidenceVerifier.ts')
  assert.match(source, /verifyVisionEvidenceMarkdown/)
  assert.match(source, /false-no-board-image-claim/)
  assert.match(source, /没有棋盘图/)
  assert.match(source, /看不到\(\?:棋盘\|图片\|图像\)/)
})
