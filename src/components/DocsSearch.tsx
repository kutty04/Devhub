import React, { useState } from 'react'
import { searchDocs, DocItem } from '../services/docsIndex'

export default function DocsSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DocItem[]>([])

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (q.length > 0) {
      setResults(searchDocs(q))
    } else {
      setResults([])
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search React, Node, Supabase..."
        value={query}
        onChange={handleSearch}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
        autoFocus
      />

      {results.length === 0 && query.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          Type to search documentation for React, Node.js, and Supabase
        </p>
      )}

      {results.map((result, idx) => (
        <a
          key={idx}
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 bg-gray-800 hover:bg-gray-700 rounded transition border border-gray-700 hover:border-blue-500"
        >
          <p className="text-sm font-medium text-blue-400">📖 {result.title}</p>
          <p className="text-xs text-gray-400 mt-1">{result.category}</p>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{result.snippet}</p>
        </a>
      ))}

      {query.length > 0 && results.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">No docs found for "{query}"</p>
      )}
    </div>
  )
}
