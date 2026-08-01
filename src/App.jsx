import { useState } from 'react'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Revenue from './pages/Revenue'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <NavBar tab={tab} onChange={setTab} />
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'users' && <Users />}
      {tab === 'revenue' && <Revenue />}
    </div>
  )
}
