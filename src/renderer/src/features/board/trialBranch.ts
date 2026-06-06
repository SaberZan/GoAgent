import type { GameMove, GameRecord, StoneColor } from '@main/lib/types'
import { boardPointLabel, getBoardSize, renderStones, type BoardPoint } from './boardGeometry'

export interface TrialMove extends BoardPoint {
  color: StoneColor
  row: number
  col: number
  gtp: string
  moveNumber: number
}

export interface TrialBranch {
  active: boolean
  baseMoveNumber: number
  moves: TrialMove[]
  nextColor: StoneColor
  branchHash: string
  error?: string
}

type TrialBoardStone = BoardPoint & {
  color: StoneColor
  moveNumber: number
}

type TrialBoard = Map<string, TrialBoardStone>

const EMPTY_TRIAL_BRANCH: TrialBranch = {
  active: false,
  baseMoveNumber: 0,
  moves: [],
  nextColor: 'B',
  branchHash: 'trial:inactive'
}

function pointKey(point: BoardPoint): string {
  return `${point.x},${point.y}`
}

function oppositeColor(color: StoneColor): StoneColor {
  return color === 'B' ? 'W' : 'B'
}

function neighbors(point: BoardPoint, boardSize: number): BoardPoint[] {
  return [
    { x: point.x, y: point.y - 1 },
    { x: point.x, y: point.y + 1 },
    { x: point.x - 1, y: point.y },
    { x: point.x + 1, y: point.y }
  ].filter((next) => next.x >= 0 && next.y >= 0 && next.x < boardSize && next.y < boardSize)
}

function collectGroup(board: TrialBoard, start: BoardPoint, boardSize: number): TrialBoardStone[] {
  const startStone = board.get(pointKey(start))
  if (!startStone) return []
  const seen = new Set<string>()
  const group: TrialBoardStone[] = []
  const stack = [start]
  while (stack.length > 0) {
    const point = stack.pop()!
    const key = pointKey(point)
    if (seen.has(key)) continue
    const stone = board.get(key)
    if (!stone || stone.color !== startStone.color) continue
    seen.add(key)
    group.push(stone)
    for (const next of neighbors(point, boardSize)) {
      const nextStone = board.get(pointKey(next))
      if (nextStone?.color === startStone.color) {
        stack.push(next)
      }
    }
  }
  return group
}

function groupLiberties(board: TrialBoard, group: TrialBoardStone[], boardSize: number): number {
  const liberties = new Set<string>()
  for (const stone of group) {
    for (const next of neighbors(stone, boardSize)) {
      if (!board.has(pointKey(next))) {
        liberties.add(pointKey(next))
      }
    }
  }
  return liberties.size
}

function signature(board: TrialBoard): string {
  return [...board.values()]
    .sort((left, right) => left.y - right.y || left.x - right.x)
    .map((stone) => `${stone.color}${stone.x},${stone.y}`)
    .join('|')
}

function stableHash(text: string): string {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function hashBranch(baseMoveNumber: number, moves: TrialMove[]): string {
  return `trial:${baseMoveNumber}:${stableHash(moves.map((move) => `${move.color}${move.gtp}`).join(','))}`
}

function nextColorAfter(record: GameRecord, baseMoveNumber: number, moves: TrialMove[]): StoneColor {
  if (moves.length > 0) {
    return oppositeColor(moves[moves.length - 1].color)
  }
  const nextMainMove = record.moves[baseMoveNumber]
  if (nextMainMove) {
    return nextMainMove.color
  }
  const previous = record.moves[baseMoveNumber - 1]
  return previous ? oppositeColor(previous.color) : 'B'
}

function boardFromMainline(record: GameRecord, moveNumber: number): TrialBoard {
  const board: TrialBoard = new Map()
  for (const stone of renderStones(record, moveNumber)) {
    board.set(pointKey(stone), {
      x: stone.x,
      y: stone.y,
      color: stone.color,
      moveNumber: stone.moveNumber
    })
  }
  return board
}

function boardWithTrialMoves(record: GameRecord, branch: TrialBranch, until = branch.moves.length): { board: TrialBoard; signatures: Set<string> } {
  const boardSize = getBoardSize(record)
  const board = boardFromMainline(record, branch.baseMoveNumber)
  const signatures = new Set<string>([signature(board)])
  for (const move of branch.moves.slice(0, until)) {
    applyTrialMoveToBoard(board, move, boardSize)
    signatures.add(signature(board))
  }
  return { board, signatures }
}

function applyTrialMoveToBoard(board: TrialBoard, move: TrialMove, boardSize: number): void {
  board.set(pointKey(move), { ...move })
  const opponent = oppositeColor(move.color)
  for (const next of neighbors(move, boardSize)) {
    const neighbor = board.get(pointKey(next))
    if (neighbor?.color !== opponent) continue
    const group = collectGroup(board, next, boardSize)
    if (group.length > 0 && groupLiberties(board, group, boardSize) === 0) {
      for (const stone of group) {
        board.delete(pointKey(stone))
      }
    }
  }
}

export function createTrialBranch(record: GameRecord, baseMoveNumber: number): TrialBranch {
  const safeBase = Math.max(0, Math.min(record.moves.length, Math.round(baseMoveNumber)))
  const moves: TrialMove[] = []
  return {
    active: true,
    baseMoveNumber: safeBase,
    moves,
    nextColor: nextColorAfter(record, safeBase, moves),
    branchHash: hashBranch(safeBase, moves)
  }
}

export function emptyTrialBranch(): TrialBranch {
  return { ...EMPTY_TRIAL_BRANCH, moves: [] }
}

export function addTrialMove(record: GameRecord, branch: TrialBranch, point: BoardPoint): TrialBranch {
  const activeBranch = branch.active ? branch : createTrialBranch(record, branch.baseMoveNumber || 0)
  const boardSize = getBoardSize(record)
  const x = Math.round(point.x)
  const y = Math.round(point.y)
  if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) {
    return { ...activeBranch, error: '超出棋盘。' }
  }
  const { board, signatures } = boardWithTrialMoves(record, activeBranch)
  const normalized = { x, y }
  if (board.has(pointKey(normalized))) {
    return { ...activeBranch, error: '这里已经有棋子。' }
  }
  const move: TrialMove = {
    ...normalized,
    row: y,
    col: x,
    color: activeBranch.nextColor,
    gtp: boardPointLabel(normalized, boardSize),
    moveNumber: activeBranch.baseMoveNumber + activeBranch.moves.length + 1
  }
  const nextBoard = new Map(board)
  applyTrialMoveToBoard(nextBoard, move, boardSize)
  const ownGroup = collectGroup(nextBoard, move, boardSize)
  if (ownGroup.length > 0 && groupLiberties(nextBoard, ownGroup, boardSize) === 0) {
    return { ...activeBranch, error: '这手是自杀，不能试下。' }
  }
  const nextSignature = signature(nextBoard)
  if (signatures.has(nextSignature)) {
    return { ...activeBranch, error: '这手会立即回到已出现的局面，先按劫争处理。' }
  }
  const moves = [...activeBranch.moves, move]
  return {
    active: true,
    baseMoveNumber: activeBranch.baseMoveNumber,
    moves,
    nextColor: nextColorAfter(record, activeBranch.baseMoveNumber, moves),
    branchHash: hashBranch(activeBranch.baseMoveNumber, moves)
  }
}

export function undoTrialMove(record: GameRecord, branch: TrialBranch): TrialBranch {
  if (!branch.active || branch.moves.length === 0) {
    return branch
  }
  const moves = branch.moves.slice(0, -1)
  return {
    active: true,
    baseMoveNumber: branch.baseMoveNumber,
    moves,
    nextColor: nextColorAfter(record, branch.baseMoveNumber, moves),
    branchHash: hashBranch(branch.baseMoveNumber, moves)
  }
}

export function clearTrialMoves(record: GameRecord, branch: TrialBranch): TrialBranch {
  return createTrialBranch(record, branch.active ? branch.baseMoveNumber : branch.baseMoveNumber || 0)
}

export function deriveTrialRecord(record: GameRecord, branch: TrialBranch): GameRecord {
  if (!branch.active) {
    return record
  }
  const baseMoves = record.moves.slice(0, branch.baseMoveNumber)
  const trialMoves: GameMove[] = branch.moves.map((move) => ({
    moveNumber: move.moveNumber,
    color: move.color,
    point: move.gtp,
    row: move.y,
    col: move.x,
    gtp: move.gtp,
    pass: false
  }))
  return {
    ...record,
    game: {
      ...record.game,
      title: `${record.game.title || record.game.black + ' vs ' + record.game.white} · 试下`,
      moveCount: baseMoves.length + trialMoves.length
    },
    moves: [...baseMoves, ...trialMoves]
  }
}

export function trialBranchSummary(branch: TrialBranch): {
  active: boolean
  baseMoveNumber: number
  moves: TrialMove[]
  nextColor: StoneColor
  branchHash: string
} {
  return {
    active: branch.active,
    baseMoveNumber: branch.baseMoveNumber,
    moves: branch.moves,
    nextColor: branch.nextColor,
    branchHash: branch.branchHash
  }
}
