<template>
  <div :class="['n-qrcode', `n-qrcode--${size}`]">
    <canvas ref="canvasRef" />
    <slot name="overlay" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

export interface NQRCodeProps {
  value: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  backgroundColor?: string
}

const props = withDefaults(defineProps<NQRCodeProps>(), {
  size: 'md',
  color: '#000000',
  backgroundColor: '#ffffff',
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

const sizeMap: Record<string, number> = { sm: 128, md: 200, lg: 280 }

function getPixelSize(): number {
  return sizeMap[props.size] || 200
}

// Simple QR code placeholder renderer (generates a visual grid pattern)
// In production, integrate with a real QR library like 'qrcode'
function render() {
  const canvas = canvasRef.value
  if (!canvas) return

  const px = getPixelSize()
  canvas.width = px
  canvas.height = px

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Fill background
  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, px, px)

  // Draw QR-like pattern based on value hash
  ctx.fillStyle = props.color
  const modules = 25
  const moduleSize = px / modules
  const margin = 2

  // Generate deterministic pattern from value
  let hash = 0
  for (let i = 0; i < props.value.length; i++) {
    const char = props.value.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  // Draw finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (x: number, y: number) => {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const isOuter = row === 0 || row === 6 || col === 0 || col === 6
        const isInner = row >= 2 && row <= 4 && col >= 2 && col <= 4
        if (isOuter || isInner) {
          ctx.fillRect(
            (x + col + margin) * moduleSize,
            (y + row + margin) * moduleSize,
            moduleSize,
            moduleSize,
          )
        }
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(modules - 7 - margin * 2, 0)
  drawFinder(0, modules - 7 - margin * 2)

  // Fill data area with hash-based pattern
  let seed = Math.abs(hash)
  for (let row = 0; row < modules - margin * 2; row++) {
    for (let col = 0; col < modules - margin * 2; col++) {
      // Skip finder pattern areas
      if (row < 8 && col < 8) continue
      if (row < 8 && col > modules - margin * 2 - 8) continue
      if (row > modules - margin * 2 - 8 && col < 8) continue

      seed = (seed * 16807 + 11) % 2147483647
      if (seed % 3 !== 0) {
        ctx.fillRect(
          (col + margin) * moduleSize,
          (row + margin) * moduleSize,
          moduleSize,
          moduleSize,
        )
      }
    }
  }
}

onMounted(render)
watch(() => props.value, render)
watch(() => props.size, render)
</script>

<style scoped>
.n-qrcode {
  display: inline-flex;
  position: relative;
  border: var(--borderWidth-1, 1px) solid var(--color-neutral-200, #e5e5e5);
  border-radius: var(--radius-lg, 0.5rem);
  padding: var(--spacing-2, 0.5rem);
  background-color: var(--color-neutral-0, #ffffff);
}

.n-qrcode canvas {
  display: block;
}

.n-qrcode--sm canvas { width: 128px; height: 128px; }
.n-qrcode--md canvas { width: 200px; height: 200px; }
.n-qrcode--lg canvas { width: 280px; height: 280px; }
</style>
