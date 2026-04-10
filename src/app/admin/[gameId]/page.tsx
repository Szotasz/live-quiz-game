'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { questions } from '@/data/questions'
import {
  startGame,
  nextQuestion,
  showResults,
  endGame,
  getLeaderboard,
  getAnswerStats,
} from '@/lib/gameEngine'
import { useGameChannel } from '@/lib/useGameChannel'
import { supabase } from '@/lib/supabase'

type GameStatus = 'lobby' | 'question' | 'results' | 'finished'

interface Player {
  id: string
  name: string
  emoji: string
}

interface LeaderboardEntry {
  id: string
  name: string
  emoji: string
  score: number
}

interface AnswerStat {
  label: string
  count: number
}

const ANSWER_COLORS = ['#E21B3C', '#1368CE', '#26890C', '#D89E00']
const TIMER_SECONDS = 15

export default function AdminPage() {
  const params = useParams()
  const gameId = params.gameId as string

  const [gameStatus, setGameStatus] = useState<GameStatus>('lobby')
  const [pin, setPin] = useState<string>('')
  const [players, setPlayers] = useState<Player[]>([])
  const [questionIdx, setQuestionIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [answerCount, setAnswerCount] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({})
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentQuestion = questions[questionIdx]

  // Fetch game PIN on mount
  useEffect(() => {
    const fetchGame = async () => {
      const { data } = await supabase
        .from('games')
        .select('pin')
        .eq('id', gameId)
        .single()
      if (data) setPin(data.pin)
    }
    fetchGame()
  }, [gameId])

  // Subscribe to realtime channel
  const { broadcast } = useGameChannel(gameId, {
    onPresenceSync: (state) => {
      const joined: Player[] = []
      for (const key in state) {
        const presences = state[key] as { name: string; emoji: string; id: string }[]
        for (const p of presences) {
          joined.push({ id: p.id || key, name: p.name, emoji: p.emoji })
        }
      }
      setPlayers(joined)
    },
    onAnswerCount: (payload) => {
      setAnswerCount(payload.count)
    },
  })

  // Timer logic for question phase
  useEffect(() => {
    if (gameStatus !== 'question') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    setTimeLeft(TIMER_SECONDS)
    setAnswerCount(0)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          handleShowResults()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, questionIdx])

  // Confetti on finished
  useEffect(() => {
    if (gameStatus === 'finished') {
      const duration = 3000
      const end = Date.now() + duration
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } })
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [gameStatus])

  const handleStartGame = useCallback(async () => {
    await startGame(gameId)
    broadcast('game:start', {})
    broadcast('game:question', { questionIdx: 0 })
    setQuestionIdx(0)
    setGameStatus('question')
  }, [gameId, broadcast])

  const handleShowResults = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    await showResults(gameId)
    broadcast('game:results', { questionIdx })

    const [lb, stats] = await Promise.all([
      getLeaderboard(gameId),
      getAnswerStats(gameId, questionIdx),
    ])
    setLeaderboard(lb)
    setAnswerStats(stats)
    setGameStatus('results')
  }, [gameId, questionIdx, broadcast])

  const handleNextQuestion = useCallback(async () => {
    const nextIdx = questionIdx + 1
    if (nextIdx >= questions.length) {
      await endGame(gameId)
      broadcast('game:end', {})
      const lb = await getLeaderboard(gameId)
      setLeaderboard(lb)
      setGameStatus('finished')
    } else {
      await nextQuestion(gameId, nextIdx)
      broadcast('game:question', { questionIdx: nextIdx })
      setQuestionIdx(nextIdx)
      setAnswerCount(0)
      setGameStatus('question')
    }
  }, [gameId, questionIdx, broadcast])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const joinUrl = `${appUrl}/play?pin=${pin}`

  // ─── LOBBY ──────────────────────────────────────────
  if (gameStatus === 'lobby') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#1a1a2e] p-6 text-white">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-semibold text-zinc-400">Game PIN</h2>
          <p className="font-mono text-7xl font-bold tracking-[0.3em] text-white">
            {pin || '...'}
          </p>

          <div className="mt-2 rounded-xl bg-white p-4">
            <QRCodeSVG value={joinUrl} size={200} />
          </div>

          <p className="text-sm text-zinc-500">
            Join at <span className="text-zinc-300">{joinUrl}</span>
          </p>
        </motion.div>

        <div className="w-full max-w-2xl">
          <h3 className="mb-4 text-center text-xl font-semibold text-zinc-300">
            Players ({players.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <AnimatePresence>
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <span className="text-2xl">{player.emoji}</span>
                  <span className="truncate font-medium">{player.name}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          onClick={handleStartGame}
          disabled={players.length === 0}
          className="mt-4 rounded-xl bg-[#26890C] px-12 py-4 text-xl font-bold text-white shadow-lg transition-all disabled:opacity-50"
          whileHover={players.length > 0 ? { scale: 1.05 } : {}}
          whileTap={players.length > 0 ? { scale: 0.95 } : {}}
        >
          Start Game
        </motion.button>
      </div>
    )
  }

  // ─── QUESTION ───────────────────────────────────────
  if (gameStatus === 'question' && currentQuestion) {
    const timerPercent = (timeLeft / TIMER_SECONDS) * 100

    return (
      <div className="flex min-h-screen flex-col bg-[#1a1a2e] p-6 text-white">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-400">
            Question {questionIdx + 1} / {questions.length}
          </div>
          <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-300">
            {currentQuestion.category}
          </div>
          <div className="text-sm text-zinc-400">
            {answerCount} / {players.length} answered
          </div>
        </div>

        {/* Timer bar */}
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: timeLeft > 5 ? '#26890C' : '#E21B3C',
            }}
            initial={{ width: '100%' }}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Timer number */}
        <div className="mb-8 text-center">
          <motion.span
            key={timeLeft}
            className="text-5xl font-bold"
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {timeLeft}
          </motion.span>
        </div>

        {/* Question text */}
        <h2 className="mb-10 text-center text-3xl font-bold leading-tight sm:text-4xl">
          {currentQuestion.text}
        </h2>

        {/* Answer grid */}
        <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-4">
          {currentQuestion.options.map((option, idx) => (
            <motion.div
              key={option.label}
              className="flex items-center gap-4 rounded-xl p-6 text-xl font-bold text-white"
              style={{ backgroundColor: ANSWER_COLORS[idx] }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg">
                {option.label}
              </span>
              <span>{option.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Manual show results */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleShowResults}
            className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/20"
          >
            Show Results
          </button>
        </div>
      </div>
    )
  }

  // ─── RESULTS ────────────────────────────────────────
  if (gameStatus === 'results' && currentQuestion) {
    const maxCount = Math.max(...Object.values(answerStats), 1)

    return (
      <div className="flex min-h-screen flex-col bg-[#1a1a2e] p-6 text-white">
        <h2 className="mb-2 text-center text-2xl font-bold">
          {currentQuestion.text}
        </h2>
        <p className="mb-8 text-center text-sm text-zinc-400">
          Correct answer:{' '}
          <span className="font-bold text-[#26890C]">
            {currentQuestion.options.find(
              (o) => o.label === currentQuestion.correctAnswer
            )?.text}
          </span>
        </p>

        {/* Answer bar chart */}
        <div className="mx-auto mb-10 flex w-full max-w-3xl flex-col gap-3">
          {currentQuestion.options.map((option, idx) => {
            const count = answerStats[option.label] || 0
            const isCorrect = option.label === currentQuestion.correctAnswer
            const widthPercent = (count / maxCount) * 100

            return (
              <div key={option.label} className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: ANSWER_COLORS[idx] }}
                >
                  {option.label}
                </span>
                <div className="relative flex-1">
                  <motion.div
                    className="h-10 rounded-lg"
                    style={{
                      backgroundColor: ANSWER_COLORS[idx],
                      opacity: isCorrect ? 1 : 0.4,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(widthPercent, 2)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                  {isCorrect && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        boxShadow: `0 0 20px ${ANSWER_COLORS[idx]}80`,
                      }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </div>
                <span className="w-12 text-right font-mono text-lg font-bold">
                  {count}
                </span>
              </div>
            )
          })}
        </div>

        {/* Leaderboard top 5 */}
        <div className="mx-auto w-full max-w-md">
          <h3 className="mb-4 text-center text-xl font-semibold text-zinc-300">
            Leaderboard
          </h3>
          <div className="flex flex-col gap-2">
            {leaderboard.slice(0, 5).map((entry, idx) => (
              <motion.div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <span className="w-8 text-center text-lg font-bold text-zinc-400">
                  {idx + 1}
                </span>
                <span className="text-xl">{entry.emoji}</span>
                <span className="flex-1 truncate font-medium">
                  {entry.name}
                </span>
                <span className="font-mono font-bold text-[#D89E00]">
                  {entry.score.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <div className="mt-8 flex justify-center">
          <motion.button
            onClick={handleNextQuestion}
            className="rounded-xl bg-[#1368CE] px-10 py-4 text-xl font-bold text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {questionIdx + 1 < questions.length ? 'Next Question' : 'End Game'}
          </motion.button>
        </div>
      </div>
    )
  }

  // ─── FINISHED ───────────────────────────────────────
  if (gameStatus === 'finished') {
    const top3 = leaderboard.slice(0, 3)
    const avgScore =
      leaderboard.length > 0
        ? Math.round(
            leaderboard.reduce((sum, e) => sum + e.score, 0) /
              leaderboard.length
          )
        : 0

    // Podium order: 2nd, 1st, 3rd
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
    const podiumHeights = ['h-32', 'h-44', 'h-24']
    const podiumLabels = ['2nd', '1st', '3rd']
    const podiumColors = ['#C0C0C0', '#FFD700', '#CD7F32']

    return (
      <div className="flex min-h-screen flex-col items-center bg-[#1a1a2e] p-6 text-white">
        <motion.h1
          className="mb-10 text-4xl font-extrabold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Game Over!
        </motion.h1>

        {/* Podium */}
        <div className="mb-12 flex items-end gap-4">
          {podiumOrder.map((entry, idx) => {
            if (!entry) return null
            return (
              <motion.div
                key={entry.id}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
              >
                <span className="text-3xl">{entry.emoji}</span>
                <span className="max-w-[100px] truncate text-center text-sm font-semibold">
                  {entry.name}
                </span>
                <span className="font-mono text-sm font-bold text-[#D89E00]">
                  {entry.score.toLocaleString()}
                </span>
                <div
                  className={`${podiumHeights[idx]} w-24 rounded-t-lg`}
                  style={{ backgroundColor: podiumColors[idx] }}
                >
                  <div className="flex h-full items-center justify-center text-lg font-bold text-black/60">
                    {podiumLabels[idx]}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="mb-8 flex gap-8">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">{players.length}</span>
            <span className="text-sm text-zinc-400">Players</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">{avgScore.toLocaleString()}</span>
            <span className="text-sm text-zinc-400">Avg Score</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">{questions.length}</span>
            <span className="text-sm text-zinc-400">Questions</span>
          </div>
        </div>

        {/* Full leaderboard */}
        <div className="w-full max-w-md">
          <h3 className="mb-4 text-center text-xl font-semibold text-zinc-300">
            Final Standings
          </h3>
          <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto">
            {leaderboard.map((entry, idx) => (
              <motion.div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <span className="w-8 text-center text-lg font-bold text-zinc-400">
                  {idx + 1}
                </span>
                <span className="text-xl">{entry.emoji}</span>
                <span className="flex-1 truncate font-medium">
                  {entry.name}
                </span>
                <span className="font-mono font-bold text-[#D89E00]">
                  {entry.score.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Fallback loading state
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e] text-white">
      <p className="text-xl">Loading...</p>
    </div>
  )
}
