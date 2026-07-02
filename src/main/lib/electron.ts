import { createRequire } from 'node:module'
import type Electron from 'electron'

const require = createRequire(import.meta.url)
const electron = require('electron') as typeof Electron

export default electron
