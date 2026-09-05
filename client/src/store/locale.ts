import { create } from 'zustand'

export type Lang = 'ru' | 'uz'

const STORAGE_KEY = 'jewelry-lang'

function getInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ru' || stored === 'uz') return stored
  return navigator.language.toLowerCase().startsWith('uz') ? 'uz' : 'ru'
}

function applyLang(lang: Lang) {
  document.documentElement.lang = lang
  localStorage.setItem(STORAGE_KEY, lang)
}

interface LocaleState {
  lang: Lang
  setLang: (lang: Lang) => void
}

const initial = getInitialLang()
applyLang(initial)

export const useLocaleStore = create<LocaleState>((set) => ({
  lang: initial,
  setLang: (lang) => {
    applyLang(lang)
    set({ lang })
  },
}))
