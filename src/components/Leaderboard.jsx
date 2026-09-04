import { useI18n, LANG_META } from '../i18n'

export function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Leaderboard({ entries = [], highlightId = null }) {
  const { t } = useI18n()

  if (entries.length === 0) {
    return <p className="lb-empty">{t('lb.empty')}</p>
  }

  return (
    <div className="lb">
      <div className="lb-row lb-head">
        <span>{t('lb.colRank')}</span>
        <span>{t('lb.colName')}</span>
        <span>{t('lb.colLang')}</span>
        <span>{t('lb.colScore')}</span>
        <span>{t('lb.colTime')}</span>
      </div>
      {entries.map((e, i) => (
        <div key={e.id} className={`lb-row ${e.id === highlightId ? 'lb-highlight' : ''}`}>
          <span className="lb-rank">{i + 1}</span>
          <span className="lb-name">{e.name}</span>
          <span className="lb-lang">{LANG_META[e.lang]?.label || e.lang}</span>
          <span className="lb-score">{e.score}/{e.total}</span>
          <span className="lb-time">{formatTime(e.timeSec)}</span>
        </div>
      ))}
    </div>
  )
}