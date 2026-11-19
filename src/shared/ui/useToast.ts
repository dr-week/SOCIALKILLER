import { toast } from 'vue-sonner'

export type ToastKind = 'info' | 'success' | 'error'

export function useToast() {
  function pushToast(message: string, kind: ToastKind = 'info', duration = 3600) {
    const clean = message.trim()
    if (!clean) return
    if (kind === 'success') return toast.success(clean, { duration })
    if (kind === 'error') return toast.error(clean, { duration })
    return toast(clean, { duration })
  }

  function dismissToast(id?: string | number) {
    toast.dismiss(id)
  }

  return { pushToast, dismissToast }
}
