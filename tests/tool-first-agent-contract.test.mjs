import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')

test('teacher agent exposes screenshots, KataGo, and knowledge as LLM-callable tools', () => {
  const agent = read('src/main/services/teacherAgent.ts')
  for (const tool of [
    'board.captureTeachingImage',
    'katago.getAnalysisCache',
    'katago.getTracePacket',
    'katago.compareMoves',
    'knowledge.matchPosition',
    'knowledge.searchJoseki',
    'knowledge.searchLifeDeath',
    'knowledge.searchTesuji',
    'knowledge.recommendProblems'
  ]) {
    assert.match(agent, new RegExp(tool.replace('.', '\\.')))
  }
  assert.match(agent, /captureTeachingImagesForState/)
  assert.match(agent, /selection.*top-loss/s)
  assert.match(agent, /selection.*move-range-top-loss/s)
  assert.match(agent, /pendingToolMessages/)
  assert.match(agent, /image_url/)
  assert.match(agent, /detail: 'high'/)
  assert.doesNotMatch(agent, /description: '确认当前棋盘截图是否已经作为图片输入提供给模型。'/)
})

test('main and renderer provide a request-response bridge for tool-generated board images', () => {
  const main = read('src/main/index.ts')
  const preload = read('src/preload/index.ts')
  const app = read('src/renderer/src/App.tsx')
  const types = read('src/main/lib/types.ts')
  assert.match(types, /export interface AgentToolImageResult/)
  assert.match(types, /export interface TeacherBoardImageRenderRequest/)
  assert.match(types, /export interface TeacherBoardImageRenderResponse/)
  assert.match(types, /toolPolicy\?: TeacherToolPolicy/)
  assert.match(main, /requestTeacherBoardImages/)
  assert.match(main, /teacher:board-image-render-request/)
  assert.match(main, /teacher:board-image-render-response/)
  assert.match(preload, /onTeacherBoardImageRequest/)
  assert.match(app, /renderTeacherBoardImages/)
  assert.match(app, /renderBoardPng\(targetRecord, targetMove/)
  assert.match(app, /dataUrlSha256/)
})

test('renderer teacher entrypoints delegate evidence gathering to the agent tools', () => {
  const app = read('src/renderer/src/App.tsx')
  assert.match(app, /mode: 'current-move'[\s\S]*prompt: ask[\s\S]*gameId: selectedGame\.id[\s\S]*moveNumber: targetMove/)
  assert.match(app, /mode: 'move-range'[\s\S]*moveRange: \{ start: rangeStart, end: rangeEnd \}/)
  assert.doesNotMatch(app, /prefetchedAnalysis: nextAnalysis/)
  assert.doesNotMatch(app, /boardImageDataUrl,\n\s*prefetchedAnalysis/)
  assert.doesNotMatch(app, /boardImageDataUrls\s*\}/)
})
