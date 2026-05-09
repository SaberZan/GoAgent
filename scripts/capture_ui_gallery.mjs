#!/usr/bin/env node
import { mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const url = process.env.GOAGENT_UI_GALLERY_URL ?? 'http://localhost:5173/#/ui-gallery'
const outDir = resolve(process.env.GOAGENT_UI_GALLERY_OUT ?? 'release-evidence/ui-gallery')
const captureTargets = [
  ['board', '.ui-gallery__panel--board'],
  ['teacher-card', '.ui-gallery__panel--teacher'],
  ['teaching-artifact-card', '.teacher-artifact-card'],
  ['timeline', '.ks-timeline-v2'],
  ['diagnostics', '.diagnostics-page'],
  ['settings-readiness', '.beta-acceptance-panel']
]

async function loadPlaywright() {
  try {
    return await import('playwright')
  } catch {
    return null
  }
}

async function captureWithCliFallback() {
  await mkdir(outDir, { recursive: true })
  const whichResult = spawnSync('npx', ['--yes', '-p', 'playwright', 'which', 'playwright'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  })
  const playwrightBin = whichResult.stdout.trim()
  if (whichResult.status !== 0 || !playwrightBin) {
    throw new Error('Playwright package is not installed and npx could not locate it. Run pnpm dev, then capture this route manually: ' + url)
  }
  const playwrightNodeModules = dirname(dirname(playwrightBin))
  const fallbackScript = `
    const { mkdir } = require('node:fs/promises')
    const { createRequire } = require('node:module')
    const { join } = require('node:path')
    const requireFromPlaywright = createRequire(join(process.env.PLAYWRIGHT_NODE_MODULES, 'playwright', 'package.json'))
    const { chromium } = requireFromPlaywright('playwright')

    ;(async () => {
      const url = process.env.GOAGENT_CAPTURE_URL
      const outDir = process.env.GOAGENT_CAPTURE_OUT
      const targets = ${JSON.stringify(captureTargets)}

      await mkdir(outDir, { recursive: true })
      const browser = await chromium.launch()
      const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 })
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.screenshot({ path: join(outDir, 'ui-gallery-overview.png'), fullPage: true })
      for (const [name, selector] of targets) {
        const locator = page.locator(selector).first()
        if (await locator.count()) {
          await locator.screenshot({ path: join(outDir, name + '.png') })
        }
      }
      await browser.close()
    })().catch((error) => {
      console.error(error.message)
      process.exit(1)
    })
  `
  const result = spawnSync('npx', [
    '--yes',
    '-p',
    'playwright',
    'node',
    '-e',
    fallbackScript
  ], {
    env: {
      ...process.env,
      GOAGENT_CAPTURE_URL: url,
      GOAGENT_CAPTURE_OUT: outDir,
      PLAYWRIGHT_NODE_MODULES: playwrightNodeModules
    },
    stdio: 'inherit'
  })
  if (result.status !== 0) {
    throw new Error('Playwright package is not installed and npx Playwright capture failed. Run pnpm dev, then capture this route manually: ' + url)
  }
  console.log(`Captured UI Gallery screenshots in ${outDir}`)
}

async function capture() {
  const playwright = await loadPlaywright()
  if (!playwright) {
    await captureWithCliFallback()
    return
  }
  const { chromium } = playwright
  await mkdir(outDir, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.screenshot({ path: join(outDir, 'ui-gallery-overview.png'), fullPage: true })

  for (const [name, selector] of captureTargets) {
    const locator = page.locator(selector).first()
    if (await locator.count()) {
      await locator.screenshot({ path: join(outDir, `${name}.png`) })
    }
  }

  const bindButton = page.getByRole('button', { name: '打开 SGF 绑定弹窗' })
  if (await bindButton.count()) {
    await bindButton.click()
    await page.locator('.student-dialog').screenshot({ path: join(outDir, 'student-bind-dialog.png') })
  }

  await browser.close()
  console.log(`Captured UI Gallery screenshots in ${outDir}`)
}

capture().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
