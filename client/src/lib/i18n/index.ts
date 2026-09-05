import { useMemo } from 'react'
import { useLocaleStore, type Lang } from '@/store/locale'
import { dict } from './dict'

export type TKey = keyof typeof dict
export type TParams = Record<string, string | number>
export type TFunc = (key: TKey, params?: TParams) => string

const LANG_INDEX: Record<Lang, 0 | 1> = { ru: 0, uz: 1 }

export function translate(lang: Lang, key: TKey, params?: TParams): string {
  const entry = dict[key]
  // Ключ может прийти из сообщения zod-схемы, где встречаются и собственные тексты zod —
  // тогда показываем сам ключ, а не падаем.
  if (!entry) return String(key)
  let text: string = entry[LANG_INDEX[lang]]
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}

/** Основной способ получить переводы в компоненте: подписывается на выбранный язык,
 *  поэтому смена языка перерисовывает компонент. */
export function useT(): TFunc {
  const lang = useLocaleStore((s) => s.lang)
  return useMemo<TFunc>(() => (key, params) => translate(lang, key, params), [lang])
}

export function useLang(): Lang {
  return useLocaleStore((s) => s.lang)
}

/** Для кода вне React (форматтеры, перехватчики axios) — читает язык из стора напрямую. */
export function t(key: TKey, params?: TParams): string {
  return translate(useLocaleStore.getState().lang, key, params)
}
