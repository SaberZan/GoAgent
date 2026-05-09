import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import ts from 'typescript'

const repoRoot = new URL('..', import.meta.url)

async function text(path) {
  return readFile(new URL(path, repoRoot), 'utf8')
}

async function importTeachingArtifactModule() {
  const source = await text('src/main/services/teacher/teachingArtifact.ts')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false
    }
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(compiled, 'utf8').toString('base64')}`)
}

function fakeAnalysis() {
  return {
    gameId: 'game-1',
    moveNumber: 42,
    boardSize: 19,
    currentMove: {
      moveNumber: 42,
      color: 'B',
      point: 'Q4',
      row: 15,
      col: 16,
      gtp: 'Q4',
      pass: false
    },
    before: {
      winrate: 0.62,
      scoreLead: 3.2,
      topMoves: [
        { move: 'Q16', winrate: 0.64, scoreLead: 4.1, visits: 1200, order: 0, prior: 0.2, pv: ['Q16', 'D4', 'C3'] },
        { move: 'D4', winrate: 0.58, scoreLead: 1.8, visits: 650, order: 1, prior: 0.1, pv: ['D4', 'Q16'] }
      ]
    },
    after: {
      winrate: 0.55,
      scoreLead: 0.4,
      topMoves: []
    },
    playedMove: {
      move: 'Q4',
      winrate: 0.55,
      scoreLead: 0.4,
      playerWinrate: 55,
      playerScoreLead: 0.4,
      visits: 300,
      rank: 3,
      source: 'candidate',
      winrateLoss: 7,
      scoreLoss: 3.7
    },
    judgement: 'mistake'
  }
}

test('teacher artifact runtime exports type, create, validate and agent tool contract', async () => {
  const types = await text('src/main/lib/types.ts')
  const artifact = await text('src/main/services/teacher/teachingArtifact.ts')
  const agent = await text('src/main/services/teacherAgent.ts')
  const docs = await text('docs/TEACHING_ARTIFACTS.md')

  assert.equal(existsSync(new URL('src/main/services/teacher/teachingArtifact.ts', repoRoot)), true)
  assert.match(types, /export interface TeacherArtifact\b/)
  assert.match(types, /TeacherArtifactSandboxHtml/)
  assert.match(types, /sandboxHtml\?: TeacherArtifactSandboxHtml/)
  assert.match(types, /artifact\?: TeacherArtifact/)
  assert.match(artifact, /export function buildTeacherArtifact/)
  assert.match(artifact, /export function createTeachingArtifact/)
  assert.match(artifact, /export function validateTeachingArtifact/)
  assert.match(artifact, /export function validateStaticTeacherArtifactHtml/)
  assert.match(agent, /artifact_createTeachingArtifact/)
  assert.match(agent, /canonicalName: 'artifact\.createTeachingArtifact'/)
  assert.match(agent, /state\.agentArtifact \?\? runtimeArtifact/)
  assert.match(agent, /safeSystemProfileForAgent/)
  assert.match(agent, /safeSettingsSummaryForAgent/)
  assert.doesNotMatch(agent, /execute: async \(\) => detectSystemProfile\(\)/)
  assert.match(docs, /agent JSON artifact/i)
  assert.match(docs, /sandbox HTML/i)
  assert.match(docs, /no remote assets/i)
})

test('buildTeacherArtifact escapes static HTML and normalizes KataGo zero-based candidate order', async () => {
  const { buildTeacherArtifact, validateStaticTeacherArtifactHtml } = await importTeachingArtifactModule()
  const artifact = buildTeacherArtifact({
    id: 'run-1',
    title: '<b>Attack</b> & shape',
    intent: 'current-move',
    request: { prompt: '讲一下当前手' },
    markdown: 'Summary with <img src=x onerror=alert(1)>',
    analysis: fakeAnalysis()
  })

  assert.ok(artifact)
  assert.equal(artifact.source, 'runtime-derived')
  assert.equal(artifact.boardSnapshot.bestMove, 'Q16')
  assert.equal(artifact.candidates[0].rank, 1)
  assert.equal(artifact.candidates[0].note, 'KataGo 首选')
  assert.equal(artifact.candidates[1].rank, 2)
  assert.equal(artifact.candidates[1].note, '第 2 选')
  assert.doesNotMatch(artifact.exportHtml, /第 0 选/)
  assert.doesNotMatch(artifact.exportHtml, /<img\b/i)
  assert.match(artifact.exportHtml, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.match(artifact.exportHtml, /&lt;b&gt;Attack&lt;\/b&gt; &amp; shape/)
  assert.deepEqual(validateStaticTeacherArtifactHtml(artifact.exportHtml), { ok: true, errors: [] })
})

test('buildTeacherArtifact presents candidates from the current player perspective', async () => {
  const { buildTeacherArtifact } = await importTeachingArtifactModule()
  const analysis = fakeAnalysis()
  analysis.currentMove = { ...analysis.currentMove, color: 'W', gtp: 'L15', point: 'L15' }
  analysis.before.topMoves = [
    { move: 'L15', winrate: 0.132, scoreLead: -2.9, visits: 1199, order: 0, prior: 0.2, pv: ['L15', 'L14'] },
    { move: 'B13', winrate: 0.189, scoreLead: -1.5, visits: 18, order: 1, prior: 0.1, pv: ['B13', 'L15'] }
  ]
  analysis.playedMove = {
    ...analysis.playedMove,
    move: 'L15',
    winrate: 0.132,
    scoreLead: -2.9,
    playerWinrate: 86.8,
    playerScoreLead: 2.9
  }

  const artifact = buildTeacherArtifact({
    id: 'run-white-1',
    title: 'White move perspective',
    intent: 'current-move',
    request: { prompt: '讲一下当前手' },
    markdown: 'White should see white-perspective values.',
    analysis
  })

  assert.ok(artifact)
  assert.equal(artifact.boardSnapshot.currentColor, 'W')
  assert.equal(artifact.candidates[0].note, '实战点')
  assert.equal(artifact.candidates[0].winrate, 86.8)
  assert.equal(artifact.candidates[0].scoreLead, 2.9)
  assert.match(artifact.exportHtml, /落子方胜率/)
  assert.doesNotMatch(artifact.exportHtml, />13\.2%<\/td>/)
})

test('TeachingArtifact data is not rendered as a separate user-facing card', async () => {
  const card = await text('src/renderer/src/features/teacher/TeacherArtifactCard.tsx')
  const app = await text('src/renderer/src/App.tsx')
  const runCard = await text('src/renderer/src/features/teacher/TeacherRunCardPro.tsx')
  const gallery = await text('src/renderer/src/features/gallery/UiGallery.tsx')
  assert.match(card, /老师批注/)
  assert.match(card, /关键证据/)
  assert.match(card, /下一次怎么练/)
  assert.match(card, /matchTypeLabel/)
  assert.match(card, /matchConfidenceLabel/)
  assert.match(card, /复制讲解/)
  assert.match(card, /buildArtifactCopyText/)
  assert.match(card, /讲解卡片/)
  assert.doesNotMatch(card, /\{match\.matchType\} · \{match\.confidence\}/)
  assert.doesNotMatch(card, /导出网页|复制复盘|downloadHtml|复盘网页源码/)
  assert.doesNotMatch(app, /TeacherArtifactCard/)
  assert.doesNotMatch(runCard, /TeacherArtifactCard/)
  assert.doesNotMatch(gallery, /TeacherArtifactCard|复盘卡片 Renderer/)
})

test('teacher markdown is rendered as formatted text instead of raw markdown markers', async () => {
  const app = await text('src/renderer/src/App.tsx')
  const runCard = await text('src/renderer/src/features/teacher/TeacherRunCardPro.tsx')
  const styles = await text('src/renderer/src/styles.css')

  assert.match(app, /const heading = line\.match/)
  assert.match(app, /const bullet = line\.match/)
  assert.match(app, /HeadingTag/)
  assert.match(app, /blockquote/)
  assert.match(app, /renderInlineMarkdown/)
  assert.match(runCard, /function MarkdownText/)
  assert.match(runCard, /renderSimpleInlineMarkdown/)
  assert.match(runCard, /const heading = line\.match/)
  assert.match(styles, /\.chat-markdown h3/)
  assert.match(styles, /\.chat-markdown blockquote/)
})

test('createTeachingArtifact validates, prunes, redacts and keeps sandbox HTML separate', async () => {
  const { createTeachingArtifact, validateTeachingArtifact, validateStaticTeacherArtifactHtml } = await importTeachingArtifactModule()
  const validation = validateTeachingArtifact({
    title: 'Agent <script>alert(1)</script> Review',
    summary: 'Use <b>shape</b> near /Users/haoc/.secret with sk-test123456789012345 and {"proxyApiKey":"clip-secret-1234567890"} data:image/png;base64,AAAA',
    kind: 'current-move-review',
    boardSnapshot: {
      boardSize: 19,
      moveNumber: 42,
      playedMove: 'Q4',
      bestMove: 'Q16',
      winrateLoss: 7
    },
    candidates: Array.from({ length: 10 }, (_, index) => ({
      rank: index,
      move: `P${index + 1}`,
      winrate: 60 - index,
      scoreLead: 3 - index / 10,
      visits: 100 + index,
      pv: ['Q16', 'D4']
    })),
    keyMoves: [{
      moveNumber: 42,
      played: 'Q4',
      recommended: 'Q16',
      summary: 'Avoid <strong>overplay</strong>'
    }],
    sandboxHtml: {
      enabled: true,
      scriptPolicy: 'sandbox-iframe-only',
      html: '<section onclick="bad()">Safe<script>alert(1)</script><img src="https://example.com/a.png"></section>'
    }
  }, {
    id: 'agent-artifact',
    source: 'agent-json',
    allowSandboxScripts: false
  })

  assert.equal(validation.ok, true)
  assert.ok(validation.artifact)
  assert.equal(validation.artifact.source, 'agent-json')
  assert.equal(validation.artifact.candidates.length, 8)
  assert.equal(validation.artifact.candidates[0].rank, 1)
  assert.equal(validation.artifact.candidates[0].note, 'KataGo 首选')
  assert.equal(validation.artifact.candidates[1].rank, 2)
  assert.equal(validation.artifact.sandboxHtml.scriptPolicy, 'disabled')
  assert.doesNotMatch(validation.artifact.sandboxHtml.html, /<script\b|onclick=|https:\/\/|<img\b/i)
  assert.doesNotMatch(validation.artifact.exportHtml, /<script\b|data:image|\/Users|sk-test/i)
  assert.doesNotMatch(validation.artifact.exportHtml, /clip-secret|proxyApiKey/i)
  assert.match(validation.artifact.exportHtml, /&lt;b&gt;shape&lt;\/b&gt;/)
  assert.match(validation.artifact.exportHtml, /\[REDACTED_LOCAL_PATH\]/)
  assert.match(validation.artifact.exportHtml, /\[REDACTED_TOKEN\]/)
  assert.deepEqual(validateStaticTeacherArtifactHtml(validation.artifact.exportHtml), { ok: true, errors: [] })

  const created = createTeachingArtifact({ artifact: validation.artifact }, { id: 'agent-artifact-2' })
  assert.ok(created)
  assert.equal(created.exportFileName.endsWith('.html'), true)
})

test('no evidence means no TeachingArtifact', async () => {
  const { buildTeacherArtifact, createTeachingArtifact, validateTeachingArtifact } = await importTeachingArtifactModule()

  assert.equal(buildTeacherArtifact({
    id: 'no-evidence-runtime',
    title: 'Only text',
    intent: 'freeform',
    request: { prompt: '闲聊' },
    markdown: '没有 KataGo、知识库或训练证据。'
  }), undefined)

  const invalid = validateTeachingArtifact({
    title: 'Only text',
    summary: 'No evidence-backed sections.'
  }, { id: 'no-evidence-agent' })
  assert.equal(invalid.ok, false)
  assert.match(invalid.errors.join('\n'), /at least one evidence-backed section/)
  assert.equal(createTeachingArtifact({ title: 'Only text', summary: 'No evidence.' }), undefined)
})

test('move-range artifacts prefer trusted range evidence over LLM-invented key moves', async () => {
  const { buildTeacherArtifact } = await importTeachingArtifactModule()
  const artifact = buildTeacherArtifact({
    id: 'range-1',
    title: '区间复盘',
    intent: 'move-range',
    request: {
      prompt: '复盘 20 到 40 手',
      moveRangeSummary: {
        start: 20,
        end: 40,
        totalMoves: 21,
        analysisMethod: 'quick-sweep',
        omittedMoves: 0,
        keyMoves: [{
          moveNumber: 32,
          playedMove: 'K10',
          bestMove: 'Q10',
          winrateLoss: 6.5,
          scoreLoss: 2.1,
          judgement: 'mistake',
          evidenceRefs: ['katago']
        }]
      }
    },
    markdown: '老师文字里可能提到第 99 手，但 artifact 不应拿它当事实导航。',
    structured: {
      taskType: 'move-range',
      headline: '区间复盘',
      summary: '区间复盘',
      keyMistakes: [{
        moveNumber: 99,
        color: 'B',
        played: 'A1',
        recommended: 'T19',
        severity: 'blunder',
        errorType: 'invented',
        explanation: 'LLM invented move'
      }],
      drills: []
    }
  })

  assert.ok(artifact)
  assert.equal(artifact.keyMoves.length, 1)
  assert.equal(artifact.keyMoves[0].moveNumber, 32)
  assert.equal(artifact.keyMoves[0].played, 'K10')
  assert.equal(artifact.keyMoves[0].recommended, 'Q10')
  assert.doesNotMatch(artifact.exportHtml, /第 99 手|A1|T19/)
})
