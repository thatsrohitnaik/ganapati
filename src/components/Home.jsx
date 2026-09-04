import { LANG_META, useI18n } from '../i18n'

export default function Home({ onSelect }) {
  const { lang, setLang, t } = useI18n()

  const cards = [
    { id: 'quiz', emoji: '🏆', title: t('home.quiz.title'), desc: t('home.quiz.desc') },
    { id: 'aarti', emoji: '🪔', title: t('home.aarti.title'), desc: t('home.aarti.desc') },
    { id: 'singlist', emoji: '🎶', title: t('home.singlist.title'), desc: t('home.singlist.desc') },
    { id: 'japa', emoji: '📿', title: t('home.japa.title'), desc: t('home.japa.desc') },
    { id: 'settings', emoji: '⚙️', title: t('home.settings.title'), desc: t('home.settings.desc') },
  ]

  return (
    <div className="home">
      <div className="app-header">
        <div className="home-header">
          <div className="om-symbol">ॐ</div>
          <h1>Ganpati Bappa Morya</h1>
          <p className="tagline">गणपती बाप्पा मोरया 🙏</p>
        </div>
        <div className="lang-pill">
          <label>{t('home.language')}</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            {Object.entries(LANG_META).map(([code, m]) => (
              <option key={code} value={code}>
                {m.flag} {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="home-cards">
        {cards.map((c) => (
          <button key={c.id} className="home-card" onClick={() => onSelect(c.id)}>
            <span className="card-emoji">{c.emoji}</span>
            <h2>{c.title}</h2>
            <p>{c.desc}</p>
            <span className="card-cta">{t('home.explore')}</span>
          </button>
        ))}
      </div>

      <p className="home-footer">सुखकर्ता दुःखहर्ता 🙏</p>
    </div>
  )
}