import { useState } from 'react'
import quizQuestions from '../data/quizQuestions.json'
import Leaderboard, { formatTime } from './Leaderboard'
import { useI18n } from '../i18n'
import { clearLeaderboard, getLeaderboard, saveLeaderboardEntry } from '../utils/storage'

const QUESTIONS_PER_GAME = 10
const OPT_LETTERS = ['A', 'B', 'C', 'D']
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'कोंकणी' },
  { code: 'mr', label: 'मराठी' },
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
  const { t } = useI18n()
  const [stage, setStage] = useState('details')
  const [name, setName] = useState('')
  const [qLang, setQLang] = useState('mr')
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [startAt, setStartAt] = useState(0)
  const [timeSec, setTimeSec] = useState(0)
  const [entries, setEntries] = useState(getLeaderboard)
  const [showLb, setShowLb] = useState(true)
  const [lastId, setLastId] = useState(null)

  const q = questions[idx]
  const last = idx === questions.length - 1

  function start() {
    const qs = shuffle(quizQuestions).slice(0, QUESTIONS_PER_GAME)
    setQuestions(qs)
    setIdx(0)
    setScore(0)
    setSelected(null)
    setStartAt(Date.now())
    setTimeSec(0)
    setStage('playing')
  }

  function choose(optIdx) {
    if (selected != null) return
    setSelected(optIdx)
    if (q && optIdx === q.answer[qLang]) setScore((s) => s + 1)
  }

  function nextOrFinish() {
    if (last) {
      const sec = Math.round((Date.now() - startAt) / 1000)
      const id = saveLeaderboardEntry({
        name: name.trim() || t('quiz.anonymous'),
        score,
        total: questions.length,
        timeSec: sec,
        lang: qLang,
      })
      setTimeSec(sec)
      setEntries(getLeaderboard())
      setLastId(id)
      setStage('results')
    } else {
      setIdx(idx + 1)
      setSelected(null)
    }
  }

  function goHome() {
    setStage('details')
    onBack()
  }

  return (
    <div className="screen quiz-screen">
      {stage === 'details' && (
        <>
          <div className="topbar">
            <button className="back-btn" onClick={onBack}>← {t('common.home')}</button>
            <h2>{t('quiz.title')}</h2>
            <span />
          </div>

          <div className="details-card">
            <p className="details-title">{t('quiz.detailsTitle')}</p>
            <input
              className="name-input"
              value={name}
              placeholder={t('quiz.namePlaceholder')}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="details-hint">{t('quiz.qLang')}</p>
            <div className="lang-selector">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  className={`lang-btn ${qLang === l.code ? 'active' : ''}`}
                  onClick={() => setQLang(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button className="btn-primary start-btn" onClick={start}>
              {t('quiz.start')}
            </button>

            {entries.length > 0 && (
              <div className="lb-section">
                <button className="lb-toggle" onClick={() => setShowLb((s) => !s)}>
                  {t('quiz.leaderboard')} {showLb ? '▲' : '▼'}
                </button>
                {showLb && (
                  <>
                    <Leaderboard entries={entries} />
                    <button className="btn-secondary lb-clear" onClick={() => { clearLeaderboard(); setEntries([]) }}>
                      {t('lb.clear')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {stage === 'playing' && q && (
        <>
          <div className="topbar">
            <button className="back-btn" onClick={() => setStage('details')}>←</button>
            <h2>{t('quiz.title')}</h2>
            <span className="score-pill">⭐ {score}</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
          </div>

          <p className="q-count">{t('quiz.qCount', { n: idx + 1, total: questions.length })}</p>

          <div className="question-card">
            <p className="q-text">{q.question[qLang]}</p>
            <div className="options">
              {q.options[qLang].map((opt, i) => {
                let cls = 'option'
                if (selected != null) {
                  if (i === q.answer[qLang]) cls += ' correct'
                  else if (i === selected) cls += ' wrong'
                  else cls += ' dim'
                }
                return (
                  <button key={i} className={cls} disabled={selected != null} onClick={() => choose(i)}>
                    <span className="opt-letter">{OPT_LETTERS[i]}</span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>

            {selected != null && (
              <div className="feedback">
                {selected === q.answer[qLang] ? (
                  <div className="fb-correct">{t('quiz.correct')}</div>
                ) : (
                  <div className="fb-wrong">
                    {t('quiz.wrong', { letter: OPT_LETTERS[q.answer[qLang]] })}
                  </div>
                )}
                <button className="btn-primary" onClick={nextOrFinish}>
                  {last ? t('quiz.seeResults') : t('quiz.next')}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {stage === 'results' && (
        <>
          <div className="topbar">
            <button className="back-btn" onClick={goHome}>← {t('common.home')}</button>
            <h2>{t('quiz.resultsTitle')}</h2>
            <span className="score-pill">⭐ {score}/{questions.length}</span>
          </div>

          <div className="result-card">
            <div className="result-score">{score}/{questions.length}</div>
            <p className="result-msg">
              {score >= 8 ? t('quiz.msgGreat') : score >= 5 ? t('quiz.msgGood') : t('quiz.msgTry')}
            </p>
            <p className="result-time">⏱️ {t('quiz.timeTaken')} {formatTime(timeSec)}</p>
            <div className="result-actions">
              <button className="btn-primary" onClick={start}>{t('quiz.playAgain')}</button>
              <button className="btn-secondary" onClick={goHome}>{t('common.home')}</button>
            </div>
          </div>

          {entries.length > 0 && (
            <div className="lb-section result-lb">
              <h3>{t('lb.title')}</h3>
              <Leaderboard entries={entries} highlightId={lastId} />
            </div>
          )}
        </>
      )}
    </div>
  )
}