'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { questions } from '@/data/questions'
import { submitAnswer, getLeaderboard } from '@/lib/gameEngine'
import { useGameChannel } from '@/lib/useGameChannel'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

type Phase = 'waiting' | 'question' | 'answered' | 'result' | 'finished'

const ANSWER_COLORS: Record<string, string> = {
  A: '#E21B3C',
  B: '#1368CE',
  C: '#26890C',
  D: '#D89E00',
}

const ANSWER_ICONS: Record<string, string> = {
  A: '▲',
  B: '◆',
  C: '●',
  D: '■',
}

export default function PlayerGamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const [phase, setPhase] = useState<Phase>('waiting')
  const [questionIdx, setQuestionIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [rank, setRank] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [playerName, setPlayerName] = useState('')
  const [playerEmoji, setPlayerEmoji] = useState('')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const questionStartRef = useRef<number>(Date.now())
  const playerId = typeof window !== 'undefined' ? sessionStorage.getItem('playerId') ?? '' : ''

  // Load player info
  useEffect(() => {
    if (!playerId) return
    import('@/lib/supabase').then(({ supabase }) => {
      supabase
        .from('players')
        .select('name, emoji')
        .eq('id', playerId)
        .single()
        .then(({ data }) => {
          if (data) {
            setPlayerName(data.name)
            setPlayerEmoji(data.emoji)
          }
        })
    })
  }, [playerId])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(15)
    questionStartRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Listen for game events
  useGameChannel(gameId, {
    onGameStart: () => {
      setPhase('waiting')
    },
    onQuestion: (payload: { questionIdx: number }) => {
      setQuestionIdx(payload.questionIdx)
      setSelectedAnswer(null)
      setPhase('question')
      startTimer()
    },
    onResults: (payload: { questionIdx: number }) => {
      if (timerRef.current) clearInterval(timerRef.current)
      // Fetch rank for this player
      getLeaderboard(gameId).then((lb) => {
        const entry = lb.find((e: { playerId: string }) => e.playerId === playerId)
        const playerRank = lb.findIndex((e: { playerId: string }) => e.playerId === playerId) + 1
        if (entry) {
          setTotalScore(entry.totalScore)
          setPointsEarned(entry.lastPoints ?? 0)
          setWasCorrect((entry.lastPoints ?? 0) > 0)
        }
        setRank(playerRank)
        setPhase('result')
      })
      void payload
    },
    onEnd: () => {
      if (timerRef.current) clearInterval(timerRef.current)
      getLeaderboard(gameId).then((lb) => {
        const playerRank = lb.findIndex((e: { playerId: string }) => e.playerId === playerId) + 1
        const entry = lb.find((e: { playerId: string }) => e.playerId === playerId)
        if (entry) setTotalScore(entry.totalScore)
        setRank(playerRank)
        setPhase('finished')
      })
    },
  })

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Confetti for top 3 on finish
  useEffect(() => {
    if (phase === 'finished' && rank > 0 && rank <= 3) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      })
    }
  }, [phase, rank])

  const currentQuestion = questions[questionIdx]

  async function handleAnswer(label: string) {
    if (phase !== 'question' || selectedAnswer) return
    setSelectedAnswer(label)
    if (timerRef.current) clearInterval(timerRef.current)

    const timeElapsed = (Date.now() - questionStartRef.current) / 1000
    const isCorrect = label === currentQuestion.correctAnswer

    setPhase('answered')

    try {
      await submitAnswer(gameId, playerId, questionIdx, label, timeElapsed, isCorrect)
    } catch {
      // Answer still recorded locally
    }
  }

  // WAITING phase
  if (phase === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-7xl mb-4">{playerEmoji || '🎮'}</div>
          <h1 className="text-3xl font-bold text-white mb-2">{playerName || 'Player'}</h1>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-purple-200 text-lg"
          >
            Waiting for game to start...
          </motion.p>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-yellow-400 rounded-full"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // QUESTION phase
  if (phase === 'question' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Timer bar */}
        <div className="p-3 flex items-center justify-between bg-gray-800">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden mr-3">
            <motion.div
              className="h-full bg-yellow-400 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 15) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          <span
            className={`text-2xl font-bold min-w-[2ch] text-right ${
              timeLeft <= 5 ? 'text-red-400' : 'text-white'
            }`}
          >
            {timeLeft}
          </span>
        </div>

        {/* Question text */}
        <div className="px-4 py-3 bg-gray-800/50">
          <p className="text-white text-center text-lg font-semibold leading-snug">
            {currentQuestion.text}
          </p>
        </div>

        {/* Answer buttons */}
        <div className="flex-1 p-3 grid grid-rows-4 gap-3">
          {currentQuestion.options.map((option) => (
            <motion.button
              key={option.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option.label)}
              className="w-full rounded-xl text-white font-bold text-lg flex items-center gap-3 px-5 shadow-lg active:brightness-90"
              style={{ backgroundColor: ANSWER_COLORS[option.label] }}
            >
              <span className="text-2xl opacity-70">{ANSWER_ICONS[option.label]}</span>
              <span className="flex-1 text-left">{option.text}</span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ANSWERED subphase
  if (phase === 'answered') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: ANSWER_COLORS[selectedAnswer ?? 'A'] }}
          >
            <span className="text-4xl text-white">{ANSWER_ICONS[selectedAnswer ?? 'A']}</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Answer sent!</h2>
          <p className="text-gray-400 text-lg">Waiting for results...</p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-gray-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // RESULT phase
  if (phase === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key="result"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center"
          >
            {/* Correct / Incorrect */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 ${
                wasCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <span className="text-5xl text-white">{wasCorrect ? '✓' : '✗'}</span>
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-4">
              {wasCorrect ? 'Correct!' : 'Incorrect'}
            </h2>

            {/* Points */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <span
                className={`text-4xl font-extrabold ${
                  wasCorrect ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                +{pointsEarned}
              </span>
              <p className="text-gray-400 text-sm mt-1">points</p>
            </motion.div>

            {/* Rank */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 inline-block"
            >
              <span className="text-yellow-400 text-3xl font-bold">#{rank}</span>
              <p className="text-gray-400 text-xs mt-1">current rank</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // FINISHED phase
  if (phase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          {/* Rank */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-8xl font-extrabold mb-4 ${
              rank <= 3 ? 'text-yellow-400' : 'text-white'
            }`}
          >
            #{rank}
          </motion.div>

          {/* Medal for top 3 */}
          {rank === 1 && <div className="text-6xl mb-4">🥇</div>}
          {rank === 2 && <div className="text-6xl mb-4">🥈</div>}
          {rank === 3 && <div className="text-6xl mb-4">🥉</div>}

          {/* Score */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <p className="text-purple-200 text-sm uppercase tracking-wider mb-1">Total Score</p>
            <p className="text-5xl font-extrabold text-white">{totalScore.toLocaleString()}</p>
          </motion.div>

          {/* Thank you */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-purple-200 text-lg"
          >
            Thanks for playing! 🎉
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return null
}
