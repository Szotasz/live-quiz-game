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
  A: '#FA4616', // Bankmonitor orange
  B: '#72246C', // Bankmonitor purple
  C: '#0B5ED7', // Blue
  D: '#198754', // Green
}

const ANSWER_ICONS: Record<string, string> = {
  A: '▲',
  B: '◆',
  C: '●',
  D: '■',
}

const HERO_BG =
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'

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
  const playerId =
    typeof window !== 'undefined' ? sessionStorage.getItem('playerId') ?? '' : ''

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

  const { trackPresence } = useGameChannel(gameId, {
    onGameStart: () => {
      setPhase('waiting')
    },
    onQuestion: (payload: { questionIdx: number }) => {
      setQuestionIdx(payload.questionIdx)
      setSelectedAnswer(null)
      setPhase('question')
      startTimer()
    },
    onResults: () => {
      if (timerRef.current) clearInterval(timerRef.current)
      getLeaderboard(gameId).then((lb) => {
        const playerRank = lb.findIndex((e: { id: string }) => e.id === playerId) + 1
        const entry = lb.find((e: { id: string }) => e.id === playerId)
        if (entry) setTotalScore(entry.score)
        setRank(playerRank)
        setPhase('result')
      })
    },
    onEnd: () => {
      if (timerRef.current) clearInterval(timerRef.current)
      getLeaderboard(gameId).then((lb) => {
        const playerRank = lb.findIndex((e: { id: string }) => e.id === playerId) + 1
        const entry = lb.find((e: { id: string }) => e.id === playerId)
        if (entry) setTotalScore(entry.score)
        setRank(playerRank)
        setPhase('finished')
      })
    },
  })

  useEffect(() => {
    if (playerId && playerName) {
      trackPresence({ id: playerId, name: playerName, emoji: playerEmoji })
    }
  }, [playerId, playerName, playerEmoji, trackPresence])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (phase === 'finished' && rank > 0 && rank <= 3) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FA4616', '#FD7E14', '#72246C', '#ffffff'],
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

    const points = isCorrect
      ? Math.max(500, Math.round(1000 - (timeElapsed / 15) * 500))
      : 0
    setWasCorrect(isCorrect)
    setPointsEarned(points)
    setPhase('answered')

    try {
      await submitAnswer(gameId, playerId, questionIdx, label, timeElapsed, isCorrect)
    } catch {
      // Answer still recorded locally
    }
  }

  // ─── WAITING ───────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{ background: HERO_BG }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="mb-4 text-7xl">{playerEmoji || '🎮'}</div>
          <h1 className="mb-2 text-3xl font-extrabold text-white">
            {playerName || 'Játékos'}
          </h1>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg"
            style={{ color: '#FD7E14' }}
          >
            Várunk a kezdésre…
          </motion.p>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-3 w-3 rounded-full"
                style={{ background: '#FA4616' }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── QUESTION ───────────────────────────────────────
  if (phase === 'question' && currentQuestion) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-900">
        {/* Timer bar */}
        <div
          className="flex items-center justify-between p-3"
          style={{ background: '#0f3460' }}
        >
          <div className="mr-3 h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: timeLeft > 5 ? '#FD7E14' : '#FA4616' }}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 15) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          <span
            className={`min-w-[2ch] text-right text-2xl font-bold ${
              timeLeft <= 5 ? 'text-white' : 'text-white'
            }`}
            style={timeLeft <= 5 ? { color: '#FA4616' } : undefined}
          >
            {timeLeft}
          </span>
        </div>

        {/* Question text */}
        <div className="bg-gray-800/50 px-4 py-3">
          <p className="text-center text-lg font-semibold leading-snug text-white">
            {currentQuestion.text}
          </p>
        </div>

        {/* Answer buttons */}
        <div className="grid flex-1 grid-rows-4 gap-3 p-3">
          {currentQuestion.options.map((option) => (
            <motion.button
              key={option.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option.label)}
              className="flex w-full items-center gap-3 rounded-xl px-5 text-lg font-bold text-white shadow-lg active:brightness-90"
              style={{ backgroundColor: ANSWER_COLORS[option.label] }}
            >
              <span className="text-2xl opacity-70">
                {ANSWER_ICONS[option.label]}
              </span>
              <span className="flex-1 text-left">{option.text}</span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ─── ANSWERED ───────────────────────────────────────
  if (phase === 'answered') {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{ background: HERO_BG }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div
            className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: ANSWER_COLORS[selectedAnswer ?? 'A'] }}
          >
            <span className="text-4xl text-white">
              {ANSWER_ICONS[selectedAnswer ?? 'A']}
            </span>
          </div>
          <h2 className="mb-2 text-3xl font-extrabold text-white">
            Válasz elküldve!
          </h2>
          <p className="text-lg text-white/60">Várunk az eredményre…</p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: '#FD7E14' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── RESULT ───────────────────────────────────────
  if (phase === 'result') {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{ background: HERO_BG }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="result"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full"
              style={{ background: wasCorrect ? '#198754' : '#FA4616' }}
            >
              <span className="text-5xl text-white">
                {wasCorrect ? '✓' : '✗'}
              </span>
            </motion.div>

            <h2 className="mb-4 text-2xl font-bold text-white">
              {wasCorrect ? 'Helyes!' : 'Nem jó'}
            </h2>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <span
                className="text-4xl font-extrabold"
                style={{ color: wasCorrect ? '#FD7E14' : '#6b7280' }}
              >
                +{pointsEarned}
              </span>
              <p className="mt-1 text-sm text-white/60">pont</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block rounded-xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm"
            >
              <span
                className="text-3xl font-bold"
                style={{ color: '#FD7E14' }}
              >
                #{rank}
              </span>
              <p className="mt-1 text-xs text-white/60">jelenlegi helyezés</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ─── FINISHED ───────────────────────────────────────
  if (phase === 'finished') {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{ background: HERO_BG }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-8xl font-black"
            style={{ color: rank <= 3 ? '#FD7E14' : '#ffffff' }}
          >
            #{rank}
          </motion.div>

          {rank === 1 && <div className="mb-4 text-6xl">🥇</div>}
          {rank === 2 && <div className="mb-4 text-6xl">🥈</div>}
          {rank === 3 && <div className="mb-4 text-6xl">🥉</div>}

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <p className="mb-1 text-sm uppercase tracking-wider text-white/60">
              Összes pontszám
            </p>
            <p className="text-5xl font-extrabold text-white">
              {totalScore.toLocaleString('hu-HU')}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg"
            style={{ color: '#FD7E14' }}
          >
            Köszi, hogy játszottál! 🎉
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return null
}
