import { useState } from 'react'
import aartis from '../data/aartis.json'

export default function Aarti({ onBack }) {
  const [activeId, setActiveId] = useState(null)

  if (activeId !== null) {
    const aarti = aartis.find((a) => a.id === activeId)
    return (
      <div className="screen aarti-screen">
        <div className="topbar">
          <button className="back-btn" onClick={() => setActiveId(null)}>← List</button>
          <h2>🪔 {aarti.title}</h2>
          <button className="back-btn" onClick={onBack}>Home</button>
        </div>
        <div className="aarti-detail">
          <p className="aarti-subtitle">{aarti.subtitle}</p>
          {aarti.lines.map((line, i) =>
            line.trim() === '' ? (
              <br key={i} />
            ) : (
              <p key={i} className="aarti-line">{line}</p>
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="screen aarti-screen">
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>← Home</button>
        <h2>🪔 Ganpati Aarti</h2>
        <span />
      </div>

      <p className="screen-subtitle">
        विविध गणपती आरत्या — निवडा आणि वाचा
      </p>

      <div className="aarti-list">
        {aartis.map((a) => (
          <button
            key={a.id}
            className="aarti-card"
            onClick={() => setActiveId(a.id)}
          >
            <span className="aarti-tile">🕉️</span>
            <div>
              <h3>{a.title}</h3>
              <p>{a.subtitle}</p>
            </div>
            <span className="aarti-arrow">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
