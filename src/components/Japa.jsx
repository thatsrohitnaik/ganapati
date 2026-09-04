import { useEffect, useState } from 'react'
import data from '../data/aartis.json'
import mantras from '../data/mantras.json'
import { useI18n } from '../i18n'

const KEY = 'ganpati-japa-progress'
const TARGETS = [27, 54, 108, 1080]
const DEFAULT_TARGET = 108
const MAX_BEADS = 108
const LANGS = { mr: 'मराठी', hi: 'हिंदी', sa: 'संस्कृत' }

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

function saveProgress(p) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export default function Japa({ onBack }) {
  const { t } = useI18n()
  const [mId, setMId] = useState(null)
  const [progress, setProgress] = useState(loadProgress)
  const [customTarget, setCustomTarget] = useState('')
  const [celebrate, setCelebrate] = useState(null)

  const mantra = mantras.mantras.find((m) => m.id === mId)
  const deity = mantra ? data.deities.find((d) => d.id === mantra.deityId) : null
  const state = mantra
    ? progress[mantra.id] || { count: 0, target: mantra.defaultTarget || DEFAULT_TARGET }
    : null

  const target = state ? state.target : DEFAULT_TARGET
  const cycle = state ? state.count % target : 0
  const rounds = state ? Math.floor(state.count / target) : 0

  useEffect(() => {
    if (!celebrate) return
    const h = setTimeout(() => setCelebrate(null), 3500)
    return () => clearTimeout(h)
  }, [celebrate])

  function patch(p) {
    const next = { ...progress, [mId]: { ...(progress[mId] || {}), ...p } }
    setProgress(next)
    saveProgress(next)
  }

  function increment() {
    const count = (state.count || 0) + 1
    patch({ count })
    if (count % target === 0) {
      setCelebrate(t('japa.malaDone', { n: target }))
      if (navigator.vibrate) navigator.vibrate([40, 60, 40])
    }
  }

  function undo() {
    patch({ count: Math.max(0, (state.count || 0) - 1) })
  }

  function reset() {
    if (state.count > 0 && window.confirm(`${t('japa.reset')}?`)) patch({ count: 0 })
  }

  function setTarget(n) {
    if (n > 0) patch({ target: Math.floor(n) })
  }

  const beadsCount = Math.min(target, MAX_BEADS)
  const filled = state ? Math.ceil((cycle / target) * beadsCount) : 0
  const groups = data.deities
    .map((d) => ({ deity: d, ms: mantras.mantras.filter((m) => m.deityId === d.id) }))
    .filter((g) => g.ms.length)

  return (
    <div className="screen japa-screen">
      <div className="topbar">
        {mantra ? (
          <button className="back-btn" onClick={() => setMId(null)}>
            ← {t('japa.back')}
          </button>
        ) : (
          <button className="back-btn" onClick={onBack}>
            ← {t('common.home')}
          </button>
        )}
        <h2>{mantra ? mantra.title : t('japa.title')}</h2>
        <span />
      </div>

      {!mantra && (
        <>
          <p className="screen-subtitle">{t('japa.subtitle')}</p>
          {groups.map(({ deity, ms }) => (
            <div key={deity.id} className="japa-deity-group">
              <h4 className="japa-deity-head">
                {deity.emoji} {deity.name} <span className="deity-name-en">{deity.nameEn}</span>
              </h4>
              {ms.map((m) => (
                <button key={m.id} className="japa-row" onClick={() => setMId(m.id)}>
                  <span className="aarti-row-title">{m.title}</span>
                  <span className="aarti-row-sub">
                    {m.titleEn}
                    {m.titleEn ? ' · ' : ''}
                    <span className="lang-badge">{LANGS[m.lang] || m.lang}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </>
      )}

      {mantra && state && (
        <div className="japa-counter">
          {celebrate && <div className="japa-celebration">{celebrate}</div>}

          <div className="mantra-card">
            {deity && <p className="mantra-deity">{deity.emoji} {deity.name}</p>}
            {mantra.text.map((line, i) => (
              <p key={i} className={`mantra-line ${i === mantra.text.length - 1 ? 'last' : ''}`}>
                {line}
              </p>
            ))}
          </div>

          <div className="beads" aria-hidden="true">
            {Array.from({ length: beadsCount }, (_, i) => (
              <span key={i} className={`bead ${i < filled ? 'done' : ''}`} />
            ))}
          </div>

          <div className="japa-stats">
            <div className="stat">
              <span className="stat-num">{state.count}</span>
              <span className="stat-label">{t('japa.count')}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{rounds}</span>
              <span className="stat-label">{t('japa.rounds')}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{target}</span>
              <span className="stat-label">{t('japa.targetLabel')}</span>
            </div>
          </div>

          <button className="japa-big" onClick={increment}>
            {t('japa.tapToAdd')}
          </button>
          <p className="japa-hint">{t('japa.tapHint')}</p>

          <div className="target-chips">
            {TARGETS.map((n) => (
              <button
                key={n}
                className={`chip ${target === n ? 'on' : ''}`}
                onClick={() => { setTarget(n); setCustomTarget('') }}
              >
                {n}
              </button>
            ))}
            <input
              type="number"
              min="1"
              placeholder={t('japa.customTarget')}
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              onBlur={() => {
                const n = parseInt(customTarget, 10)
                if (n > 0) setTarget(n)
                setCustomTarget('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            />
          </div>

          <div className="japa-actions">
            <button className="btn-secondary" onClick={undo}>
              − {t('japa.undo')}
            </button>
            <button className="btn-secondary" onClick={reset}>
              ⟲ {t('japa.reset')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}