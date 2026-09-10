import { useState } from 'react'
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
    <div className="chooser-overlay" onClick={onClose}>
      <div className="chooser-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>🔗 {t('sing.shareTitle')}</h3>
        <p className="chooser-hint">{t('sing.shareHint')}</p>
        <p className="share-code" title={code}>{code}</p>
        <div className="share-actions">
          <button className="btn-primary" onClick={() => copy(code, 'code')}>
            {copied === 'code' ? t('sing.copied') : t('sing.copyCode')}
          </button>
          <button className="btn-secondary" onClick={() => copy(singlistShareUrl(singlist), 'link')}>
            {copied === 'link' ? t('sing.copied') : t('sing.copyLink')}
          </button>
        </div>
        <button className="btn-secondary share-close" onClick={onClose}>{t('sing.close')}</button>
      </div>
    </div>
  )
}

export default function SinglistScreen({ onBack }) {
  const { t } = useI18n()
  const [, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  const [activeId, setActiveId] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importCode, setImportCode] = useState('')
  const [importMsg, setImportMsg] = useState(null)

  const singlists = getSinglists()
  const active = getActiveSinglist()
  const detail = activeId ? getSinglist(activeId) : null

  const handleCreate = () => {
    const sl = createSinglist(newName, '🎶')
    setActiveSinglistId(sl.id)
    setNewName('')
    setNewOpen(false)
    refresh()
  }

  const handleImport = () => {
    try {
      const sl = decodeSinglist(importCode)
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


  if (detail) {
    return (
      <div className="screen aarti-screen">
        <div className="topbar">
          <button className="back-btn" onClick={() => setActiveId(null)}>← {t('sing.title')}</button>
          <h2>{detail.emoji} {detail.name}</h2>
          <button className="back-btn" onClick={() => setActiveId(null)}>✕</button>
        </div>

        <p className="screen-subtitle">{t('aarti.count', { n: detail.items.length })}</p>

        {detail.items.length === 0 ? (
          <div className="singlist-empty">
            <p>{t('sing.emptyTitle')}</p>
            <p className="singlist-hint">{t('sing.emptyHint2')}</p>
          </div>
        ) : (
          <div className="aarti-list">
            {detail.items.map((e, i) => (
              <div key={e.id} className="singlist-item">
                <span className="sl-order">{i + 1}</span>
                <div className="sl-info">
                  <strong>{e.title}</strong>
                  <p>{e.deityName} · {e.subtitle}</p>
                </div>
                <div className="sl-actions">
                  <button
                    className="sl-btn"
                    disabled={i === 0}
                    onClick={() => { moveItemInSinglist(detail.id, e.id, -1); refresh() }}
                    title="Move up"
                  >↑</button>
                  <button
                    className="sl-btn"
                    disabled={i === detail.items.length - 1}
                    onClick={() => { moveItemInSinglist(detail.id, e.id, 1); refresh() }}
                    title="Move down"
                  >↓</button>
                  <button
                    className="sl-btn sl-remove"
                    onClick={() => { removeItemFromSinglist(detail.id, e.id); refresh() }}
                    title="Remove"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="singlist-footer">
          <div className="singlist-footer-row">
            <button className="btn-secondary" onClick={() => setSharing(true)}>🔗 {t('sing.share')}</button>
            <button className="btn-secondary" onClick={() => { clearSinglistItems(detail.id); refresh() }}>
              🗑 {t('sing.clear')}
            </button>
          </div>
        </div>

        {sharing && <ShareSheet singlist={detail} onClose={() => setSharing(false)} />}
      </div>
    )
  }

  return (
    <div className="screen aarti-screen">
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← {t('common.home')}</button>
        <h2>🎤 {t('sing.title')}</h2>
        <button className="back-btn" onClick={() => setNewOpen((v) => !v)}>＋</button>
      </div>

      <p className="screen-subtitle">{t('sing.subtitle')}</p>

      {newOpen && (
        <div className="sl-inline-form">
          <input
            type="text"
            value={newName}
            maxLength={40}
            placeholder={t('sing.namePlaceholder')}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <button className="btn-primary" onClick={handleCreate}>{t('sing.create')}</button>
        </div>
      )}

      {singlists.length === 0 ? (
        <div className="singlist-empty">
          <p>{t('sing.emptyTitle')}</p>
          <p className="singlist-hint">{t('sing.emptyHint')}</p>
          <button className="btn-primary" onClick={() => setNewOpen(true)}>＋ {t('sing.newSinglist')}</button>
        </div>
      ) : (
        <div className="aarti-list">
          {singlists.map((s) => {
            const isActive = active && s.id === active.id
            return (
              <div key={s.id} className={`sl-collection-card ${isActive ? 'is-active' : ''}`}>
                <button className="sl-col-main" onClick={() => setActiveId(s.id)}>
                  <span className="sl-order">{s.emoji}</span>
                  <div className="sl-info">
                    <strong>
                      {s.name}
                      {isActive && <span className="active-chip">✓ {t('aarti.activeBadge')}</span>}
                    </strong>
                    <p>{t('aarti.count', { n: s.items.length })}</p>
                  </div>
                </button>
                <div className="sl-actions">
                  <button
                    className={`sl-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveSinglistId(s.id)}
                    title={t('sing.makeActive')}
                  >{isActive ? '★' : '☆'}</button>
                  <button
                    className="sl-btn"
                    disabled={s.items.length === 0}
                    onClick={() => { setActiveId(s.id) }}
                    title={t('sing.play')}
                  >▶</button>
                  <button className="sl-btn" onClick={() => setSharing(s)} title={t('sing.share')}>🔗</button>
                  <button className="sl-btn sl-remove" onClick={() => handleDelete(s.id, s.name)} title={t('sing.delete')}>🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="singlist-footer">
        <button className="btn-secondary" onClick={() => setImportOpen((v) => !v)}>
          📥 {t('sing.importTitle')}
        </button>
        {newOpen && (
          <button className="btn-secondary" onClick={() => setNewOpen(false)}>✕</button>
        )}
      </div>

      {importOpen && (
        <div className="sl-inline-form import-form">
          {importMsg && (
            <p className={importMsg.ok ? 'import-msg ok' : 'import-msg err'}>
              {importMsg.ok ? t('sing.importSuccess') : t('sing.importError')}
            </p>
          )}
          <input
            type="text"
            value={importCode}
            placeholder={t('sing.importPlaceholder')}
            onChange={(e) => setImportCode(e.target.value)}
          />
          <button className="btn-primary" onClick={handleImport}>{t('sing.importBtn')}</button>
        </div>
      )}

      {sharing && <ShareSheet singlist={sharing} onClose={() => setSharing(false)} />}
    </div>
  )
}
