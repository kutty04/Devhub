import React, { useState, useEffect } from 'react'
import { saveToStorage, getFromStorage } from '../services/storage'
import { Snippet } from '../types'

export default function SnippetBoard() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    code: '',
    tags: '',
    language: 'javascript'
  })

  useEffect(() => {
    loadSnippets()
  }, [])

  async function loadSnippets() {
    try {
      const stored = await getFromStorage('snippets')
      if (stored) setSnippets(stored)
    } catch (err) {
      console.error('Error loading snippets:', err)
    }
  }

  async function addSnippet() {
    setError('')
    if (!newSnippet.title || !newSnippet.code) {
      setError('Title and code are required')
      return
    }

    try {
      const snippet: Snippet = {
        id: Date.now().toString(),
        title: newSnippet.title,
        code: newSnippet.code,
        tags: newSnippet.tags.split(',').map(t => t.trim()).filter(t => t),
        language: newSnippet.language,
        createdAt: Date.now()
      }

      const updated = [...snippets, snippet]
      setSnippets(updated)
      await saveToStorage('snippets', updated)
      setNewSnippet({ title: '', code: '', tags: '', language: 'javascript' })
      setShowForm(false)
    } catch (err) {
      setError('Error adding snippet')
      console.error('Error adding snippet:', err)
    }
  }

  function copySnippet(code: string) {
    navigator.clipboard.writeText(code)
    alert('✓ Copied to clipboard!')
  }

  async function deleteSnippet(id: string) {
    try {
      const updated = snippets.filter(s => s.id !== id)
      setSnippets(updated)
      await saveToStorage('snippets', updated)
    } catch (err) {
      setError('Error deleting snippet')
      console.error('Error deleting snippet:', err)
    }
  }

  const filtered = snippets.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search snippets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
      />

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-medium transition"
        >
          + New Snippet
        </button>
      )}

      {showForm && (
        <div className="space-y-2 p-3 bg-gray-800 rounded border border-gray-700">
          <p className="text-xs text-gray-400 font-medium">ADD NEW SNIPPET</p>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <input
            type="text"
            placeholder="Title"
            value={newSnippet.title}
            onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={newSnippet.language}
            onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="sql">SQL</option>
            <option value="react">React JSX</option>
            <option value="python">Python</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
          </select>
          <textarea
            placeholder="Code..."
            value={newSnippet.code}
            onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:border-blue-500"
            rows={5}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newSnippet.tags}
            onChange={(e) => setNewSnippet({ ...newSnippet, tags: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={addSnippet}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition"
            >
              💾 Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && !showForm ? (
        <p className="text-center text-gray-400 text-sm py-4">
          {snippets.length === 0 ? 'No snippets yet. Create one!' : 'No matching snippets'}
        </p>
      ) : (
        filtered.map(snippet => (
          <div key={snippet.id} className="p-3 bg-gray-800 rounded border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-100">{snippet.title}</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                    {snippet.language}
                  </span>
                  {snippet.tags.map(tag => (
                    <span key={tag} className="text-xs bg-blue-900 px-2 py-0.5 rounded text-blue-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <pre className="bg-gray-900 p-2 rounded text-xs overflow-x-auto mb-2 text-gray-300 border border-gray-700">
              <code>{snippet.code}</code>
            </pre>
            <div className="flex gap-2">
              <button
                onClick={() => copySnippet(snippet.code)}
                className="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded transition"
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
              <button
                onClick={() => deleteSnippet(snippet.id)}
                className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 rounded transition"
                title="Delete snippet"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
