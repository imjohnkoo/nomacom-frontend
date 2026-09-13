/* ====================================================================
   export.js — wire up PNG export buttons via data-export attribute.
   Usage:
     <button class="dev-toolbar__btn" data-export="<slug>">…</button>
     <div id="export-target">…</div>

   - Reads target via [data-export-target] OR falls back to #export-target.
   - Filename: esim-detail-<slug>-<timestamp>.png
   - pixelRatio 2 for retina.
   - Strips .placeholder elements during export (via .is-exporting on body).
   - Query params:
       ?embed=1       → hides toolbar, used by product gallery iframes
       ?auto-export=1 → auto-fires the FIRST data-export button on load
   ==================================================================== */
;(function () {
  const params = new URLSearchParams(location.search)

  if (params.get('embed') === '1') {
    document.documentElement.classList.add('is-embed')
  }

  async function exportNode(node, slug, btn) {
    if (!node) {
      console.error('[export] target node not found')
      return
    }
    if (typeof window.htmlToImage === 'undefined') {
      console.error('[export] html-to-image is not loaded')
      return
    }
    if (btn) {
      btn.disabled = true
      btn.classList.add('is-busy')
    }
    document.body.classList.add('is-exporting')
    try {
      const dataUrl = await window.htmlToImage.toPng(node, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `esim-detail-${slug}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('[export] failed', err)
      window.alert('PNG 변환 실패: ' + (err && err.message ? err.message : String(err)))
    } finally {
      document.body.classList.remove('is-exporting')
      if (btn) {
        btn.disabled = false
        btn.classList.remove('is-busy')
      }
    }
  }

  function getTargetFor(btn) {
    const sel = btn.getAttribute('data-export-target')
    if (sel) {
      return document.querySelector(sel)
    }
    return document.getElementById('export-target')
  }

  function wire() {
    const buttons = document.querySelectorAll('[data-export]')
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-export') || 'section'
        const node = getTargetFor(btn)
        exportNode(node, slug, btn)
      })
    })

    if (params.get('auto-export') === '1') {
      const first = document.querySelector('[data-export]')
      if (first) {
        // Wait one tick so fonts / images settle before capture
        setTimeout(() => first.click(), 800)
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire)
  } else {
    wire()
  }
})()
