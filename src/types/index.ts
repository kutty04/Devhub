export interface ApiKey {
  id: string
  service: string
  key: string
  masked: boolean
  createdAt: number
}

export interface Snippet {
  id: string
  title: string
  code: string
  tags: string[]
  language: string
  createdAt: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface DocItem {
  title: string
  url: string
  category: string
  snippet: string
}

export interface Deployment {
  id: string
  name: string
  state: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED' | 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS'
  url: string
  createdAt: number
  source: 'vercel' | 'github' | 'render' | 'netlify'
}
