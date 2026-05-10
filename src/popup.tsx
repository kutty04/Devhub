import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import KeyVault from './components/KeyVault'
import SnippetBoard from './components/SnippetBoard'
import DocsSearch from './components/DocsSearch'
import AIAssistant from './components/AIAssistant'
import DeploymentMonitor from './components/DeploymentMonitor'
import WelcomeTour from './components/WelcomeTour'
import { getFromStorage, saveToStorage } from './services/storage'
import './styles/globals.css'

type Tab = 'vault' | 'snippets' | 'docs' | 'ai' | 'status'

function Popup() {
  const [activeTab, setActiveTab] = useState<Tab>('vault')
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    async function checkFirstTime() {
      const hasCompletedTour = await getFromStorage('onboardingComplete')
      if (!hasCompletedTour) {
        setShowTour(true)
      }
    }
    checkFirstTime()
  }, [])

  const handleCompleteTour = async () => {
    await saveToStorage('onboardingComplete', true)
    setShowTour(false)
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'vault', label: 'Vault', icon: '🔐' },
    { id: 'snippets', label: 'Snippets', icon: '📝' },
    { id: 'docs', label: 'Docs', icon: '📖' },
    { id: 'ai', label: 'AI', icon: '✨' },
    { id: 'status', label: 'Status', icon: '🚀' }
  ]

  return (
    <div className="relative w-full min-h-[500px] bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 flex flex-col overflow-hidden">
      {showTour && <WelcomeTour onComplete={handleCompleteTour} />}
      
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          DevHub
        </h1>
        <p className="text-xs text-gray-400 mt-1">Your coding command center</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 pb-3 border-b border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 'vault' && <KeyVault />}
        {activeTab === 'snippets' && <SnippetBoard />}
        {activeTab === 'docs' && <DocsSearch />}
        {activeTab === 'ai' && <AIAssistant />}
        {activeTab === 'status' && <DeploymentMonitor />}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-500">DevHub v1.0.0</p>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Popup />)
}
