#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const json = (path) => JSON.parse(read(path))

function assertPackageWiring() {
  const pkg = json('package.json')
  assert.equal(pkg.scripts['eval:vision-evidence'], 'node scripts/eval_vision_evidence.mjs')
  assert.match(pkg.scripts['check:teacher-quality'], /eval:vision-evidence/)
}

function assertTypes() {
  const types = read('src/main/lib/types.ts')
  assert.match(types, /interface VisionEvidenceReport/)
  assert.match(types, /interface VisionEvidenceImage/)
  assert.match(types, /visionEvidence\?: VisionEvidenceReport/)
}

function assertProviderVisionDetail() {
  const provider = read('src/main/services/llm/provider.ts')
  const openai = read('src/main/services/llm/openaiCompatibleProvider.ts')
  assert.match(provider, /detail\?: 'low' \| 'high' \| 'auto'/)
  assert.match(openai, /image_url: \{ url: tinyPng, detail: 'high' \}/)
}

function assertVisionService() {
  const source = read('src/main/services/teacher/visionEvidence.ts')
  assert.match(source, /VISION_EVIDENCE_MAX_IMAGE_BYTES = 8 \* 1024 \* 1024/)
  assert.match(source, /detail: VISION_EVIDENCE_DEFAULT_DETAIL/)
  assert.match(source, /buildVisionEvidenceReport/)
  assert.match(source, /validateVisionEvidenceForIntent/)
  assert.match(source, /formatVisionEvidenceForPrompt/)
  assert.match(source, /buildVisionImageContentParts/)
  assert.match(source, /严禁说“没有棋盘图”/)
}

function assertTeacherAgentWiring() {
  const source = read('src/main/services/teacherAgent.ts')
  assert.match(source, /buildVisionEvidenceReport/)
  assert.match(source, /validateVisionEvidenceForIntent/)
  assert.match(source, /formatVisionEvidenceForPrompt/)
  assert.match(source, /buildVisionImageContentParts/)
  assert.match(source, /verifyVisionEvidenceMarkdown/)
  assert.match(source, /buildVisionEvidenceRepairNote/)
  assert.match(source, /visionEvidence/)
  assert.match(source, /visionEvidence,?/)
  assert.match(source, /detail/)
}

function assertVerifier() {
  const verifier = read('src/main/services/teacher/visionEvidenceVerifier.ts')
  assert.match(verifier, /verifyVisionEvidenceMarkdown/)
  assert.match(verifier, /false-no-board-image-claim/)
  assert.match(verifier, /没有棋盘图/)
}

assertPackageWiring()
assertTypes()
assertProviderVisionDetail()
assertVisionService()
assertTeacherAgentWiring()
assertVerifier()

console.log('[eval:vision-evidence] vision evidence chain contract passed')
