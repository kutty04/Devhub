import docsData from '../data/docs.json'

export interface DocItem {
  title: string
  url: string
  category: string
  snippet: string
}

export function searchDocs(query: string): DocItem[] {
  const lowerQuery = query.toLowerCase()
  
  return docsData.docs.filter(doc => 
    doc.title.toLowerCase().includes(lowerQuery) ||
    doc.snippet.toLowerCase().includes(lowerQuery) ||
    doc.category.toLowerCase().includes(lowerQuery)
  ).slice(0, 5) // Top 5 results
}
