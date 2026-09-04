import { Toaster as SonnerToaster } from 'sonner'
import { useThemeStore } from '@/store/theme'

export function Toaster() {
  const theme = useThemeStore((s) => s.theme)
  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-surface! border-line! text-ink! rounded-md!',
          description: 'text-muted!',
        },
      }}
    />
  )
}
