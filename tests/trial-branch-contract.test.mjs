import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

test('trial branch model supports temporary legal play without mutating mainline', () => {
  const trial = read('src/renderer/src/features/board/trialBranch.ts')
  assert.equal(existsSync(join(root, 'src/renderer/src/features/board/trialBranch.ts')), true)
  assert.match(trial, /export interface TrialBranch/)
  assert.match(trial, /export function addTrialMove/)
  assert.match(trial, /export function undoTrialMove/)
  assert.match(trial, /export function deriveTrialRecord/)
  assert.match(trial, /boardFromMainline\(record, branch\.baseMoveNumber\)/)
  assert.match(trial, /groupLiberties\(nextBoard, ownGroup, boardSize\) === 0/)
  assert.match(trial, /signatures\.has\(nextSignature\)/)
  assert.match(trial, /moves: \[\.\.\.baseMoves, \.\.\.trialMoves\]/)
})

test('GoBoardV2 renders trial stones and switches candidate display to branch endpoint', () => {
  const board = read('src/renderer/src/features/board/GoBoardV2.tsx')
  const geometry = read('src/renderer/src/features/board/boardGeometry.ts')
  const css = read('src/renderer/src/features/board/board-v2.css')
  assert.match(board, /trialBranch\?: TrialBranch/)
  assert.match(board, /function TrialStoneMark/)
  assert.match(board, /ks-trial-stones-layer/)
  assert.match(board, /onPointContextMenu/)
  assert.match(board, /analysis\?\.trialContext\?\.active/)
  assert.match(geometry, /trialActive/)
  assert.match(geometry, /beforeMoves\.length > 0 && !trialActive/)
  assert.match(css, /\.ks-trial-stone-ring/)
})

test('trial analysis IPC is exposed through main, preload and renderer types', () => {
  const types = read('src/main/lib/types.ts')
  const main = read('src/main/index.ts')
  const preload = read('src/preload/index.ts')
  const globalTypes = read('src/renderer/src/global.d.ts')
  const katago = read('src/main/services/katago.ts')
  assert.match(types, /export interface TrialBranchSummary/)
  assert.match(types, /export interface AnalyzeTrialPositionRequest/)
  assert.match(types, /trialContext\?: TrialBranchSummary/)
  assert.match(types, /'trial'/)
  assert.match(main, /katago:analyze-trial-position-stream/)
  assert.match(preload, /analyzeTrialPositionStream/)
  assert.match(globalTypes, /analyzeTrialPositionStream/)
  assert.match(katago, /analyzeTrialPositionWithProgress/)
  assert.match(katago, /stableTrialBranchHash/)
})

test('teacher screenshots and prompt keep trial branch distinct from mainline', () => {
  const app = read('src/renderer/src/App.tsx')
  const teacher = read('src/main/services/teacherAgent.ts')
  const types = read('src/main/lib/types.ts')
  assert.match(types, /boardContext\?: 'mainline' \| 'trial'/)
  assert.match(app, /boardContext: useTrial \? 'trial' : 'mainline'/)
  assert.match(app, /deriveTrialRecord\(targetRecord, payloadTrialBranch\)/)
  assert.match(teacher, /boardContext=trial/)
  assert.match(teacher, /trialBranch: state\.request\.trialBranch/)
  assert.match(teacher, /boardContext=trial[\s\S]*试下分支/)
})
