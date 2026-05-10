const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

export async function askGroq(message: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured')
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: message }],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`)
    }
    
    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Groq error:', error)
    throw error
  }
}
