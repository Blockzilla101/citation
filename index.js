import { Citation } from './src/citation'
import { registerFont } from 'canvas'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(__dirname, 'data')
const fontFile = path.join(dataDir, 'BMmini.ttf')
const logo = path.join(dataDir, 'logo.png')

if (!fs.existsSync(dataDir)) throw new Error(`${dataDir} is no where to be found`)
if (!fs.existsSync(fontFile)) throw new Error(`Font ${fontFile} is no where to be found`)
if (!fs.existsSync(logo)) throw new Error(`Logo ${logo} is no where to be found`)

registerFont(fontFile, { family: 'BMmini' });

module.exports = { Citation }
