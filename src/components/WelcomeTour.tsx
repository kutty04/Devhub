import React, { useState } from 'react'

interface WelcomeTourProps {
  onComplete: () => void
}

export default function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [step, setStep] = useState(0)

  const slides = [
    {
      title: "Welcome to DevHub",
      desc: "Your coding command center is ready. Let's take a quick 30-second tour.",
      icon: "🚀"
    },
    {
      title: "Secure Vault",
      desc: "Store your API keys with industry-standard encryption. Choose a master password to keep them safe.",
      icon: "🔐"
    },
    {
      title: "Deployment Monitor",
      desc: "Watch your Vercel, GitHub, Render, and Netlify builds live. No more checking 4 different tabs.",
      icon: "🚀"
    },
    {
      title: "Snippets & Docs",
      desc: "Save your favorite code blocks and search docs for React, Node, and more—instantly and offline.",
      icon: "📝"
    },
    {
      title: "AI Assistant",
      desc: "Need help? Ask our high-speed Llama 3 AI assistant for code reviews or debugging help.",
      icon: "✨"
    }
  ]

  const current = slides[step]

  return (
    <div className="absolute inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-6 animate-bounce">{current.icon}</div>
      <h2 className="text-2xl font-bold text-white mb-4">{current.title}</h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-8">
        {current.desc}
      </p>

      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-blue-500' : 'w-2 bg-gray-700'}`}
          />
        ))}
      </div>

      <div className="flex gap-4 w-full">
        {step > 0 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 px-4 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-900 transition"
          >
            Back
          </button>
        )}
        <button 
          onClick={() => step < slides.length - 1 ? setStep(step + 1) : onComplete()}
          className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-900/20"
        >
          {step < slides.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
      
      <button 
        onClick={onComplete}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-400 text-xs"
      >
        Skip Tour
      </button>
    </div>
  )
}
