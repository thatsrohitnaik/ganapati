const KEY = 'ganpati-singlists'
const ACTIVE_KEY = 'ganpati-active-singlist'

function uid(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function getSinglists() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

function persist(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getSinglist(id) {
  return getSinglists().find((s) => s.id === id) || null
}

export function createSinglist(name, emoji = '🎶') {
  const sl = {
    id: uid('sl'),
    name: (name || 'Singlist').trim() || 'Singlist',
    emoji,
    items: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  persist([...getSinglists(), sl])
  return sl
}

export function importSinglist(data) {
  if (!data || !Array.isArray(data.items)) return null
  const sl = createSinglist(data.name, data.emoji)
  sl.items = data.items
    .filter((i) => i && i.deityId && i.aartiId)
    .map((i) => ({
      id: uid('it'),
      deityId: i.deityId,
      deityName: i.deityName || '',
      aartiId: i.aartiId,
      title: i.title,
      subtitle: i.subtitle,
      lang: i.lang,
    }))
  persist([...getSinglists().filter((s) => s.id !== sl.id), sl])
  return sl
}

export function deleteSinglist(id) {
  persist(getSinglists().filter((s) => s.id !== id))
}

export function renameSinglist(id, name) {
  persist(
    getSinglists().map((s) =>
      s.id === id ? { ...s, name: (name || 'Singlist').trim() || 'Singlist' } : s
    )
  )
}

export function addItemToSinglist(slId, entry) {
  const list = getSinglists()
  const sl = list.find((s) => s.id === slId)
  if (!sl || !entry) return false
  if (sl.items.some((i) => i.deityId === entry.deityId && i.aartiId === entry.aartiId)) {
    return false
  }
  sl.items.push({ id: uid('it'), ...entry })
  sl.updatedAt = Date.now()
  persist(list)
  return true
}

export function removeItemFromSinglist(slId, itemId) {
  const list = getSinglists()
  const sl = list.find((s) => s.id === slId)
  if (!sl) return
  sl.items = sl.items.filter((i) => i.id !== itemId)
  sl.updatedAt = Date.now()
  persist(list)
}

export function moveItemInSinglist(slId, itemId, dir) {
  const list = getSinglists()
  const sl = list.find((s) => s.id === slId)
  if (!sl) return
  const idx = sl.items.findIndex((i) => i.id === itemId)
  const to = idx + dir
  if (idx === -1 || to < 0 || to >= sl.items.length) return
  const next = [...sl.items]
  const [item] = next.splice(idx, 1)
  next.splice(to, 0, item)
  sl.items = next
  sl.updatedAt = Date.now()
  persist(list)
}

export function clearSinglistItems(slId) {
  const list = getSinglists()
  const sl = list.find((s) => s.id === slId)
  if (!sl) return
  sl.items = []
  sl.updatedAt = Date.now()
  persist(list)
}

export function aartiInAnySinglist(deityId, aartiId) {
  return getSinglists().some((s) =>
    s.items.some((i) => i.deityId === deityId && i.aartiId === aartiId)
  )
}

export function encodeSinglist(sl) {
  const payload = {
    v: 1,
    name: sl.name,
    emoji: sl.emoji,
    items: sl.items.map((i) => ({
      deityId: i.deityId,
      aartiId: i.aartiId,
      title: i.title,
      subtitle: i.subtitle,
      lang: i.lang,
    })),
  }
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

export function decodeSinglist(code) {
  let b64 = String(code || '')
    .trim()
    .replaceAll('-', '+')
    .replaceAll('_', '/')
  while (b64.length % 4) b64 += '='
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  const payload = JSON.parse(new TextDecoder().decode(bytes))
  if (!payload || !Array.isArray(payload.items)) throw new Error('bad payload')
  return {
    name: payload.name || 'Imported Singlist',
    emoji: payload.emoji || '🎶',
    items: payload.items || [],
  }
}

export function singlistShareUrl(sl) {
  return `${window.location.origin}${window.location.pathname}#singlist=${encodeSinglist(sl)}`
}

export function getActiveSinglistId() {
  try {
    return localStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

export function setActiveSinglistId(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {
    /* ignore */
  }
}

export function getActiveSinglist() {
  const id = getActiveSinglistId()
  const all = getSinglists()
  const found = id ? all.find((s) => s.id === id) : null
  if (found) return found
  if (all.length) {
    setActiveSinglistId(all[0].id)
    return all[0]
  }
  return null
}