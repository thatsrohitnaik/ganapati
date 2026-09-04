import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import Quiz from './components/Quiz'
import Aarti from './components/Aarti'

export default function App() {
  const [view, setView] = useState('home')

  if (view === 'quiz') return <Quiz onBack={() => setView('home')} />
  if (view === 'aarti') return <Aarti onBack={() => setView('home')} />

  return <Home onSelect={setView} />
}
