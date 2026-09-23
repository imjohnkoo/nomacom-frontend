/**
 * 테스트 전용 — 앱 소스를 «글자» 가 아니라 토큰으로 읽는다(앱 코드에서 import 하지 않는다).
 *
 * 정규식으로 주석을 걷으면 문자열 속 `/*`(예: `'/verify/**'`)를 주석 시작으로 읽어 파일 절반을 놓친다.
 * 그래서 TypeScript 스캐너로 주석을 건너뛰고 문자열 · 템플릿 문자열 · 숫자 토큰을 모은다.
 * `.vue` 는 SFC 파서로 `<script>` · `<script setup>` · `<template>` 을 나눈다.
 */
import { readFileSync } from 'node:fs'
import { parse as parseSfc } from '@vue/compiler-sfc'
import ts from 'typescript'

export interface ScriptTokens {
  /** 문자열 · 템플릿 문자열 조각의 내용 */
  strings: string[]
  /** 숫자 토큰 — 앞 토큰 두 개 · 뒤 토큰 하나와 함께(`amount` `:` 4900 · `formatWon` `(` 4900 · 4900 `}원\``) */
  numbers: { text: string; before: [string, string]; after: string }[]
}

export function scanScript(code: string): ScriptTokens {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, /* skipTrivia */ true)
  scanner.setText(code)
  const strings: string[] = []
  const numbers: ScriptTokens['numbers'] = []
  /** 여는 괄호 종류 — 'b' = 코드 블록 · 객체 `{`, 't' = 템플릿 문자열의 `${` */
  const braces: ('b' | 't')[] = []
  let prev1 = ''
  let prev2 = ''
  let token = scanner.scan()
  while (token !== ts.SyntaxKind.EndOfFileToken) {
    if (token === ts.SyntaxKind.OpenBraceToken) braces.push('b')
    else if (token === ts.SyntaxKind.CloseBraceToken && braces.pop() === 't') {
      // `${…}` 가 닫혔다 — 템플릿 문자열의 나머지를 읽는다(`${a}원` 의 «원»)
      token = scanner.reScanTemplateToken(false)
    }
    if (token === ts.SyntaxKind.TemplateHead || token === ts.SyntaxKind.TemplateMiddle)
      braces.push('t')
    // 값이 올 자리의 `/` 는 정규식이다 — 정규식 안의 따옴표를 문자열 시작으로 읽지 않게
    if (
      (token === ts.SyntaxKind.SlashToken || token === ts.SyntaxKind.SlashEqualsToken) &&
      ['', '(', ',', '=', ':', '[', '!', '&&', '||', '?', '{', '}', ';', 'return', '=>'].includes(
        prev1,
      )
    )
      token = scanner.reScanSlashToken()
    const text = scanner.getTokenText()
    const last = numbers[numbers.length - 1]
    if (last && last.after === '\0') last.after = text
    switch (token) {
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      case ts.SyntaxKind.TemplateHead:
      case ts.SyntaxKind.TemplateMiddle:
      case ts.SyntaxKind.TemplateTail:
        strings.push(scanner.getTokenValue())
        break
      case ts.SyntaxKind.NumericLiteral:
        numbers.push({ text, before: [prev2, prev1], after: '\0' })
        break
    }
    prev2 = prev1
    prev1 = text
    token = scanner.scan()
  }
  return { strings, numbers }
}

export interface SourceParts {
  script: ScriptTokens
  /** `.vue` 의 `<template>` 원문(HTML 주석 제거) — `.ts` 면 '' */
  template: string
}

export function readSource(file: string): SourceParts {
  const src = readFileSync(file, 'utf8')
  if (!file.endsWith('.vue')) return { script: scanScript(src), template: '' }
  const { descriptor } = parseSfc(src, { filename: file })
  const code = [descriptor.script?.content ?? '', descriptor.scriptSetup?.content ?? ''].join('\n')
  const template = (descriptor.template?.content ?? '').replace(/<!--[\s\S]*?-->/g, '')
  return { script: scanScript(code), template }
}
