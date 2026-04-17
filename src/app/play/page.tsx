'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { joinGame } from '@/lib/gameEngine'

const BANKMONITOR_LOGO =
  'https://bankmonitor.hu/wp-content/themes/bankmonitor/img/logos/bankmonitor.svg?x98872'

const EMOJIS = ['😀', '🎯', '🚀', '🔥', '💡', '🏆', '👾', '🦄', '🌟', '🧠']

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
        setError('Nem találjuk ezt a PIN-t. Ellenőrizd és próbáld újra!')
        setLoading(false)
        return
      }

      const player = await joinGame(game.id, name.trim(), emoji)
      sessionStorage.setItem('playerId', player.id)
      router.push(`/play/${game.id}`)
    } catch {
      setError('Hiba történt a csatlakozás során.')
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{ background: 'var(--bm-bg-alt)' }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img
            src={BANKMONITOR_LOGO}
            alt="Bankmonitor"
            className="mx-auto mb-4 h-8"
          />
          <h1
            className="mb-1 text-3xl font-extrabold"
            style={{ color: 'var(--bm-text-dark)' }}
          >
            Csatlakozás a kvízhez
          </h1>
          <p className="text-sm" style={{ color: 'var(--bm-text)', opacity: 0.7 }}>
            Add meg a vetítőn látható PIN kódot
          </p>
        </div>

        <div className="space-y-4">
          {/* PIN Input */}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-4 text-center text-3xl font-bold tracking-[0.3em] text-gray-900 shadow-sm placeholder:text-xl placeholder:tracking-normal placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-4"
            style={{
              // focus ring via tailwind needs color — use inline for brand orange
              // @ts-expect-error custom css var
              '--tw-ring-color': 'rgba(250, 70, 22, 0.35)',
            }}
          />

          {/* Name Input */}
          <input
            type="text"
            maxLength={20}
            placeholder="Neved"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-lg text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-4"
            style={{
              // @ts-expect-error custom css var
              '--tw-ring-color': 'rgba(250, 70, 22, 0.35)',
            }}
          />

          {/* Emoji Picker */}
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <p
              className="mb-2 text-center text-xs"
              style={{ color: 'var(--bm-text)', opacity: 0.7 }}
            >
              Válassz avatart
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`rounded-lg p-2 text-2xl transition-all ${
                    emoji === e
                      ? 'scale-110 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={
                    emoji === e
                      ? { background: 'var(--bm-primary)', color: '#fff' }
                      : undefined
                  }
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-center text-sm font-medium"
              style={{ color: 'var(--bm-primary)' }}
            >
              {error}
            </p>
          )}

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={!canJoin || loading}
            className={`w-full rounded-lg py-4 text-lg font-bold text-white shadow-md transition-all ${
              canJoin && !loading ? 'active:scale-95' : 'cursor-not-allowed opacity-50'
            }`}
            style={{ background: 'var(--bm-primary)' }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Csatlakozás…
              </span>
            ) : (
              `Csatlakozom ${emoji}`
            )}
          </button>
        </div>

        <p
          className="text-center text-xs"
          style={{ color: 'var(--bm-text)', opacity: 0.5 }}
        >
          Bankmonitor AI Workshop II.
        </p>
      </div>
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--bm-bg-alt)' }}
        >
          <div className="animate-pulse text-lg" style={{ color: 'var(--bm-text)' }}>
            Töltés…
          </div>
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  )
}
