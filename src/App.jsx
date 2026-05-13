import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { USERS } from './constants/users'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import MisPronósticos from './components/MisPronósticos'
import Reglamento from './components/Reglamento'
import Admin from './components/Admin'
import Logs from './components/Logs'

function MainApp() {
  const { session, logout } = useApp()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!session) return <Login />

  const user    = USERS.find(u => u.username === session)
  const isAdmin = user?.isAdmin ?? false

  const tabs = [
    { id: 'dashboard',  label: 'Dashboard', icon: '🏠' },
    { id: 'pronosticos',label: 'Pronósticos', icon: '⚽' },
    { id: 'reglamento', label: 'Reglamento', icon: '📋' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }] : []),
    { id: 'logs',       label: 'Logs', icon: '📝' },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':   return <Dashboard />
      case 'pronosticos': return <MisPronósticos />
      case 'reglamento':  return <Reglamento />
      case 'admin':       return isAdmin ? <Admin /> : null
      case 'logs':        return <Logs />
      default:            return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-sm sm:text-base">Prode Mundial 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-200 hidden sm:block">
              {session} {isAdmin && <span className="text-amber-300">★</span>}
            </span>
            <button
              onClick={logout}
              className="text-xs bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-24">
        {renderTab()}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                activeTab === tab.id
                  ? 'text-green-700 font-semibold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-lg leading-none mb-0.5">{tab.icon}</span>
              <span className="leading-none">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 h-0.5 w-8 bg-green-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  )
}
