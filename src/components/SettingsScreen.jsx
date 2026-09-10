import { useI18n, LANG_META } from './../i18n'
import { useAppStore, SPACING_PRESETS, FONT_SIZE } from './../store/appStore'

export default function SettingsScreen({ onBack }) {
  const { lang, setLang, t } = useI18n()
  const fontSize = useAppStore((s) => s.fontSize)
  const setFontSize = useAppStore((s) => s.setFontSize)
  const spacingMode = useAppStore((s) => s.spacingMode)
  const setSpacingMode = useAppStore((s) => s.setSpacingMode)

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

      <div className="details-card">
        <p className="details-title">🔠 {t('settings.reading')}</p>
        <p className="details-hint">{t('settings.fontSizeHint')}</p>
        <div className="lang-selector settings-langs">
          {[FONT_SIZE.min, FONT_SIZE.default, FONT_SIZE.max].map((size) => (
            <button
              key={size}
              className={`lang-btn ${fontSize === size ? 'active' : ''}`}
              onClick={() => setFontSize(size)}
            >
              {size === FONT_SIZE.min ? t('settings.small') : size === FONT_SIZE.max ? t('settings.large') : t('settings.medium')} · {size}px
            </button>
          ))}
        </div>

        <p className="details-hint">{t('settings.spacingHint')}</p>
        <div className="lang-selector settings-langs">
          {Object.entries(SPACING_PRESETS).map(([mode]) => (
            <button
              key={mode}
              className={`lang-btn ${spacingMode === mode ? 'active' : ''}`}
              onClick={() => setSpacingMode(mode)}
            >
              {t(`settings.${mode}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}