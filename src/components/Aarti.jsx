import { useState } from 'react'
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

export default function Aarti({ onBack }) {
  const { t } = useI18n()
  const [deityId, setDeityId] = useState(null)
  const [aartiId, setAartiId] = useState(null)
  const [target, setTarget] = useState(null)
  const [lists, setLists] = useState([])
  const [newName, setNewName] = useState('')
  const [notice, setNotice] = useState(null)

  const deity = data.deities.find((d) => d.id === deityId)
  const aarti = deity?.aartis.find((a) => a.id === aartiId)

  function openPicker(d, a) {
    setTarget({ deityId: d.id, deityName: d.name, aartiId: a.id, title: a.title, subtitle: a.subtitle, lang: a.lang })
    setLists(getSinglists())
    setNotice(null)
    setNewName('')
  }

  function inList(sl) {
    return target && sl.items.some((i) => i.deityId === target.deityId && i.aartiId === target.aartiId)
  }

  function refresh() {
    setLists(getSinglists())
  }

  function toggle(slId) {
    const sl = getSinglists().find((s) => s.id === slId)
    if (!sl || !target) return
    if (inList(sl)) {
      const item = sl.items.find((i) => i.deityId === target.deityId && i.aartiId === target.aartiId)
      if (item) removeItemFromSinglist(slId, item.id)
      setNotice(t('aarti.removedFrom', { name: sl.name }))
    } else {
      addItemToSinglist(slId, target)
      setNotice(t('aarti.addedTo', { name: sl.name }))
    }
    refresh()
  }

  function createAndAdd() {
    const name = newName.trim() || 'Singlist'
    const sl = createSinglist(name)
    if (target) addItemToSinglist(sl.id, target)
    setActiveSinglistId(sl.id)
    setNewName('')
    setNotice(t('aarti.addedTo', { name: sl.name }))
    refresh()
  }

  const activeId = getActiveSinglistId()

  return (
    <div className="screen aarti-screen">
      <div className="topbar">
        {deity ? (
          <button className="back-btn" onClick={() => (aarti ? setAartiId(null) : setDeityId(null))}>
            ← {aarti ? t('aarti.backList') : t('aarti.backDeities')}
          </button>
        ) : (
          <button className="back-btn" onClick={onBack}>
            ← {t('common.home')}
          </button>
        )}
        <h2>{aarti ? aarti.title : deity ? `${deity.emoji} ${deity.name}` : t('aarti.title')}</h2>
        <span />
      </div>

      {!deity && (
        <>
          <p className="screen-subtitle">{t('aarti.subtitle')}</p>
          <div className="aarti-deities">
            {data.deities.map((d) => (
              <button key={d.id} className="deity-card" onClick={() => { setAartiId(null); setDeityId(d.id) }}>
                <span className="deity-emoji">{d.emoji}</span>
                <span className="deity-name">{d.name}</span>
                <span className="deity-name-en">{d.nameEn}</span>
                <span className="deity-count">{t('aarti.count', { n: d.aartis.length })}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {deity && !aarti && (
        <div className="aarti-items">
          {deity.aartis.map((a) => {
            const inAny = aartiInAnySinglist(deity.id, a.id)
            return (
              <div key={a.id} className="aarti-row">
                <button className="aarti-row-main" onClick={() => setAartiId(a.id)}>
                  <span className="aarti-row-title">
                    {a.title}
                    {inAny && <span className="in-singlist-dot" title={t('aarti.inSinglist')} />}
                  </span>
                  <span className="aarti-row-sub">
                    {a.subtitle} · <span className="lang-badge">{LANGS[a.lang] || a.lang}</span>
                  </span>
                </button>
                <button className="add-btn" title={t('aarti.addHint')} onClick={() => openPicker(deity, a)}>
                  ＋
                </button>
              </div>
            )
          })}
        </div>
      )}

      {deity && aarti && (
        <div className="lyric-view">
          <p className="aarti-subtitle">
            {deity.name} · {LANGS[aarti.lang] || aarti.lang}
          </p>
          <div className="lyric-lines">
            {aarti.lines.map((line, i) =>
              line.trim() ? <p key={i} className="aarti-line">{line}</p> : <div key={i} className="line-gap" />
            )}
          </div>
          <button className="btn-primary add-cta" onClick={() => openPicker(deity, aarti)}>
            {t('aarti.addTo')}
          </button>
        </div>
      )}

      {target && (
        <div className="chooser-overlay" onClick={() => setTarget(null)}>
          <div className="chooser" onClick={(e) => e.stopPropagation()}>
            <div className="chooser-head">
              <h3>📋 {t('sing.addToWhich')}</h3>
              <button className="chooser-close" onClick={() => setTarget(null)}>✕</button>
            </div>

            {notice && <p className="chooser-notice">{notice}</p>}

            {lists.length === 0 && (
              <p className="chooser-empty">{t('sing.emptyHint2')}</p>
            )}

            <div className="chooser-list">
              {lists.map((sl) => {
                const active = sl.id === activeId
                const added = inList(sl)
                return (
                  <div key={sl.id} className={`chooser-row ${active ? 'is-active' : ''}`}>
                    <button
                      className={`chooser-star ${active ? 'starred' : ''}`}
                      title={t('sing.makeActive')}
                      onClick={() => setActiveSinglistId(sl.id)}
                    >
                      {active ? '★' : '☆'}
                    </button>
                    <div className="chooser-info">
                      <span className="chooser-name">{sl.emoji} {sl.name}</span>
                      <span className="chooser-count">{t('sing.itemCount', { n: sl.items.length })}</span>
                    </div>
                    <button
                      className={`chooser-add ${added ? 'added' : ''}`}
                      onClick={() => toggle(sl.id)}
                      title={added ? t('aarti.removeHint') : t('aarti.addHint')}
                    >
                      {added ? '✔' : '＋'}
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
                onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
              />
              <button className="btn-primary" onClick={createAndAdd}>
                {t('sing.newSinglist')} ＋
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}