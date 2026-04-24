import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="card w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Monitor Polític</h2>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contrasenya</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none focus:border-primary"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn btn-primary mt-6"
          >
            {loading ? 'Carregant...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
