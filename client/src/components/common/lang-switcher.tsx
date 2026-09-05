import { cn } from '@/lib/utils'
import { useLocaleStore, type Lang } from '@/store/locale'

const LANGS: { value: Lang; label: string }[] = [
  { value: 'ru', label: 'RU' },
  { value: 'uz', label: 'UZ' },
]

export function LangSwitcher({ className }: { className?: string }) {
  const lang = useLocaleStore((s) => s.lang)
  const setLang = useLocaleStore((s) => s.setLang)

  return (
    <div className={cn('inline-flex overflow-hidden rounded-md border border-line', className)}>
      {LANGS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setLang(item.value)}
          aria-pressed={lang === item.value}
          className={cn(
            'px-2 py-1 text-[12px] font-medium transition-colors',
            lang === item.value ? 'bg-accent text-white' : 'text-muted hover:text-ink',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
