import { useEffect, useState, useMemo } from 'react'
import data from '../data/aartis.json'
import {
  getSinglists,
  getSinglist,
  getActiveSinglist,
  setActiveSinglistId,
  createSinglist,
  deleteSinglist,
  removeItemFromSinglist,
  moveItemInSinglist,
  clearSinglistItems,
  encodeSinglist,
  decodeSinglist,
  importSinglist,
  singlistShareUrl,
} from '../utils/singlists'
import { useI18n } from '../i18n'

const LANGS_LABEL = { mr: 'मराठी', hi: 'हिंदी', sa: 'संस्कृत' }

// Helper: Convert Arabic numerals to Devanagari numerals for verse numbers
const toDevanagariDigit = (num) => {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
  return String(num).replace(/\d/g, (d) => digits[d])
}

export default function SinglistScreen({ onBack }) {
  const { t } = useI18n()
  const [, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  const [activeId, setActiveId] = useState(null)
  const [playingId, setPlayingId] = useState(null)
  const [playIdx, setPlayIdx] = useState(0)
  const [sharingList, setSharingList] = useState(null)

  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')

  const [importOpen, setImportOpen] = useState(false)
  const [importCode, setImportCode] = useState('')
  const [importMsg, setImportMsg] = useState(null)

  const singlists = getSinglists()
  const activeSinglist = getActiveSinglist()
  const currentDetail = useMemo(() => (activeId ? getSinglist(activeId) : null), [activeId, singlists])

  const handleCreate = () => {
    if (!newName.trim()) return
    const sl = createSinglist(newName.trim(), '🎶')
    setActiveSinglistId(sl.id)
    setNewName('')
    setNewOpen(false)
    refresh()
  }

  const handleImport = () => {
    try {
      const sl = decodeSinglist(importCode.trim())
      const created = importSinglist(sl)
      if (created) {
        setActiveSinglistId(created.id)
        setImportMsg({ ok: true })
        setImportCode('')
      } else {
        setImportMsg({ ok: false })
      }
    } catch {
      setImportMsg({ ok: false })
    }
    refresh()
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`${t('sing.deleteConfirm')}\n\n${name}`)) {
      deleteSinglist(id)
      if (activeId === id) setActiveId(null)
      refresh()
    }
  }

  // Active Player View
  if (playingId) {
    const psl = getSinglist(playingId)
    if (psl && psl.items.length > 0) {
      return (
          <SingPlayer
              singlist={psl}
              initialIndex={playIdx}
              onExit={() => setPlayingId(null)}
          />
      )
    }
  }

  // Playlist Items Detail View
  if (currentDetail) {
    return (
        <SinglistDetailView
            detail={currentDetail}
            t={t}
            onBack={() => setActiveId(null)}
            onPlay={(idx) => {
              setActiveSinglistId(currentDetail.id)
              setPlayIdx(idx)
              setPlayingId(currentDetail.id)
            }}
            onMove={(itemId, dir) => {
              moveItemInSinglist(currentDetail.id, itemId, dir)
              refresh()
            }}
            onRemove={(itemId) => {
              removeItemFromSinglist(currentDetail.id, itemId)
              refresh()
            }}
            onClear={() => {
              clearSinglistItems(currentDetail.id)
              refresh()
            }}
            onShare={() => setSharingList(currentDetail)}
        />
    )
  }

  // Main Singlists Overview
  return (
      <div className="mx-auto max-w-2xl space-y-4 pb-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <button
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors hover:text-brown"
              onClick={onBack}
          >
            ← {t('common.home')}
          </button>
          <h2 className="text-lg font-bold text-brown">🎤 {t('sing.title')}</h2>
          <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary transition-transform active:scale-95"
              onClick={() => setNewOpen((v) => !v)}
              aria-label="Create Singlist"
          >
            ＋
          </button>
        </div>

        <p className="text-xs font-medium text-gray-500">{t('sing.subtitle')}</p>

        {/* Inline Create Form */}
        {newOpen && (
            <div className="flex gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 shadow-sm">
              <input
                  type="text"
                  className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  value={newName}
                  maxLength={40}
                  placeholder={t('sing.namePlaceholder')}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
              />
              <button
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover active:scale-95"
                  onClick={handleCreate}
              >
                {t('sing.create')}
              </button>
            </div>
        )}

        {/* Playlists List */}
        {singlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
              <span className="mb-2 text-3xl">📜</span>
              <p className="font-bold text-brown">{t('sing.emptyTitle')}</p>
              <p className="mt-1 text-xs text-gray-500">{t('sing.emptyHint')}</p>
              <button
                  className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 active:scale-95"
                  onClick={() => setNewOpen(true)}
              >
                ＋ {t('sing.newSinglist')}
              </button>
            </div>
        ) : (
            <div className="space-y-2.5">
              {singlists.map((s) => {
                const isActive = activeSinglist && s.id === activeSinglist.id
                return (
                    <div
                        key={s.id}
                        className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                            isActive
                                ? 'border-primary/40 bg-primary/5 shadow-sm'
                                : 'border-border/60 bg-white hover:border-border'
                        }`}
                    >
                      <button
                          className="flex flex-1 items-center gap-3 text-left"
                          onClick={() => setActiveId(s.id)}
                      >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-xl">
                    {s.emoji}
                  </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-brown">{s.name}</strong>
                            {isActive && (
                                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          ✓ {t('aarti.activeBadge')}
                        </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{t('aarti.count', { n: s.items.length })}</p>
                        </div>
                      </button>

                      {/* Card Action Toolbar */}
                      <div className="flex items-center gap-1">
                        <button
                            className={`h-8 w-8 rounded-lg text-sm transition-colors ${
                                isActive ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-cream'
                            }`}
                            onClick={() => {
                              setActiveSinglistId(s.id)
                              refresh()
                            }}
                            title={t('sing.makeActive')}
                        >
                          {isActive ? '★' : '☆'}
                        </button>
                        <button
                            className="h-8 w-8 rounded-lg text-sm text-gray-600 hover:bg-cream disabled:opacity-30"
                            disabled={s.items.length === 0}
                            onClick={() => {
                              setActiveSinglistId(s.id)
                              setPlayingId(s.id)
                            }}
                            title={t('sing.play')}
                        >
                          ▶
                        </button>
                        <button
                            className="h-8 w-8 rounded-lg text-sm text-gray-600 hover:bg-cream"
                            onClick={() => setSharingList(s)}
                            title={t('sing.share')}
                        >
                          🔗
                        </button>
                        <button
                            className="h-8 w-8 rounded-lg text-sm text-red-500 hover:bg-red-50"
                            onClick={() => handleDelete(s.id, s.name)}
                            title={t('sing.delete')}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                )
              })}
            </div>
        )}

        {/* Footer Actions / Import */}
        <div className="pt-2">
          <button
              className="w-full rounded-xl border border-border bg-white py-2.5 text-xs font-bold text-brown shadow-sm transition-all hover:bg-cream active:scale-98"
              onClick={() => setImportOpen((v) => !v)}
          >
            📥 {t('sing.importTitle')}
          </button>
        </div>

        {importOpen && (
            <div className="space-y-2 rounded-2xl border border-border bg-white p-3.5 shadow-sm">
              {importMsg && (
                  <p className={`text-xs font-bold ${importMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                    {importMsg.ok ? t('sing.importSuccess') : t('sing.importError')}
                  </p>
              )}
              <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 rounded-xl border border-border px-3 py-2 text-xs outline-none focus:border-primary"
                    value={importCode}
                    placeholder={t('sing.importPlaceholder')}
                    onChange={(e) => setImportCode(e.target.value)}
                />
                <button
                    className="rounded-xl bg-brown px-4 py-2 text-xs font-bold text-white active:scale-95"
                    onClick={handleImport}
                >
                  {t('sing.importBtn')}
                </button>
              </div>
            </div>
        )}

        {sharingList && <ShareSheet singlist={sharingList} onClose={() => setSharingList(null)} />}
      </div>
  )
}

// Sub-component: Singlist Detail View
function SinglistDetailView({ detail, t, onBack, onPlay, onMove, onRemove, onClear, onShare }) {
  return (
      <div className="mx-auto max-w-2xl space-y-4 pb-8">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <button className="text-sm font-semibold text-gray-600 hover:text-brown" onClick={onBack}>
            ← {t('sing.title')}
          </button>
          <h2 className="text-lg font-bold text-brown">
            {detail.emoji} {detail.name}
          </h2>
          <button className="text-sm font-bold text-gray-400 hover:text-brown" onClick={onBack}>
            ✕
          </button>
        </div>

        <p className="text-xs font-medium text-gray-500">{t('aarti.count', { n: detail.items.length })}</p>

        {detail.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-bold text-brown">{t('sing.emptyTitle')}</p>
              <p className="mt-1 text-xs text-gray-500">{t('sing.emptyHint2')}</p>
            </div>
        ) : (
            <div className="space-y-2">
              {detail.items.map((e, i) => (
                  <div
                      key={e.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-xs"
                  >
                    <button
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary active:scale-95"
                        onClick={() => onPlay(i)}
                        title={t('sing.playFromHere')}
                    >
                      ▶
                    </button>

                    <div className="flex-1 overflow-hidden">
                      <strong className="block truncate text-sm text-brown">{e.title}</strong>
                      <p className="truncate text-xs text-gray-500">
                        {e.deityName} · {e.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                          className="h-8 w-7 text-xs text-gray-400 hover:text-brown disabled:opacity-20"
                          disabled={i === 0}
                          onClick={() => onMove(e.id, -1)}
                      >
                        ↑
                      </button>
                      <button
                          className="h-8 w-7 text-xs text-gray-400 hover:text-brown disabled:opacity-20"
                          disabled={i === detail.items.length - 1}
                          onClick={() => onMove(e.id, 1)}
                      >
                        ↓
                      </button>
                      <button
                          className="h-8 w-7 text-xs text-red-400 hover:text-red-600"
                          onClick={() => onRemove(e.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
              className="flex-1 rounded-xl border border-border bg-white py-2.5 text-xs font-bold text-brown shadow-sm hover:bg-cream"
              onClick={onShare}
          >
            🔗 {t('sing.share')}
          </button>
          <button
              className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-xs font-bold text-red-600 shadow-sm hover:bg-red-100/50"
              onClick={onClear}
          >
            🗑 {t('sing.clear')}
          </button>
        </div>
      </div>
  )
}

// Sub-component: Enhanced Player View for Maximum Readability
function SingPlayer({ singlist, onExit, initialIndex = 0 }) {
  const { t } = useI18n()
  const [idx, setIdx] = useState(Math.max(0, Math.min(initialIndex, singlist.items.length - 1)))
  // Configurable Font Size for Low-Light/Distance Reading (Range: 16px to 24px)
  const [fontSize, setFontSize] = useState(19)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [idx])

  // Keep screen awake while reading Aarti lyrics
  useEffect(() => {
    let wakeLock = null;
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((lock) => {
        wakeLock = lock;
      }).catch(() => {});
    }
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, []);

  const item = singlist.items[Math.min(idx, singlist.items.length - 1)]
  const deity = useMemo(() => (item ? data.deities.find((d) => d.id === item.deityId) : null), [item])
  const aarti = useMemo(() => (deity ? deity.aartis.find((a) => a.id === item.aartiId) : null), [deity, item])
  const lines = aarti?.lines || []

  // Group raw lyric lines into distinct stanzas separated by empty lines
  const stanzas = useMemo(() => {
    if (!lines.length) return []
    const groups = []
    let current = []

    lines.forEach((line) => {
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
  }, [lines])

  const isLast = idx === singlist.items.length - 1
  const handleNext = () => {
    if (isLast) onExit()
    else setIdx((i) => i + 1)
  }

  return (
      <div className="mx-auto max-w-2xl space-y-4 pb-16">
        {/* Header Bar with Text Resizer Controls */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <button className="text-sm font-semibold text-gray-600 hover:text-brown" onClick={onExit}>
            ← {t('sing.title')}
          </button>
          <h2 className="text-sm font-bold text-brown truncate max-w-[180px]">▶ {singlist.name}</h2>

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
        </div>

        {!item ? (
            <div className="py-12 text-center text-gray-500">{t('sing.emptyTitle')}</div>
        ) : (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>{t('sing.nowPlaying')}</span>
                  <span>
                {idx + 1} / {singlist.items.length}
              </span>
                </div>
                <div className="flex gap-1.5">
                  {singlist.items.map((_, i) => (
                      <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i === idx ? 'bg-primary' : i < idx ? 'bg-primary/40' : 'bg-gray-200'
                          }`}
                      />
                  ))}
                </div>
              </div>

              {/* Optimized Devanagari Reading Card */}
              <article
                  className="rounded-3xl border border-amber-200/80 bg-[#FFFDF7] p-5 sm:p-7 shadow-sm space-y-6"
                  style={{ fontFamily: "'Noto Serif Devanagari', 'Mukta', 'Mangal', serif" }}
              >
                <div className="text-center space-y-1 border-b border-amber-100 pb-4">
                  <p className="text-xs font-bold tracking-wide text-amber-800/80 uppercase">
                    {item.deityName} · {LANGS_LABEL[item.lang] || item.lang}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#2C1D11] tracking-wide">
                    {item.title}
                  </h2>
                </div>

                {stanzas.length > 0 ? (
                    <div className="space-y-6 py-2">
                      {stanzas.map((stanza, sIdx) => (
                          <div
                              key={sIdx}
                              className="relative rounded-2xl bg-amber-50/40 p-4 border border-amber-100/60 shadow-xs text-center space-y-1.5 transition-all"
                          >
                            {/* Devanagari Verse Marker */}
                            <span className="absolute top-2 left-3 text-xs font-bold text-amber-700/50 select-none">
                      {toDevanagariDigit(sIdx + 1)}
                    </span>
                            {stanza.map((line, lIdx) => (
                                <p
                                    key={lIdx}
                                    className="font-semibold text-[#2C1D11] tracking-wide"
                                    style={{
                                      fontSize: `${fontSize}px`,
                                      lineHeight: 1.9,
                                    }}
                                >
                                  {line}
                                </p>
                            ))}
                          </div>
                      ))}
                    </div>
                ) : (
                    <p className="py-8 text-center text-sm text-gray-400">{t('sing.notFound')}</p>
                )}
              </article>

              {/* Navigation Dock */}
              <div className="sticky bottom-4 flex gap-3 rounded-2xl border border-amber-200 bg-white/95 p-2 shadow-lg backdrop-blur-md">
                <button
                    className="flex-1 rounded-xl border border-border py-3 text-xs font-bold text-brown hover:bg-cream disabled:opacity-30"
                    disabled={idx === 0}
                    onClick={() => setIdx((i) => i - 1)}
                >
                  ← {t('sing.previous')}
                </button>
                <button
                    className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-hover active:scale-95"
                    onClick={handleNext}
                >
                  {isLast ? t('sing.finish') : t('sing.next')} →
                </button>
              </div>
            </>
        )}
      </div>
  )
}

// Sub-component: Share Dialog Modal
function ShareSheet({ singlist, onClose }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState('')
  const code = encodeSinglist(singlist)

  const copy = (text, kind) => {
    navigator.clipboard?.writeText(text).then(
        () => setCopied(kind),
        () => setCopied(kind)
    )
  }

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs" onClick={onClose}>
        <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-base font-bold text-brown">🔗 {t('sing.shareTitle')}</h3>
          <p className="text-xs text-gray-500">{t('sing.shareHint')}</p>

          <div className="rounded-xl bg-cream p-2.5 text-center font-mono text-xs text-brown break-all">
            {code}
          </div>

          <div className="flex gap-2 pt-1">
            <button
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-sm"
                onClick={() => copy(code, 'code')}
            >
              {copied === 'code' ? t('sing.copied') : t('sing.copyCode')}
            </button>
            <button
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-brown"
                onClick={() => copy(singlistShareUrl(singlist), 'link')}
            >
              {copied === 'link' ? t('sing.copied') : t('sing.copyLink')}
            </button>
          </div>

          <button
              className="w-full rounded-xl border border-border py-2 text-xs font-bold text-gray-500 hover:bg-cream"
              onClick={onClose}
          >
            {t('sing.close')}
          </button>
        </div>
      </div>
  )
}