import { useEffect, useState } from 'react'
import './App.css'
import { I18nProvider } from './i18n'
import Home from './components/Home'
import Quiz from './components/Quiz'
import Aarti from './components/Aarti'
import Japa from './components/Japa'
import SinglistScreen from './components/SinglistScreen'
import SettingsScreen from './components/SettingsScreen'
import { decodeSinglist, importSinglist, setActiveSinglistId } from './utils/singlists'

export default function App() {
  const [view, setView] = useState('home')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const h = window.location.hash
    if (h && h.startsWith('#singlist=')) {
      const code = h.slice('#singlist='.length)
      try {
        const data = decodeSinglist(code)
        const sl = importSinglist(data)
        if (sl) {
          setActiveSinglistId(sl.id)
          setView('singlist')
          setToast(`Imported singlist “${sl.name}”`)
        }
      } catch {
        setToast('Invalid singlist link')
      }
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <I18nProvider>
      {toast && <div className="toast">{toast}</div>}
      {view === 'quiz' && <Quiz onBack={() => setView('home')} />}
      {view === 'aarti' && <Aarti onBack={() => setView('home')} />}
      {view === 'japa' && <Japa onBack={() => setView('home')} />}
      {view === 'singlist' && <SinglistScreen onBack={() => setView('home')} />}
      {view === 'settings' && <SettingsScreen onBack={() => setView('home')} />}
      {view === 'home' && <Home onSelect={setView} />}
    </I18nProvider>
  )
}