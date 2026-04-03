/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface chrome {
  storage: {
    local: {
      get(keys: string | string[]): Promise<Record<string, any>>
      set(items: Record<string, any>): Promise<void>
    }
  }
}
