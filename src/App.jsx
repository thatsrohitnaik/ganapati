import { useEffect, useState } from 'react'
import './App.css'
import AppShell from './components/AppShell'
import Home from './components/Home'
import Quiz from './components/Quiz'
import Aarti from './components/Aarti'
import Japa from './components/Japa'
import SinglistScreen from './components/SinglistScreen'
import SettingsScreen from './components/SettingsScreen'
import More from './components/More'
import { useAppStore, SPACING_PRESETS } from './store/appStore'
import {
  decodeSinglist,
  importSinglist,
  seedDefaultSinglist,
  setActiveSinglistId,
} from './utils/singlists'
import data from './data/aartis.json'

seedDefaultSinglist()

export default function App() {
  const [view, setView] = useState('home')
  const [aartiDeity, setAartiDeity] = useState(null)
  const [aartiId, setAartiId] = useState(null)
  const [toast, setToast] = useState(null)

  const fontSize = useAppStore((s) => s.fontSize)
  const spacingMode = useAppStore((s) => s.spacingMode)

  useEffect(() => {
    const spacing = SPACING_PRESETS[spacingMode] || SPACING_PRESETS.normal
    const scope = document.documentElement.style
    scope.setProperty('--fs-lyrics', `${fontSize}px`)
    scope.setProperty('--fs-lyrics-lh', String(spacing.lineHeight))
    scope.setProperty('--fs-lyrics-ws', spacing.wordSpacing)
  }, [fontSize, spacingMode])

  useEffect(() => {
    try {
      localStorage.removeItem('ganpati-ui-lang')
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const h = window.location.hash
    if (h && h.startsWith('#singlist=')) {
      const code = h.slice('#singlist='.length)
      try {
        const d = decodeSinglist(code)
        const sl = importSinglist(d)
        if (sl) {
          setActiveSinglistId(sl.id)
          setView('singlist')
          setToast(`Imported singlist "${sl.name}"`)
        }
      } catch {
        setToast('Invalid singlist link')
      }
      history.replaceState(null, '', window.location.pathname + window.location.search)
    } else if (h && h.startsWith('#/aarti')) {
      const parts = h.replace('#/aarti', '').split('/').filter(Boolean)
      const deity = data.deities.find((d) => d.id === parts[0])
      if (deity) {
        setAartiDeity(deity.id)
        const a = deity.aartis.find((x) => x.id === parts[1])
        if (a) setAartiId(a.id)
        setView('aarti')
      }
    }
  }, [])

  useEffect(() => {
    let h = ''
    if (view === 'aarti' && aartiDeity) {
      h = `/aarti/${aartiDeity}${aartiId ? `/${aartiId}` : ''}`
    }
    const target = h ? `#${h}` : ''
    if (window.location.hash !== target) {
      history.replaceState(null, '', window.location.pathname + window.location.search + target)
    }
  }, [view, aartiDeity, aartiId])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  function nav(where) {
    setView(where)
    setAartiDeity(null)
    setAartiId(null)
  }

  function openDeity(id) {
    setView('aarti')
    setAartiDeity(id)
    setAartiId(null)
  }

  function selectAarti(id) {
    setAartiId(id)
  }

  function openAarti(deityId, id) {
    setView('aarti')
    setAartiDeity(deityId)
    setAartiId(id)
  }

  function backHome() {
    setView('home')
    setAartiDeity(null)
    setAartiId(null)
  }

  function isAartiTabActive() {
    return view === 'aarti'
  }

  return (
    <AppShell view={isAartiTabActive() ? 'aarti' : view} onNav={nav} onSettings={() => nav('settings')}>
      {toast && <div className="toast">{toast}</div>}
      {view === 'home' && (
        <Home onSelect={nav} onOpenAarti={openAarti} />
      )}
      {view === 'quiz' && <Quiz onBack={backHome} />}
      {view === 'aarti' && (
        <Aarti
          onBack={backHome}
          deityId={aartiDeity}
          aartiId={aartiId}
          onSelectDeity={openDeity}
          onSelectAarti={selectAarti}
        />
      )}
      {view === 'japa' && <Japa onBack={() => setView('more')} />}
      {view === 'singlist' && (
        <SinglistScreen onBack={backHome} />
      )}
      {view === 'settings' && <SettingsScreen onBack={() => setView('more')} />}
      {view === 'more' && <More onSelect={nav} />}
    </AppShell>
  )
}