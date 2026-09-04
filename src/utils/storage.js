const KEY = 'ganpati-leaderboard'

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLeaderboardEntry(entry) {
  const list = getLeaderboard()
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...entry,
    date: new Date().toISOString(),
  }
  const next = [...list, newEntry]
    .sort((a, b) => b.score - a.score || a.timeSec - b.timeSec)
    .slice(0, 15)
  localStorage.setItem(KEY, JSON.stringify(next))
  return newEntry.id
}

export function clearLeaderboard() {
  localStorage.removeItem(KEY)
}