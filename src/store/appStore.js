import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const LEGACY_LANG_KEY = 'ganpati-ui-lang'
const STORE_KEY = 'ganpati-app-store'

const LANGS = ['en', 'hi', 'kn', 'mr']

export const SPACING_PRESETS = {
  compact: { label: 'Compact', lineHeight: 1.6, wordSpacing: '0px' },
  normal: { label: 'Normal', lineHeight: 1.9, wordSpacing: '1px' },
  relaxed: { label: 'Relaxed', lineHeight: 2.3, wordSpacing: '2.5px' },
}

export const FONT_SIZE = { min: 16, max: 24, step: 2, default: 19 }

function legacyLang() {
  try {
    const v = localStorage.getItem(LEGACY_LANG_KEY)
    return v && LANGS.includes(v) ? v : null
  } catch {
    return null
  }
}

export const useAppStore = create(
  persist(
    (set) => ({
      lang: legacyLang() || 'mr',
      fontSize: FONT_SIZE.default,
      spacingMode: 'normal',
      setLang: (lang) => set({ lang }),
      setFontSize: (fontSize) => set({ fontSize }),
      setSpacingMode: (spacingMode) => set({ spacingMode }),
    }),
    { name: STORE_KEY }
  )
)