const segments = [
  {
    id: 'quiz',
    title: 'गणपती क्विझ',
    titleEn: 'Ganpati Quiz',
    desc: '50+ प्रश्न, 4 भाषा — British व En, Hindi, Konkani, Marathi',
    emoji: '📝',
  },
  {
    id: 'aarti',
    title: 'गणपती आरती',
    titleEn: 'Ganpati Aarti',
    desc: 'विविध गणपती आरत्या — सुखकर्ता, अथर्वशीर्ष, कवच व अधिक',
    emoji: '🪔',
  },
]

export default function Home({ onSelect }) {
  return (
    <div className="home">
      <header className="home-header">
        <div className="om-symbol">ॐ</div>
        <h1>श्री गणेशाय नमः</h1>
        <p className="tagline">जय गणपती!</p>
      </header>

      <main className="home-cards">
        {segments.map((s) => (
          <button
            key={s.id}
            className="home-card"
            onClick={() => onSelect(s.id)}
          >
            <span className="card-emoji">{s.emoji}</span>
            <h2>{s.title}</h2>
            <h3 className="card-title-en">{s.titleEn}</h3>
            <p>{s.desc}</p>
            <span className="card-cta">Explore →</span>
          </button>
        ))}
      </main>

      <footer className="home-footer">🙏 Ganpati Bappa Morya 🙏</footer>
    </div>
  )
}
