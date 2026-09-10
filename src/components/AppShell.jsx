import { LANG_META, useI18n } from '../i18n'

const NAV = [
  { id: 'home', emoji: '🏠' },
  { id: 'aarti', emoji: '🪔' },
  { id: 'singlist', emoji: '📖' },
  { id: 'quiz', emoji: '🏆' },
  { id: 'more', emoji: '☰' },
]

export default function AppShell({ view, onNav, onSettings, children }) {
  const { lang, setLang, t } = useI18n()

  function isActive(id) {
    if (view === id) return true
    if (id === 'more' && (view === 'japa' || view === 'settings')) return true
    return false
  }

  return (
      <div className="min-h-screen bg-cream/40 text-brown font-sans antialiased">
        {/* Header Bar */}
        <header className="sticky top-0 z-50 border-b border-border bg-cream/90 backdrop-blur-md px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 transition-colors">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">

            {/* Brand/Logo */}
            <button
                className="group flex cursor-pointer items-center gap-2.5 rounded-xl p-1 transition-opacity hover:opacity-90 active:scale-95"
                onClick={() => onNav('home')}
                aria-label={t('common.home')}
            >
            <span
                aria-hidden="true"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover font-serif text-2xl text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105"
            >
              ॐ
            </span>
              <span className="text-xl font-black tracking-tight text-brown">Ganapati</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary Desktop">
              {NAV.map((n) => {
                const active = isActive(n.id)
                return (
                    <button
                        key={n.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                            active
                                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                                : 'text-gray-600 hover:bg-primary/10 hover:text-brown'
                        }`}
                        onClick={() => onNav(n.id)}
                        aria-current={active ? 'page' : undefined}
                    >
                      <span aria-hidden="true">{n.emoji}</span>
                      <span>{t(`nav.${n.id}`)}</span>
                    </button>
                )
              })}
            </nav>

            {/* Settings & Language */}
            <div className="flex items-center gap-2">
              <select
                  className="max-w-[120px] cursor-pointer rounded-full border border-border bg-white px-3 py-2 text-xs font-bold text-brown shadow-sm outline-none transition-all hover:border-primary focus:ring-2 focus:ring-primary/20"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  aria-label={t('home.language')}
              >
                {Object.entries(LANG_META).map(([code, m]) => (
                    <option key={code} value={code}>
                      {m.flag} {m.label}
                    </option>
                ))}
              </select>

              <button
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-lg text-brown shadow-sm transition-all hover:border-primary hover:bg-primary/5 active:scale-95"
                  onClick={onSettings}
                  aria-label={t('settings.title')}
              >
                ⚙
              </button>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="mx-auto max-w-7xl px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-12">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
            className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-white/95 backdrop-blur-md px-1 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden"
            aria-label="Primary Mobile"
        >
          {NAV.map((n) => {
            const active = isActive(n.id)
            return (
                <button
                    key={n.id}
                    className={`flex min-h-[48px] flex-1 cursor-pointer flex-col items-center justify-center rounded-lg py-1 text-[11px] transition-all active:scale-95 ${
                        active
                            ? 'font-bold text-primary'
                            : 'font-medium text-gray-500 hover:text-brown'
                    }`}
                    onClick={() => onNav(n.id)}
                    aria-current={active ? 'page' : undefined}
                >
              <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full text-lg transition-colors ${
                      active ? 'bg-primary/10' : ''
                  }`}
                  aria-hidden="true"
              >
                {n.emoji}
              </span>
                  <span className="mt-0.5">{t(`nav.${n.id}`)}</span>
                </button>
            )
          })}
        </nav>
      </div>
  )
}