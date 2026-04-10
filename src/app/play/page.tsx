'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { joinGame } from '@/lib/gameEngine'

const EMOJIS = ['😀', '🎮', '🚀', '🔥', '💡', '🎯', '🏆', '👾', '🦄', '🌟']

function JoinForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [pin, setPin] = useState(searchParams.get('pin') ?? '')
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('😀')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canJoin = pin.length >= 4 && name.trim().length > 0

  async function handleJoin() {
    if (!canJoin || loading) return
    setLoading(true)
    setError('')

    try {
      const { data: game, error: dbError } = await supabase
        .from('games')
        .select('*')
        .eq('pin', pin)
        .single()

      if (dbError || !game) {
        setError('Game not found. Check the PIN and try again.')
        setLoading(false)
        return
      }

      const playerId = await joinGame(game.id, name.trim(), emoji)
      sessionStorage.setItem('playerId', playerId)
      router.push(`/play/${game.id}`)
    } catch {
      setError('Failed to join game. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2">Join Quiz</h1>
          <p className="text-purple-200 text-sm">Enter the game PIN to play</p>
        </div>

        <div className="space-y-4">
          {/* PIN Input */}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Game PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center text-3xl font-bold tracking-[0.3em] py-4 px-4 rounded-xl bg-white/95 text-gray-900 placeholder:text-gray-400 placeholder:text-xl placeholder:tracking-normal focus:outline-none focus:ring-4 focus:ring-yellow-400"
          />

          {/* Name Input */}
          <input
            type="text"
            maxLength={20}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-center text-xl py-3 px-4 rounded-xl bg-white/95 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400"
          />

          {/* Emoji Picker */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-purple-200 text-xs text-center mb-2">Pick your avatar</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    emoji === e
                      ? 'bg-yellow-400 scale-110 shadow-lg'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-300 text-center text-sm font-medium">{error}</p>
          )}

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={!canJoin || loading}
            className={`w-full py-4 rounded-xl text-xl font-bold transition-all ${
              canJoin && !loading
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 active:scale-95 shadow-lg'
                : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Joining...
              </span>
            ) : (
              `Join Game ${emoji}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 flex items-center justify-center">
          <div className="text-white text-xl animate-pulse">Loading...</div>
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  )
}
