import { useState, useMemo } from 'react'
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

export default function Aarti({ onBack, deityId, aartiId, onSelectDeity, onSelectAarti }) {
  const { t } = useI18n()

  // UI & Selection States
  const [target, setTarget] = useState(null)
  const [notice, setNotice] = useState(null)
  const [shareMsg, setShareMsg] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [langFilter, setLangFilter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Singlists State Manager
  const [lists, setLists] = useState(() => getSinglists())
  const activeId = getActiveSinglistId()

  const deity = useMemo(() => data.deities.find((d) => d.id === deityId), [deityId])
  const aarti = useMemo(() => deity?.aartis.find((a) => a.id === aartiId), [deity, aartiId])

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

  const shareUrl = () => `${window.location.origin}${window.location.pathname}#/aarti/${deity?.id}/${aarti?.id}`

  return (
      <div className="screen aarti-screen">
        {/* Top Navigation */}
        <header className="topbar">
          {deity ? (
              <button className="back-btn" onClick={() => (aarti ? onSelectAarti(null) : onSelectDeity(null))}>
                ← {aarti ? t('aarti.backList') : t('aarti.backDeities')}
              </button>
          ) : (
              <button className="back-btn" onClick={onBack}>
                ← {t('common.home')}
              </button>
          )}
          <h2>{aarti ? aarti.title : deity ? `${deity.emoji} ${deity.name}` : t('aarti.title')}</h2>
          {aarti ? (
              <button className="share-btn" title={t('aarti.share')} onClick={() => setShareOpen(true)}>
                📤
              </button>
          ) : (
              <div className="spacer-btn" />
          )}
        </header>

        {/* Main View: Deities List */}
        {!deity && (
            <section className="deity-selection">
              <p className="screen-subtitle">{t('aarti.subtitle')}</p>
              <div className="aarti-deities">
                {data.deities.map((d) => (
                    <button key={d.id} className="deity-card" onClick={() => onSelectDeity(d.id)}>
                      <span className="deity-emoji">{d.emoji}</span>
                      <span className="deity-name">{d.name}</span>
                      <span className="deity-name-en">{d.nameEn}</span>
                      <span className="deity-count">{t('aarti.count', { n: d.aartis.length })}</span>
                    </button>
                ))}
              </div>
            </section>
        )}

        {/* Main View: Aartis List for Chosen Deity */}
        {deity && !aarti && (
            <section className="aarti-selection">
              <div className="filter-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder={t('aarti.searchPlaceholder') || "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="lang-filter">
                  <button className={`lang-chip ${langFilter === null ? 'on' : ''}`} onClick={() => setLangFilter(null)}>
                    All
                  </button>
                  {Object.entries(LANGS).map(([code, label]) => {
                    const count = deity.aartis.filter((a) => a.lang === code).length
                    if (!count) return null
                    return (
                        <button
                            key={code}
                            className={`lang-chip ${langFilter === code ? 'on' : ''}`}
                            onClick={() => setLangFilter(langFilter === code ? null : code)}
                        >
                          {label} ({count})
                        </button>
                    )
                  })}
                </div>
              </div>

              <div className="aarti-items">
                {filteredAartis.map((a) => {
                  const inAny = aartiInAnySinglist(deity.id, a.id)
                  return (
                      <div key={a.id} className="aarti-row">
                        <button className="aarti-row-main" onClick={() => onSelectAarti(a.id)}>
                    <span className="aarti-row-title">
                      {a.title}
                      {inAny && <span className="in-singlist-dot" title={t('aarti.inSinglist')} />}
                    </span>
                          <span className="aarti-row-sub">
                      {a.subtitle} · <span className="lang-badge">{LANGS[a.lang] || a.lang}</span>
                    </span>
                        </button>
                      </div>
                  )
                })}
              </div>
            </section>
        )}

        {/* Main View: Single Aarti Lyrics Display */}
        {deity && aarti && (
            <article className="lyric-view">
              <p className="aarti-subtitle">
                {deity.name} · {LANGS[aarti.lang] || aarti.lang}
              </p>
              <button className="btn-primary add-cta" onClick={() => openPicker(deity, aarti)}>
                ➕ {t('aarti.addTo')}
              </button>

              <div className="lyric-lines">
                {aarti.lines.map((line, i) =>
                    line.trim() ? <p key={i} className="aarti-line">{line}</p> : <div key={`gap-${i}`} className="line-gap" />
                )}
              </div>
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
      <div className="chooser-overlay" onClick={onClose}>
        <div className="chooser" onClick={(e) => e.stopPropagation()}>
          <div className="chooser-head">
            <h3>📋 {t('sing.addToWhich')}</h3>
            <button className="chooser-close" onClick={onClose}>✕</button>
          </div>

          {notice && <p className="chooser-notice">{notice}</p>}
          {lists.length === 0 && <p className="chooser-empty">{t('sing.emptyHint2')}</p>}

          <div className="chooser-list">
            {lists.map((sl) => {
              const isActive = sl.id === activeId
              const isAdded = inList(sl)
              return (
                  <div key={sl.id} className={`chooser-row ${isActive ? 'is-active' : ''}`}>
                    <button
                        className={`chooser-star ${isActive ? 'starred' : ''}`}
                        onClick={() => onSetActive(sl.id)}
                    >
                      {isActive ? '★' : '☆'}
                    </button>
                    <div className="chooser-info">
                      <span className="chooser-name">{sl.emoji} {sl.name}</span>
                      <span className="chooser-count">{t('sing.itemCount', { n: sl.items.length })}</span>
                    </div>
                    <button className={`chooser-add ${isAdded ? 'added' : ''}`} onClick={() => onToggle(sl.id)}>
                      {isAdded ? '✔' : '＋'}
                    </button>
                  </div>
              )
            })}
          </div>

          <div className="chooser-new">
            <input
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
            <button className="btn-primary" onClick={() => { onCreate(newName); setNewName('') }}>
              {t('sing.newSinglist')} ＋
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
      <div className="chooser-overlay" onClick={onClose}>
        <div className="chooser share-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="chooser-head">
            <h3>📤 {t('aarti.shareTitle')}</h3>
            <button className="chooser-close" onClick={onClose}>✕</button>
          </div>
          <p className="share-url">{url}</p>
          <div className="share-actions">
            <button className="btn-primary share-wa" onClick={shareWhatsApp}>
              💬 {t('aarti.shareWhatsapp')}
            </button>
            <button className="btn-secondary share-copy" onClick={copyLink}>
              🔗 {t('aarti.copyLink')}
            </button>
          </div>
          {shareMsg && <p className="chooser-notice">{shareMsg}</p>}
        </div>
      </div>
  )
}