import React, { useState, useEffect } from 'react'
import { fetchVercelDeployments } from '../services/vercel'
import { fetchGitHubRuns } from '../services/github'
import { fetchRenderServices } from '../services/render'
import { fetchNetlifyDeployments } from '../services/netlify'
import { getFromStorage } from '../services/storage'
import { decrypt } from '../services/encryption'
import { Deployment, ApiKey } from '../types'

export default function DeploymentMonitor() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [masterPassword, setMasterPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [keys, setKeys] = useState<ApiKey[]>([])

  async function loadAllData() {
    setLoading(true)
    setError('')
    const allResults: Deployment[] = []
    
    try {
      // Helper to fetch and catch errors for individual services
      const fetchData = async (serviceName: string, fetchFn: (t: string) => Promise<Deployment[]>) => {
        const key = keys.find(k => k.service.toLowerCase().includes(serviceName))
        if (key) {
          try {
            const token = decrypt(key.key, masterPassword)
            const data = await fetchFn(token)
            allResults.push(...data)
          } catch (e) {
            console.error(`Error fetching ${serviceName}:`, e)
          }
        }
      }

      await Promise.all([
        fetchData('vercel', fetchVercelDeployments),
        fetchData('github', fetchGitHubRuns),
        fetchData('render', fetchRenderServices),
        fetchData('netlify', fetchNetlifyDeployments)
      ])

      // Group by source + name to show only the latest deployment per project
      const grouped = allResults.reduce((acc, curr) => {
        const key = `${curr.source}-${curr.name}`
        if (!acc[key] || acc[key].createdAt < curr.createdAt) {
          acc[key] = curr
        }
        return acc
      }, {} as Record<string, Deployment>)

      const uniqueResults = Object.values(grouped).sort((a, b) => b.createdAt - a.createdAt)
      setDeployments(uniqueResults)

      // Set badge if there are errors
      const hasErrors = uniqueResults.some(d => d.state === 'ERROR' || d.state === 'FAILURE')
      if (hasErrors) {
        chrome.runtime.sendMessage({ type: 'SET_BADGE', text: '!', color: '#EF4444' })
      } else {
        chrome.runtime.sendMessage({ type: 'CLEAR_BADGE' })
      }
    } catch (err) {
      console.error('[UI] General load error:', err)
      setError('Error loading some deployments.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUnlock() {
    try {
      const storedKeys: ApiKey[] = await getFromStorage('apiKeys')
      if (!storedKeys || storedKeys.length === 0) {
        setError('No API keys found in Vault. Add your tokens first!')
        return
      }
      
      setKeys(storedKeys)
      setIsUnlocked(true)
    } catch (err) {
      setError('Invalid master password or decryption failed.')
    }
  }

  useEffect(() => {
    if (isUnlocked && keys.length > 0) {
      loadAllData()
    }
  }, [isUnlocked, keys.length])

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'READY':
      case 'SUCCESS': return 'bg-green-500'
      case 'ERROR':
      case 'FAILURE': return 'bg-red-500'
      case 'BUILDING':
      case 'QUEUED':
      case 'IN_PROGRESS': return 'bg-yellow-500 animate-pulse'
      default: return 'bg-gray-500'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'vercel': return '▲'
      case 'github': return '🐙'
      case 'render': return '☁️'
      case 'netlify': return '◈'
      default: return '•'
    }
  }

  if (!isUnlocked) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-300">Enter master password to access all deployment monitors</p>
        <input
          type="password"
          placeholder="Master password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        />
        <button
          onClick={handleUnlock}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium"
        >
          Unlock All Monitors
        </button>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        <p className="text-[10px] text-gray-500 italic mt-4 text-center">
          Make sure you have keys named "Vercel", "GitHub", "Render", and "Netlify" in your Vault.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Multi-Platform Monitor</h2>
        <button 
          onClick={loadAllData} 
          disabled={loading}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          {loading ? 'Fetching...' : 'Refresh All'}
        </button>
      </div>

      <div className="space-y-2">
        {deployments.length === 0 && !loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No active deployments found.</p>
            <p className="text-[10px] text-gray-600 mt-2">
              Ensure your Vault keys are named correctly:<br/>
              "Vercel", "GitHub", "Render", "Netlify"
            </p>
          </div>
        ) : (
          deployments.map(d => (
            <div key={d.id} className="p-3 bg-gray-800/50 rounded border border-gray-700 hover:border-gray-600 transition group">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-60" title={d.source}>{getSourceIcon(d.source)}</span>
                    <p className="text-sm font-medium text-white truncate">{d.name}</p>
                  </div>
                  <a 
                    href={d.url.startsWith('http') ? d.url : `https://${d.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] text-gray-500 hover:text-blue-400 truncate block mt-1 transition-colors"
                  >
                    {d.url}
                  </a>
                </div>
                <div className="ml-2 flex flex-col items-end">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm ${getStatusColor(d.state)}`}>
                    {d.state}
                  </span>
                  <span className="text-[9px] text-gray-600 mt-1 uppercase">
                    {new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
