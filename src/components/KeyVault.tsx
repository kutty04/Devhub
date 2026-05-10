import React, { useState, useEffect } from 'react'
import { encrypt, decrypt } from '../services/encryption'
import { saveToStorage, getFromStorage } from '../services/storage'
import { ApiKey } from '../types'

export default function KeyVault() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [masterPassword, setMasterPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [newService, setNewService] = useState('')
  const [newKey, setNewKey] = useState('')
  const [error, setError] = useState('')
  const [vaultCheck, setVaultCheck] = useState<string | null>(null)

  useEffect(() => {
    loadKeys()
  }, [])

  async function loadKeys() {
    try {
      const stored = await getFromStorage('apiKeys')
      if (stored) setKeys(stored)
      const storedCheck = await getFromStorage('vaultCheck')
      if (storedCheck) setVaultCheck(storedCheck)
    } catch (err) {
      console.error('Error loading keys:', err)
    }
  }

  async function unlock() {
    setError('')
    if (masterPassword.length < 8) {
      setError('Password must be 8+ characters')
      return
    }

    if (vaultCheck) {
      try {
        const check = decrypt(vaultCheck, masterPassword)
        if (check !== 'devhub-vault-check') throw new Error('Invalid check string')
        setIsUnlocked(true)
      } catch {
        setError('Incorrect master password')
        return
      }
    } else if (keys.length > 0) {
      try {
        decrypt(keys[0].key, masterPassword)
        const newCheck = encrypt('devhub-vault-check', masterPassword)
        setVaultCheck(newCheck)
        await saveToStorage('vaultCheck', newCheck)
        setIsUnlocked(true)
      } catch {
        setError('Incorrect master password')
        return
      }
    } else {
      try {
        const newCheck = encrypt('devhub-vault-check', masterPassword)
        setVaultCheck(newCheck)
        await saveToStorage('vaultCheck', newCheck)
        setIsUnlocked(true)
      } catch (err) {
        setError('Error setting up vault')
        return
      }
    }
  }

  async function addKey() {
    setError('')
    if (!newService || !newKey) {
      setError('Service name and key are required')
      return
    }

    try {
      const encryptedKey = encrypt(newKey, masterPassword)
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        service: newService,
        key: encryptedKey,
        masked: true,
        createdAt: Date.now()
      }

      const updated = [...keys, newApiKey]
      setKeys(updated)
      await saveToStorage('apiKeys', updated)
      setNewService('')
      setNewKey('')
    } catch (err) {
      setError('Error adding key. Please try again.')
      console.error('Error adding key:', err)
    }
  }

  function toggleMask(id: string) {
    setKeys(keys.map(k => k.id === id ? { ...k, masked: !k.masked } : k))
  }

  function copyToClipboard(id: string) {
    const key = keys.find(k => k.id === id)
    if (!key) return
    
    try {
      const decrypted = decrypt(key.key, masterPassword)
      navigator.clipboard.writeText(decrypted)
      alert('✓ Copied to clipboard!')
    } catch {
      setError('Wrong password or decryption failed')
    }
  }

  async function deleteKey(id: string) {
    try {
      const updated = keys.filter(k => k.id !== id)
      setKeys(updated)
      await saveToStorage('apiKeys', updated)
    } catch (err) {
      setError('Error deleting key')
      console.error('Error deleting key:', err)
    }
  }

  if (!isUnlocked) {
    const isFirstTime = !vaultCheck && keys.length === 0
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-300">
          {isFirstTime ? 'Create a master password to secure your vault' : 'Enter master password to unlock vault'}
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          type="password"
          placeholder="Master password (8+ chars)"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && unlock()}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={unlock}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition"
        >
          🔓 Unlock Vault
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add New Key */}
      <div className="space-y-2 p-3 bg-gray-800 rounded border border-gray-700">
        <p className="text-xs text-gray-400 font-medium">ADD NEW API KEY</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          type="text"
          placeholder="Service (e.g., Supabase, Firebase)"
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="API Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={addKey}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-medium transition"
        >
          + Add Key
        </button>
      </div>

      {/* Stored Keys */}
      {keys.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">No API keys stored yet</p>
      ) : (
        keys.map(key => (
          <div key={key.id} className="p-3 bg-gray-800 rounded border border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-100">{key.service}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {key.masked ? '••••••••••••••••' : decrypt(key.key, masterPassword).slice(0, 20) + '...'}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => toggleMask(key.id)}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition"
                  title={key.masked ? 'Show key' : 'Hide key'}
                >
                  {key.masked ? '👁' : '🙈'}
                </button>
                <button
                  onClick={() => copyToClipboard(key.id)}
                  className="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded transition"
                  title="Copy to clipboard"
                >
                  📋
                </button>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 rounded transition"
                  title="Delete key"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
