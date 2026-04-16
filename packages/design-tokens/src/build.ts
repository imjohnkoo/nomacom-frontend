import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import colors from './colors.json'
import typography from './typography.json'
import spacing from './spacing.json'
import shadows from './shadows.json'
import breakpoints from './breakpoints.json'
import base from './base.json'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '..', 'dist')

// --- Utility: Flatten nested object ---
function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey))
    } else {
      result[newKey] = String(value)
    }
  }
  return result
}

// --- Utility: kebab-case to camelCase ---
function toCamelCase(str: string): string {
  return str.replace(/-([a-zA-Z0-9])/g, (_, char) => char.toUpperCase())
}

// --- Ensure directories ---
function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

// --- Build CSS custom properties ---
function buildCSS() {
  const dir = resolve(distDir, 'css')
  ensureDir(dir)

  const allTokens: Record<string, string> = {
    ...flatten(colors, 'color'),
    ...flatten(typography, 'font'),
    ...flatten(spacing, 'spacing'),
    ...flatten(breakpoints, 'breakpoint'),
    ...flatten(base),
  }

  // Shadows need special handling
  const shadowCSS = Object.entries(shadows)
    .map(([key, val]) => {
      const s = val as { x: string; y: string; blur: string; spread: string; color: string }
      return `  --shadow-${key}: ${s.x} ${s.y} ${s.blur} ${s.spread} ${s.color};`
    })
    .join('\n')

  const tokenCSS = Object.entries(allTokens)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')

  const css = `:root {\n${tokenCSS}\n${shadowCSS}\n}\n`
  writeFileSync(resolve(dir, 'tokens.css'), css, 'utf-8')
  console.log('✅ Built: dist/css/tokens.css')
}

// --- Build JS/TS exports ---
function buildJS() {
  const dir = resolve(distDir, 'js')
  ensureDir(dir)

  const allTokens: Record<string, string> = {
    ...flatten(colors, 'color'),
    ...flatten(typography, 'font'),
    ...flatten(spacing, 'spacing'),
    ...flatten(breakpoints, 'breakpoint'),
    ...flatten(base),
  }

  // Add shadow values as composed strings
  for (const [key, val] of Object.entries(shadows)) {
    const s = val as { x: string; y: string; blur: string; spread: string; color: string }
    allTokens[`shadow-${key}`] = `${s.x} ${s.y} ${s.blur} ${s.spread} ${s.color}`
  }

  const jsLines = Object.entries(allTokens)
    .map(([key, value]) => `export const ${toCamelCase(key)} = '${value}'`)
    .join('\n')

  writeFileSync(resolve(dir, 'index.js'), jsLines + '\n', 'utf-8')

  // TypeScript declarations
  const dtsLines = Object.entries(allTokens)
    .map(([key]) => `export declare const ${toCamelCase(key)}: string`)
    .join('\n')

  writeFileSync(resolve(dir, 'index.d.ts'), dtsLines + '\n', 'utf-8')
  console.log('✅ Built: dist/js/index.js + index.d.ts')
}

// --- Build flat JSON ---
function buildJSON() {
  const dir = resolve(distDir, 'json')
  ensureDir(dir)

  const allTokens: Record<string, any> = {
    colors,
    typography,
    spacing,
    shadows,
    breakpoints,
    ...base,
  }

  writeFileSync(resolve(dir, 'tokens.json'), JSON.stringify(allTokens, null, 2) + '\n', 'utf-8')
  console.log('✅ Built: dist/json/tokens.json')
}

// --- Run build ---
console.log('🔨 Building design tokens...\n')
buildCSS()
buildJS()
buildJSON()
console.log('\n✅ All tokens built successfully!')
