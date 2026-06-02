import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const repoRoot = new URL('..', import.meta.url)

async function text(path) {
  return readFile(new URL(path, repoRoot), 'utf8')
}

test('Zhizi cloud engine is wired as a first-class KataGo engine mode', async () => {
  assert.equal(existsSync(new URL('src/main/services/zhiziGtpEngine.ts', repoRoot)), true)
  const types = await text('src/main/lib/types.ts')
  const store = await text('src/main/lib/store.ts')
  const katago = await text('src/main/services/katago.ts')
  const diagnostics = await text('src/main/services/diagnostics/index.ts')
  const systemProfile = await text('src/main/services/systemProfile.ts')

  assert.match(types, /KataGoEngineMode = 'auto' \| 'persistent' \| 'spawn' \| 'ikatago' \| 'zhizi'/)
  assert.match(types, /zhiziClientBin: string/)
  assert.match(types, /zhiziUseWhenLocalSlow: boolean/)
  assert.match(store, /zhiziToken\?: SecretValue/)
  assert.match(katago, /queryZhiziGtpAnalysisBatch/)
  assert.match(katago, /shouldPreferZhiziGtpEngine\(settings, runtime\.ready\)/)
  assert.match(katago, /settings\.katagoEngineMode === 'zhizi'/)
  assert.match(diagnostics, /使用智子云远程算力/)
  assert.match(systemProfile, /Zhizi Cloud Ready/)
})

test('Zhizi cloud engine uses real GTP kata-analyze output instead of iKataGo analysis JSON', async () => {
  const engine = await text('src/main/services/zhiziGtpEngine.ts')
  const renderer = await text('src/renderer/src/App.tsx')
  const preload = await text('src/preload/index.ts')
  const main = await text('src/main/index.ts')
  const docs = await text('docs/ZHIZI_CLOUD_ENGINE.md')

  assert.match(engine, /kata-analyze \$\{player\} 8 rootInfo true maxmoves 20/)
  assert.match(engine, /parseKataAnalyzeInfo/)
  assert.match(engine, /hasGtpTerminator/)
  assert.match(engine, /\\r\?\\n\\r\?\\n/)
  assert.match(engine, /GTP ready|beginning main protocol loop/)
  assert.match(engine, /settings\.zhiziToken\.trim\(\)/)
  assert.match(renderer, /智子云远程算力/)
  assert.match(renderer, /zhiziClientBin/)
  assert.match(renderer, /getSavedZhiziToken/)
  assert.match(preload, /zhizi:get-saved-token/)
  assert.match(main, /hasZhiziToken/)
  assert.match(docs, /zz-ikatago/)
  assert.match(docs, /kata-analyze/)
})
