#!/usr/bin/env node
// 정적 서버 (no-cache). 리포 루트에서 실행:  node design/thumbnails/serve.mjs
//
// python3 -m http.server 는 Cache-Control 을 안 보내서 브라우저가 shared/thumb.js
// 같은 모듈을 캐시한다. 그러면 export 를 추가해도 브라우저는 옛 파일을 들고 있어
// `import { newThing }` 이 SyntaxError 로 죽고, 페이지가 통째로 빈 화면이 된다.
// 매번 하드 리로드하는 대신 서버가 no-store 를 보내게 한다.
import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const ROOT = process.cwd()
const PORT = Number(process.env.PORT ?? 8788)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  // 루트 밖으로 나가는 경로 차단
  const path = join(ROOT, normalize(url).replace(/^(\.\.[/\\])+/, ''))
  if (!path.startsWith(ROOT)) {
    res.writeHead(403).end('forbidden')
    return
  }
  let target = path
  try {
    if (statSync(target).isDirectory()) target = join(target, 'index.html')
    statSync(target)
  } catch {
    res.writeHead(404).end('not found')
    return
  }
  res.writeHead(200, {
    'Content-Type': TYPES[extname(target)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store, must-revalidate',
  })
  createReadStream(target).pipe(res)
}).listen(PORT, () => {
  console.log(`no-cache 서버: http://localhost:${PORT}/design/thumbnails/studio.html`)
})
