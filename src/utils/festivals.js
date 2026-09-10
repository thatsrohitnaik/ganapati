const FESTIVAL_DAYS = 10

const GANESH_CHATURTHI = {
  2023: { m: 8, d: 19 },
  2024: { m: 8, d: 7 },
  2025: { m: 8, d: 27 },
  2026: { m: 8, d: 15 },
  2027: { m: 8, d: 5 },
  2028: { m: 7, d: 24 },
  2029: { m: 8, d: 13 },
  2030: { m: 8, d: 2 },
}

export function ganeshChaturthiStart(year) {
  const known = GANESH_CHATURTHI[year]
  if (known) return new Date(year, known.m, known.d)
  const prev = GANESH_CHATURTHI[year - 1]
  if (prev) return new Date(year, prev.m, prev.d - 11)
  return null
}

export function getFestivalInfo(now = new Date()) {
  const year = now.getFullYear()
  let start = ganeshChaturthiStart(year)

  if (start && now.getTime() > start.getTime()) {
    const next = ganeshChaturthiStart(year + 1)
    start = next
  }

  const festivalStart = ganeshChaturthiStart(year)
  const isFestival = !!festivalStart && now >= festivalStart && now < new Date(festivalStart.getFullYear(), festivalStart.getMonth(), festivalStart.getDate() + FESTIVAL_DAYS)

  let daysUntil = null
  if (start) {
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const b = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    daysUntil = Math.max(0, Math.round((b - a) / 86400000))
  }

  let festivalDay = null
  if (isFestival && festivalStart) {
    festivalDay = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(festivalStart.getFullYear(), festivalStart.getMonth(), festivalStart.getDate())) / 86400000) + 1
  }

  return { nextStart: start, isFestival, festivalDay, daysUntil, totalDays: FESTIVAL_DAYS }
}

export function festivalCountdownParts(daysUntil) {
  const days = daysUntil
  const hours = 0
  const minutes = 0
  return { days, hours, minutes }
}