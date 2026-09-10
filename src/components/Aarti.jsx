import { useEffect, useState, useMemo } from 'react'
import data from '../data/aartis.json'
import { useI18n } from '../i18n'
import {
  aartiInAnySinglist,
  addItemToSinglist,
  createSinglist,
  getActiveSinglistId,
  getSinglists,
  removeItemFromSinglist,
  setActiveSinglistId,
} from '../utils/singlists'

const LANGS = { mr: 'मराठी', hi: 'हिंदी', sa: 'संस्कृत' }

// Helper: Convert Arabic numerals to Devanagari numerals for verse markers
const toDevanagariDigit = (num) => {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
  return String(num).replace(/\d/g, (d) => digits[d])
}

// Line & Word Spacing Presets
const SPACING_PRESETS = {
  compact: { label: 'Compact', lineHeight: 1.6, wordSpacing: '0px' },
  normal: { label: 'Normal', lineHeight: 1.9, wordSpacing: '1px' },
  relaxed: { label: 'Relaxed', lineHeight: 2.3, wordSpacing: '2.5px' },
}

export default function Aarti({ onBack, deityId, aartiId, onSelectDeity, onSelectAarti }) {
  const { t } = useI18n()

  // UI & Selection States
  const [target, setTarget] = useState(null)
  const [notice, setNotice] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [langFilter, setLangFilter] = useState("mr")
  const [searchQuery, setSearchQuery] = useState('')

  // Readability State: Adjustable Font Size (16px to 24px) & Line Spacing
  const [fontSize, setFontSize] = useState(19)
  const [spacingMode, setSpacingMode] = useState('normal')

  // Singlists State Manager
  const [lists, setLists] = useState(() => getSinglists())
  const activeId = getActiveSinglistId()

  const deity = useMemo(() => data.deities.find((d) => d.id === deityId), [deityId])
  const aarti = useMemo(() => deity?.aartis.find((a) => a.id === aartiId), [deity, aartiId])

  // Screen Wake Lock API: Prevent screen sleep while viewing lyrics
  useEffect(() => {
    let wakeLock = null
    if (aarti && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((lock) => {
        wakeLock = lock
      }).catch(() => {})
    }
    return () => {
      if (wakeLock) wakeLock.release()
    }
  }, [aarti])

  // Filtered Aartis List
  const filteredAartis = useMemo(() => {
    if (!deity) return []
    return deity.aartis.filter((a) => {
      const matchesLang = !langFilter || a.lang === langFilter
      const matchesSearch = !searchQuery ||
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesLang && matchesSearch
    })
  }, [deity, langFilter, searchQuery])

  // Group raw lyric lines into structured stanzas separated by empty lines
  const stanzas = useMemo(() => {
    if (!aarti?.lines?.length) return []
    const groups = []
    let current = []

    aarti.lines.forEach((line) => {
      if (line.trim() === '') {
        if (current.length > 0) {
          groups.push(current)
          current = []
        }
      } else {
        current.push(line)
      }
    })
    if (current.length > 0) groups.push(current)
    return groups
  }, [aarti])

  const refreshLists = () => setLists(getSinglists())

  function openPicker(d, a) {
    setTarget({ deityId: d.id, deityName: d.name, aartiId: a.id, title: a.title, subtitle: a.subtitle, lang: a.lang })
    refreshLists()
    setNotice(null)
  }

  function inList(sl) {
    return target && sl.items.some((i) => i.deityId === target.deityId && i.aartiId === target.aartiId)
  }

  function toggleList(slId) {
    const sl = lists.find((s) => s.id === slId)
    if (!sl || !target) return

    if (inList(sl)) {
      const item = sl.items.find((i) => i.deityId === target.deityId && i.aartiId === target.aartiId)
      if (item) removeItemFromSinglist(slId, item.id)
      setNotice(t('aarti.removedFrom', { name: sl.name }))
    } else {
      addItemToSinglist(slId, target)
      setNotice(t('aarti.addedTo', { name: sl.name }))
    }
    refreshLists()
  }

  function handleCreateList(name) {
    const sl = createSinglist(name || 'Singlist')
    if (target) addItemToSinglist(sl.id, target)
    setActiveSinglistId(sl.id)
    setNotice(t('aarti.addedTo', { name: sl.name }))
    refreshLists()
  }

  // Cycle line spacing mode between 'compact', 'normal', and 'relaxed'
  const toggleSpacing = () => {
    const modes = ['compact', 'normal', 'relaxed']
    const nextIdx = (modes.indexOf(spacingMode) + 1) % modes.length
    setSpacingMode(modes[nextIdx])
  }

  const currentSpacing = SPACING_PRESETS[spacingMode]
  const shareUrl = () => `${window.location.origin}${window.location.pathname}#/aarti/${deity?.id}/${aarti?.id}`

  return (
      <div className="mx-auto max-w-2xl space-y-4 pb-12">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-border/60 pb-3">
          {deity ? (
              <button
                  className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-brown transition-colors"
                  onClick={() => (aarti ? onSelectAarti(null) : onSelectDeity(null))}
              >
                ← {aarti ? t('aarti.backList') : t('aarti.backDeities')}
              </button>
          ) : (
              <button className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-brown transition-colors" onClick={onBack}>
                ← {t('common.home')}
              </button>
          )}

          <h2 className="text-base sm:text-lg font-bold text-brown truncate max-w-[200px]">
            {aarti ? aarti.title : deity ? `${deity.emoji} ${deity.name}` : t('aarti.title')}
          </h2>

          <div className="flex items-center gap-1.5">
            {/* Font Scaler & Line Spacing Controls when viewing Aarti Lyrics */}
            {aarti && (
                <>
                  {/* Dynamic Font Scaler Widget */}
                  <div className="flex items-center gap-1 rounded-xl bg-amber-100/60 p-1 border border-amber-200/60">
                    <button
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-50 disabled:opacity-40"
                        disabled={fontSize <= 16}
                        onClick={() => setFontSize((s) => Math.max(16, s - 2))}
                        title="Decrease Text Size"
                    >
                      A-
                    </button>
                    <span className="px-1 text-[11px] font-bold text-amber-900">{fontSize}px</span>
                    <button
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-50 disabled:opacity-40"
                        disabled={fontSize >= 24}
                        onClick={() => setFontSize((s) => Math.min(24, s + 2))}
                        title="Increase Text Size"
                    >
                      A+
                    </button>
                  </div>

                  {/* Line / Word Spacing Mode Toggle Button */}
                  <button
                      className="flex h-9 items-center gap-1 rounded-xl bg-amber-100/60 px-2 py-1 border border-amber-200/60 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 transition-colors"
                      onClick={toggleSpacing}
                      title="Change Word & Line Spacing"
                  >
                    ↔️ <span className="hidden sm:inline">{currentSpacing.label}</span>
                  </button>
                </>
            )}

            {aarti ? (
                <button
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/60 text-sm text-brown hover:bg-amber-100 transition-colors"
                    title={t('aarti.share')}
                    onClick={() => setShareOpen(true)}
                >
                  📤
                </button>
            ) : (
                <div className="w-8" />
            )}
          </div>
        </header>

        {/* Main View: Deities Grid Selection */}
        {!deity && (
            <section className="space-y-3">
              <p className="text-xs font-medium text-gray-500">{t('aarti.subtitle')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.deities.map((d) => (
                    <button
                        key={d.id}
                        className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-sm active:scale-98"
                        onClick={() => onSelectDeity(d.id)}
                    >
                      <span className="text-3xl mb-1">{d.emoji}</span>
                      <span className="text-sm font-bold text-brown">{d.name}</span>
                      <span className="text-[11px] text-gray-400">{d.nameEn}</span>
                      <span className="mt-2 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200/50">
                        {t('aarti.count', { n: d.aartis.length })}
                      </span>
                    </button>
                ))}
              </div>
            </section>
        )}

        {/* Main View: Aartis List for Chosen Deity */}
        {deity && !aarti && (
            <section className="space-y-3">
              <div className="space-y-2">
                <input
                    type="text"
                    className="w-full rounded-xl border border-border bg-white px-3.5 py-2 text-xs outline-none focus:border-amber-400"
                    placeholder={t('aarti.searchPlaceholder') || "Search Aartis..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex flex-wrap gap-1.5">
                  <button
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${langFilter === null ? 'bg-brown text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      onClick={() => setLangFilter(null)}
                  >
                    All
                  </button>
                  {Object.entries(LANGS).map(([code, label]) => {
                    const count = deity.aartis.filter((a) => a.lang === code).length
                    if (!count) return null
                    return (
                        <button
                            key={code}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${langFilter === code ? 'bg-brown text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            onClick={() => setLangFilter(langFilter === code ? null : code)}
                        >
                          {label} ({count})
                        </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                {filteredAartis.map((a, index) => {
                  const inAny = aartiInAnySinglist(deity.id, a.id)
                  return (
                      <div key={a.id} className="rounded-2xl border border-border/60 bg-white p-3.5 shadow-xs transition-all hover:border-amber-200">
                        <button className="w-full text-left" onClick={() => onSelectAarti(a.id)}>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-brown">{index+1}) {a.title}</strong>
                            {inAny && <span className="h-2 w-2 rounded-full bg-primary" title={t('aarti.inSinglist')} />}
                          </div>
                        </button>
                      </div>
                  )
                })}
              </div>
            </section>
        )}

        {/* Main View: Single Aarti Lyrics Display (Enhanced Readability) */}
        {deity && aarti && (
            <article
                className="rounded-3xl border border-amber-200/80 bg-[#FFFDF7] p-5 sm:p-7 shadow-sm space-y-6"
                style={{ fontFamily: "'Noto Serif Devanagari', 'Mukta', 'Mangal', serif" }}
            >
              {/* Lyric Header */}
              <div className="text-center space-y-2 border-b border-amber-100 pb-4">
                <p className="text-xs font-bold tracking-wide text-amber-800/80 uppercase">
                  {deity.name} · {LANGS[aarti.lang] || aarti.lang}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-[#2C1D11] tracking-wide">
                  {aarti.title}
                </h2>
                <div className="pt-1">
                  <button
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100/80 px-3.5 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-200/80 active:scale-95"
                      onClick={() => openPicker(deity, aarti)}
                  >
                    ➕ {t('aarti.addTo')}
                  </button>
                </div>
              </div>

              {/* Grouped Stanza Lyric Display with Customizable Line & Word Spacing */}
              {stanzas.length > 0 ? (
                  <div className="space-y-6 py-2">
                    {stanzas.map((stanza, sIdx) => (
                        <div
                            key={sIdx}
                            className="relative rounded-2xl bg-amber-50/40 p-4 border border-amber-100/60 shadow-xs text-center space-y-1.5 transition-all"
                        >
                          {/* Devanagari Stanza Marker */}
                          <span className="absolute top-2 left-3 text-xs font-bold text-amber-700/50 select-none">
                        {toDevanagariDigit(sIdx + 1)}
                      </span>
                          {stanza.map((line, lIdx) => (
                              <p
                                  key={lIdx}
                                  className="font-semibold text-[#2C1D11] tracking-wide transition-all"
                                  style={{
                                    fontSize: `${fontSize}px`,
                                    lineHeight: currentSpacing.lineHeight,
                                    wordSpacing: currentSpacing.wordSpacing,
                                  }}
                              >
                                {line}
                              </p>
                          ))}
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="space-y-2 text-center py-4">
                    {aarti.lines.map((line, i) =>
                        line.trim() ? (
                            <p
                                key={i}
                                className="font-semibold text-[#2C1D11] tracking-wide transition-all"
                                style={{
                                  fontSize: `${fontSize}px`,
                                  lineHeight: currentSpacing.lineHeight,
                                  wordSpacing: currentSpacing.wordSpacing,
                                }}
                            >
                              {line}
                            </p>
                        ) : (
                            <div key={`gap-${i}`} className="h-4" />
                        )
                    )}
                  </div>
              )}
            </article>
        )}

        {/* Singlist Picker Modal */}
        {target && (
            <SinglistModal
                t={t}
                lists={lists}
                activeId={activeId}
                notice={notice}
                inList={inList}
                onClose={() => setTarget(null)}
                onToggle={toggleList}
                onCreate={handleCreateList}
                onSetActive={(id) => {
                  setActiveSinglistId(id)
                  refreshLists()
                }}
            />
        )}

        {/* Share Modal */}
        {shareOpen && (
            <ShareModal
                t={t}
                url={shareUrl()}
                title={aarti?.title}
                deityName={deity?.name}
                onClose={() => setShareOpen(false)}
            />
        )}
      </div>
  )
}

// Extracted Sub-component: Playlist Picker Modal
function SinglistModal({ t, lists, activeId, notice, inList, onClose, onToggle, onCreate, onSetActive }) {
  const [newName, setNewName] = useState('')

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs" onClick={onClose}>
        <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="text-base font-bold text-brown">📋 {t('sing.addToWhich')}</h3>
            <button className="text-sm font-bold text-gray-400 hover:text-brown" onClick={onClose}>✕</button>
          </div>

          {notice && <p className="rounded-xl bg-amber-50 p-2 text-center text-xs font-bold text-amber-800 border border-amber-200/60">{notice}</p>}
          {lists.length === 0 && <p className="text-center text-xs text-gray-500 py-2">{t('sing.emptyHint2')}</p>}

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {lists.map((sl) => {
              const isActive = sl.id === activeId
              const isAdded = inList(sl)
              return (
                  <div key={sl.id} className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 transition-colors ${isActive ? 'border-amber-300 bg-amber-50/50' : 'border-border/60 bg-white'}`}>
                    <button
                        className={`text-base ${isActive ? 'text-amber-600' : 'text-gray-300 hover:text-gray-500'}`}
                        onClick={() => onSetActive(sl.id)}
                    >
                      {isActive ? '★' : '☆'}
                    </button>
                    <div className="flex-1 overflow-hidden text-left">
                      <span className="block truncate text-xs font-bold text-brown">{sl.emoji} {sl.name}</span>
                      <span className="text-[10px] text-gray-400">{t('sing.itemCount', { n: sl.items.length })}</span>
                    </div>
                    <button
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${isAdded ? 'bg-green-600 text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                        onClick={() => onToggle(sl.id)}
                    >
                      {isAdded ? '✔' : '＋'}
                    </button>
                  </div>
              )
            })}
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/60">
            <input
                className="flex-1 rounded-xl border border-border px-3 py-1.5 text-xs outline-none focus:border-amber-400"
                value={newName}
                placeholder={t('sing.namePlaceholder')}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onCreate(newName)
                    setNewName('')
                  }
                }}
            />
            <button className="rounded-xl bg-brown px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brown/90" onClick={() => { onCreate(newName); setNewName('') }}>
              ＋ {t('sing.newSinglist')}
            </button>
          </div>
        </div>
      </div>
  )
}

// Extracted Sub-component: Share Modal
function ShareModal({ t, url, title, deityName, onClose }) {
  const [shareMsg, setShareMsg] = useState(null)

  function copyLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareMsg(t('sing.copied'))
        setTimeout(() => setShareMsg(null), 2500)
      })
    }
  }

  function shareWhatsApp() {
    const text = `${deityName} · ${title} — Ganpati Bappa Morya 🙏\n${url}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    onClose()
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs" onClick={onClose}>
        <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="text-base font-bold text-brown">📤 {t('aarti.shareTitle')}</h3>
            <button className="text-sm font-bold text-gray-400 hover:text-brown" onClick={onClose}>✕</button>
          </div>

          <div className="rounded-xl bg-cream p-2.5 text-center font-mono text-xs text-brown break-all border border-border/60">
            {url}
          </div>

          <div className="flex gap-2 pt-1">
            <button className="flex-1 rounded-xl bg-green-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-green-700" onClick={shareWhatsApp}>
              💬 {t('aarti.shareWhatsapp')}
            </button>
            <button className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-brown hover:bg-cream" onClick={copyLink}>
              🔗 {t('aarti.copyLink')}
            </button>
          </div>

          {shareMsg && <p className="text-center text-xs font-bold text-green-600">{shareMsg}</p>}
        </div>
      </div>
  )
}