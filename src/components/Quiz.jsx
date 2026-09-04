import { useState } from 'react'
import questions from '../data/quizQuestions.json'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', label: 'Konkani', flag: '🟨' },
  { code: 'mr', label: 'Marathi', flag: '🟧' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Quiz({ onBack }) {
  const [lang, setLang] = useState('en')
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [current, setCurrent] = useState(() => shuffle(questions).slice(0, 10))

  const pickNewQuestions = () => {
    setCurrent(shuffle(questions).slice(0, 10))
    setSelected(null)
    setScore(0)
    setAnswered(0)
  }

  const handleAnswer = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    setAnswered((a) => a + 1)
    if (idx === current[0].answer[lang]) setScore((s) => s + 1)
  }

  const next = () => {
    setCurrent((c) => c.slice(1))
    setSelected(null)
  }

  const question = current[0]
  const correct = question?.answer[lang]
  const total = 10
  const progress = ((10 - current.length) / total) * 100

  if (!question) {
    return (
      <div className="screen quiz-screen">
        <div className="topbar">
          <button className="back-btn" onClick={onBack}>← Home</button>
          <h2>Quiz Complete</h2>
          <span />
        </div>
        <div className="result-card">
          <div className="result-score">
            {score} / {total}
          </div>
          <p className="result-msg">
            {score >= 8 ? '🎉 उत्तम! Ganpati Bappa Morya!' :
             score >= 5 ? '👍 Good job, keep learning!' :
             '🙏 Try again, the wisdom of Ganesha awaits!'}
          </p>
          <div className="result-actions">
            <button className="btn-primary" onClick={pickNewQuestions}>
              Play Again
            </button>
            <button className="btn-secondary" onClick={onBack}>Home</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen quiz-screen">
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← Home</button>
        <h2>📝 Ganpati Quiz</h2>
        <span className="score-pill">⭐ {score}</span>
      </div>

      <div className="lang-selector">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            className={`lang-btn ${lang === l.code ? 'active' : ''}`}
            onClick={() => { setLang(l.code); setSelected(null) }}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="question-card">
        <p className="q-count">
          Question {10 - current.length + 1} of {total}
        </p>
        <h3 className="q-text">{question.question[lang]}</h3>

        <div className="options">
          {question.options[lang].map((opt, i) => {
            let cls = 'option'
            if (selected !== null && i === correct) cls += ' correct'
            if (selected === i && i !== correct) cls += ' wrong'
            if (selected !== null && i !== correct) cls += ' dim'
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
              >
                <span className="opt-letter">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className="feedback">
            {selected === correct
              ? <span className="fb-correct">✅ Correct! Great job!</span>
              : <span className="fb-wrong">❌ Incorrect! Correct answer: {String.fromCharCode(65 + correct)}</span>}
            {current.length > 1 ? (
              <button className="btn-primary" onClick={next}>Next →</button>
            ) : (
              <button className="btn-primary" onClick={next}>See Results 🏁</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
