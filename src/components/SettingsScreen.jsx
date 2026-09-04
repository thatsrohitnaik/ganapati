import { useI18n, LANG_META } from './../i18n'

export default function SettingsScreen({ onBack }) {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="screen aarti-screen">
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← {t('common.home')}</button>
        <h2>⚙️ {t('settings.title')}</h2>
        <span />
      </div>

      <p className="screen-subtitle">{t('settings.subtitle')}</p>

      <div className="details-card">
        <p className="details-title">🌐 {t('settings.uiLang')}</p>
        <div className="lang-selector settings-langs">
          {Object.entries(LANG_META).map(([code, m]) => (
            <button
              key={code}
              className={`lang-btn ${lang === code ? 'active' : ''}`}
              onClick={() => setLang(code)}
            >
              {m.flag} {m.label}
            </button>
          ))}
        </div>
        <p className="details-hint">{t('settings.hint')}</p>
      </div>
    </div>
  )
}