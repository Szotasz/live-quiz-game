'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createGame } from '@/lib/gameEngine'

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a2e] px-4">
      <motion.div
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-center text-6xl font-extrabold tracking-tight sm:text-7xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="bg-gradient-to-r from-[#E21B3C] via-[#D89E00] to-[#1368CE] bg-clip-text text-transparent">
            Live Quiz Game
          </span>
        </motion.h1>

        <motion.p
          className="text-lg text-zinc-400 sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Kahoot-style realtime quiz
        </motion.p>

        <motion.button
          onClick={handleCreateGame}
          disabled={loading}
          className="mt-4 rounded-xl bg-gradient-to-r from-[#E21B3C] to-[#D89E00] px-10 py-4 text-xl font-bold text-white shadow-lg transition-all disabled:opacity-50"
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(226, 27, 60, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {loading ? 'Creating...' : 'Create New Game'}
        </motion.button>
      </motion.div>
    </div>
  )
}
