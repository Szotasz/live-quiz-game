'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createGame } from '@/lib/gameEngine'

const BANKMONITOR_LOGO =
  'https://bankmonitor.hu/wp-content/themes/bankmonitor/img/logos/bankmonitor.svg?x98872'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCreateGame = async () => {
    setLoading(true)
    try {
      const game = await createGame()
      router.push(`/admin/${game.id}`)
    } catch (err) {
      console.error('Failed to create game:', err)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      {/* Top logo */}
      <div className="absolute top-8 left-8">
        <img src={BANKMONITOR_LOGO} alt="Bankmonitor" className="h-8" />
      </div>

      <motion.div
        className="flex w-full max-w-2xl flex-col items-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest text-white"
          style={{ background: 'var(--bm-primary)' }}
        >
          AI Workshop II. · Élő kvíz
        </motion.div>

        <motion.h1
          className="text-center text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl"
          style={{ color: 'var(--bm-text-dark)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Hol tartottunk?{' '}
          <span style={{ color: 'var(--bm-primary)' }}>Tegyük próbára!</span>
        </motion.h1>

        <motion.p
          className="max-w-xl text-center text-lg sm:text-xl"
          style={{ color: 'var(--bm-text)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          15 kérdés az első workshop anyagából és aktuális magyar pénzügyi
          témákból. Csatlakozz a telefonoddal a bemutatott PIN-nel.
        </motion.p>

        <motion.button
          onClick={handleCreateGame}
          disabled={loading}
          className="mt-4 rounded-lg px-10 py-4 text-lg font-bold text-white shadow-lg transition-all disabled:opacity-50"
          style={{ background: 'var(--bm-primary)' }}
          whileHover={{ scale: 1.03, backgroundColor: '#E03E12' }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {loading ? 'Készül…' : 'Új játék indítása'}
        </motion.button>

        <motion.p
          className="mt-2 text-sm"
          style={{ color: 'var(--bm-text)', opacity: 0.6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.7 }}
        >
          Szota Szabolcs · AI a mindennapokban
        </motion.p>
      </motion.div>
    </div>
  )
}
