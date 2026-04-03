# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Toolkit — a Chrome Extension (Manifest V3) providing developer encoding/formatting tools via a Popup UI. Built with Vue 3 + TypeScript + Vite.

## Commands

- `npm run dev` — Start dev server with HMR
- `npm run build` — Production build to `dist/`
- Load the extension in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select `dist/`

## Architecture

- **Popup-only UI**: All interaction happens in the browser action popup (400px wide, max 580px tall)
- **Vue Router** with `createMemoryHistory()`: `/` is the tool grid home, `/tool/:id` renders individual tools
- **Tool registry** (`src/tools/_registry.ts`): Array of `ToolConfig` objects. Each tool is a self-contained Vue component in its own directory under `src/tools/`
- **Adding a new tool**: Create a Vue component in `src/tools/<tool-name>/`, add a `ToolConfig` entry to the registry
- **Chrome APIs**: Only `chrome.storage.local` for persistence (via `src/shared/storage.ts`)

## Key Files

- `src/manifest.json` — Chrome extension manifest
- `vite.config.ts` — Build config using `@crxjs/vite-plugin`
- `src/tools/_registry.ts` — Central tool registry (tool configs + category metadata)
- `src/shared/types.ts` — `ToolConfig`, `Category`, `CATEGORY_LABELS`, `CATEGORY_ORDER`
- `src/styles/variables.css` — Design system CSS variables (colors, spacing, typography, radii)
- `src/styles/components.css` — Shared component styles (buttons, inputs, cards, toast, code output)

## Design System

Dark theme (Raycast/Arc inspired). All styling uses CSS variables from `variables.css`. No UI framework. Components use shared CSS classes (`.btn`, `.btn-primary`, `.btn-secondary`, `.input`, `.textarea`, `.card`, `.code-output`, `.tool-layout`, `.tool-actions`).

## Tool Categories

encode-decode | format | generator | convert | crypto | regex

## Notes

- Path alias: `@/` maps to `src/`
- Icons are currently not configured in manifest (no icon files)
- `src/popup/components/Toast.vue` is the global toast notification component
- `src/shared/useToast.ts` provides the `useToast()` composable
- `src/shared/clipboard.ts` provides `copyToClipboard()` utility
