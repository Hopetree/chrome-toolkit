import { provide, inject, ref, type InjectionKey, type Ref } from 'vue'

type ToastFn = (msg: string, duration?: number) => void

const toastKey: InjectionKey<Ref<ToastFn | null>> = Symbol('toast')

export function provideToast(fn: ToastFn) {
  provide(toastKey, ref(fn))
}

export function useToast(): ToastFn {
  const fn = inject(toastKey)
  if (!fn?.value) {
    return (msg: string) => console.warn('[Toast]', msg)
  }
  return fn.value
}
