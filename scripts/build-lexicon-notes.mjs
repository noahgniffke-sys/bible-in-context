#!/usr/bin/env node
/**
 * Build compact Thayer and Brown-Driver-Briggs notes keyed by Strong's number.
 *
 * Thayer: Joseph Henry Thayer, A Greek-English Lexicon of the New Testament (1889),
 * public domain. Digitized text from
 * https://github.com/nigelmsipa/thayers-greek-lexicon-dataset (CC0).
 *
 * BDB: Brown, Driver, and Briggs, A Hebrew and English Lexicon (1906),
 * public domain. Formatted text from
 * https://github.com/eliranwong/unabridged-BDB-Hebrew-lexicon
 *
 * The verse page only needs the opening definition, so each entry is clipped.
 * Usage: node scripts/build-lexicon-notes.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../src/data/lexicon')
const THAYER_URL = 'https://raw.githubusercontent.com/nigelmsipa/thayers-greek-lexicon-dataset/master/data/thayer_lexicon.json'
const BDB_URL = 'https://raw.githubusercontent.com/eliranwong/unabridged-BDB-Hebrew-lexicon/master/DictBDB.json'
const STORE_LIMIT = 1100

function tidyLexiconText(text) {
  if (!text) return ''
  return text
    .replace(/\[(?:Hebrew|Syriac|Aramaic|Greek|Arabic|Chaldee|Latin|Samaritan)\]/g, '')
    .replace(/\b(?:Arabic|Syriac|Ethiopic|Aramaic|Chaldee)\s*,/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function clip(text, limit) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  const cut = clean.slice(0, limit)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '))
  if (stop > limit * 0.55) return cut.slice(0, stop + 1).trim()
  return `${cut.trim()}…`
}

function withoutAsides(text) {
  return text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*$/g, ' ')
    .replace(/\[[^\]]*$/g, ' ')
}

function leadingReadsAsDefinition(text) {
  const words = withoutAsides(text.slice(0, 180)).match(/[A-Za-z]{3,}/g) || []
  return words.length >= 8
}

function definitionStart(text) {
  if (leadingReadsAsDefinition(text)) return 0
  const window = text.slice(0, 2500)
  const patterns = [
    /consequently it denotes\s+/i,
    /;\s+to\s+[a-z]/,
    /\bdenotes\s+/i,
    /\bit signifies\s+/i,
    /(?<![\d.])1\.\s+[A-Za-z]/,
  ]
  const starts = patterns
    .map((pattern) => window.search(pattern))
    .filter((index) => index >= 0)
  if (starts.length === 0) return 0
  const earliest = Math.min(...starts)
  return earliest < 220 ? 0 : earliest
}

function thayerEntry(parts, lemma) {
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim()
  const start = definitionStart(joined)
  let text = joined.slice(start).replace(/^[,;:\s]+/, '')
  if (start > 0 && lemma && !text.startsWith(lemma)) {
    text = `${lemma}. ${text}`
  }
  text = text.replace(/\. consequently it denotes /g, '. It denotes ')
  return clip(tidyLexiconText(text), STORE_LIMIT)
}

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
}

function cleanBdb(html) {
  let text = decodeEntities(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h\d)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
  text = decodeEntities(text)
    .replace(/[\u200e\u200f]/g, '')
    .replace(/[\u1d00-\u1dbf]\d*/g, '')
    .replace(/([\u0590-\u05FF])(\d)/g, '$1 $2')
    .replace(/\(\s*[,;:]?\s*\)/g, '')
    .replace(/^H\d+\.\s*/, '')
  return text.replace(/\s+/g, ' ').trim()
}

async function downloadJson(url) {
  console.log(`Fetching ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

function buildThayer(entries) {
  const parts = new Map()
  for (const entry of entries) {
    const id = entry?.id || ''
    if (!/^G\d+$/.test(id)) continue
    if (!parts.has(id)) parts.set(id, { lemma: entry.lemma || '', chunks: [] })
    if (entry.text) parts.get(id).chunks.push(entry.text)
    if (!parts.get(id).lemma && entry.lemma) parts.get(id).lemma = entry.lemma
  }
  const out = {}
  for (const [id, group] of parts) {
    const text = thayerEntry(group.chunks, group.lemma)
    if (text.length >= 40) out[id] = text
  }
  return out
}

function buildBdb(entries) {
  const out = {}
  for (const entry of entries) {
    const id = String(entry?.top || '')
    if (!/^H\d+$/.test(id)) continue
    const text = clip(tidyLexiconText(cleanBdb(entry.def || '')), STORE_LIMIT)
    if (text.length >= 40) out[id] = text
  }
  return out
}

const [thayerRaw, bdbRaw] = await Promise.all([
  downloadJson(THAYER_URL),
  downloadJson(BDB_URL),
])

const thayer = buildThayer(thayerRaw)
const bdb = buildBdb(bdbRaw)
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(path.join(OUT_DIR, 'thayer.json'), JSON.stringify(thayer))
fs.writeFileSync(path.join(OUT_DIR, 'bdb.json'), JSON.stringify(bdb))

const samples = ['G26', 'G25', 'G2532', 'G3056', 'G2424', 'H430', 'H7225', 'H1254']
for (const id of samples) {
  const text = thayer[id] || bdb[id] || '(missing)'
  console.log(`\n${id}\n${text.slice(0, 420)}`)
}
console.log(`\nThayer ${Object.keys(thayer).length}  BDB ${Object.keys(bdb).length}`)
for (const name of ['thayer.json', 'bdb.json']) {
  const file = path.join(OUT_DIR, name)
  console.log(`${name} ${(fs.statSync(file).size / 1024 / 1024).toFixed(2)} MB`)
}
