<template>
  <div class="tool-layout">
    <!-- Color preview + input fields row -->
    <div class="color-top">
      <div
        class="color-preview"
        :style="{ backgroundColor: previewColor }"
      ></div>

      <div class="inputs-column">
        <!-- HEX -->
        <div class="input-group">
          <label class="input-label">HEX</label>
          <div class="input-with-action">
            <input
              v-model="hexInput"
              class="input mono"
              placeholder="#FF8800"
              @input="onHexInput"
            />
            <button class="btn btn-secondary btn-sm" @click="copyValue(hexInput)">复制</button>
          </div>
        </div>

        <!-- RGB -->
        <div class="input-group">
          <label class="input-label">RGB</label>
          <div class="input-with-action">
            <input
              :value="rgbText"
              class="input mono"
              placeholder="255, 136, 0"
              @input="onRgbTextInput"
            />
            <button class="btn btn-secondary btn-sm" @click="copyValue(rgbText)">复制</button>
          </div>
        </div>

        <!-- HSL -->
        <div class="input-group">
          <label class="input-label">HSL</label>
          <div class="input-with-action">
            <input
              :value="hslText"
              class="input mono"
              placeholder="33, 100%, 50%"
              @input="onHslTextInput"
            />
            <button class="btn btn-secondary btn-sm" @click="copyValue(hslText)">复制</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from '@/shared/useToast'
import { copyToClipboard } from '@/shared/clipboard'

const toast = useToast()

// State
const hexInput = ref('#3b82f6')
const r = ref(59)
const g = ref(130)
const b = ref(182)
const h = ref(217)
const s = ref(92)
const l = ref(47)

// Derived display strings
const rgbText = computed(() => `${r.value}, ${g.value}, ${b.value}`)
const hslText = computed(() => `${h.value}, ${s.value}%, ${l.value}%`)
const previewColor = computed(() => {
  const hr = parseInt(hexInput.value.replace('#', ''), 16)
  if (isNaN(hr)) return '#000000'
  return hexInput.value
})

// --- Conversion functions ---

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleaned = hex.trim().replace('#', '')
  // Expand #RGB → #RRGGBB
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2]
  }
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null

  const num = parseInt(cleaned, 16)
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let hh = 0
  let ss = 0
  const ll = (max + min) / 2

  if (delta !== 0) {
    ss = ll > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case rn:
        hh = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6
        break
      case gn:
        hh = ((bn - rn) / delta + 2) / 6
        break
      case bn:
        hh = ((rn - gn) / delta + 4) / 6
        break
    }
  }

  return {
    h: Math.round(hh * 360),
    s: Math.round(ss * 100),
    l: Math.round(ll * 100),
  }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2

  let rr = 0
  let gg = 0
  let bb = 0

  if (h < 60) {
    rr = c; gg = x; bb = 0
  } else if (h < 120) {
    rr = x; gg = c; bb = 0
  } else if (h < 180) {
    rr = 0; gg = c; bb = x
  } else if (h < 240) {
    rr = 0; gg = x; bb = c
  } else if (h < 300) {
    rr = x; gg = 0; bb = c
  } else {
    rr = c; gg = 0; bb = x
  }

  return {
    r: Math.round((rr + m) * 255),
    g: Math.round((gg + m) * 255),
    b: Math.round((bb + m) * 255),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, n))
    return clamped.toString(16).padStart(2, '0').toUpperCase()
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// --- Input handlers ---

function syncFromRgb() {
  const hsl = rgbToHsl(r.value, g.value, b.value)
  h.value = hsl.h
  s.value = hsl.s
  l.value = hsl.l
  hexInput.value = rgbToHex(r.value, g.value, b.value)
}

function onHexInput() {
  const rgb = hexToRgb(hexInput.value)
  if (!rgb) return
  r.value = rgb.r
  g.value = rgb.g
  b.value = rgb.b
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  h.value = hsl.h
  s.value = hsl.s
  l.value = hsl.l
}

function onRgbTextInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  const parts = val.split(',').map((s) => s.trim())
  if (parts.length !== 3) return

  const rn = parseInt(parts[0], 10)
  const gn = parseInt(parts[1], 10)
  const bn = parseInt(parts[2], 10)

  if ([rn, gn, bn].some((n) => isNaN(n))) return

  r.value = Math.max(0, Math.min(255, rn))
  g.value = Math.max(0, Math.min(255, gn))
  b.value = Math.max(0, Math.min(255, bn))
  syncFromRgb()
}

function onHslTextInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  const parts = val.split(',').map((s) => s.trim())

  if (parts.length !== 3) return

  const hn = parseInt(parts[0], 10)
  const sn = parseInt(parts[1], 10)
  const ln = parseInt(parts[2], 10)

  if ([hn, sn, ln].some((n) => isNaN(n))) return

  h.value = Math.max(0, Math.min(360, hn))
  s.value = Math.max(0, Math.min(100, sn))
  l.value = Math.max(0, Math.min(100, ln))

  const rgb = hslToRgb(h.value, s.value, l.value)
  r.value = rgb.r
  g.value = rgb.g
  b.value = rgb.b
  hexInput.value = rgbToHex(rgb.r, rgb.g, rgb.b)
}

async function copyValue(value: string) {
  const ok = await copyToClipboard(value)
  if (ok) toast('已复制')
}
</script>

<style scoped>
.color-top {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
}

.color-preview {
  width: 80px;
  height: 80px;
  min-width: 80px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  transition: background-color 150ms ease;
}

.inputs-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.input-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-with-action {
  display: flex;
  gap: var(--space-2);
}

.input-with-action .input {
  flex: 1;
}

.mono {
  font-family: var(--font-mono);
}
</style>
