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

const BANKMONITOR_LOGO =
  'https://bankmonitor.hu/wp-content/themes/bankmonitor/img/logos/bankmonitor.svg?x98872'

// Bankmonitor-aligned answer palette
const ANSWER_COLORS = ['#FA4616', '#72246C', '#0B5ED7', '#198754']
const TIMER_SECONDS = 15

const HERO_BG =
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'

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

  useEffect(() => {
    if (gameStatus === 'finished') {
      const duration = 3000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FA4616', '#FD7E14', '#72246C', '#ffffff'],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FA4616', '#FD7E14', '#72246C', '#ffffff'],
        })
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
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-white"
        style={{ background: HERO_BG }}
      >
        <img
          src={BANKMONITOR_LOGO}
          alt="Bankmonitor"
          className="absolute left-8 top-8 h-10"
          style={{ filter: 'brightness(0) invert(1)' }}
        />

        <div
          className="inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'var(--bm-primary)' }}
        >
          AI Workshop II. · Élő kvíz
        </div>

        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2
            className="text-xl font-semibold uppercase tracking-widest"
            style={{ color: '#FD7E14' }}
          >
            Csatlakozó PIN
          </h2>
          <p className="font-mono text-7xl font-black tracking-[0.3em] text-white">
            {pin || '...'}
          </p>

          <div
            className="mt-2 rounded-xl bg-white p-4"
            style={{ boxShadow: '0 8px 32px rgba(250, 70, 22, 0.25)' }}
          >
            <QRCodeSVG value={joinUrl} size={200} fgColor="#FA4616" />
          </div>

          <p className="text-sm text-white/60">
            Csatlakozás:{' '}
            <span className="text-white/90">{joinUrl}</span>
          </p>
        </motion.div>

        <div className="w-full max-w-3xl">
          <h3 className="mb-4 text-center text-xl font-semibold text-white/80">
            Játékosok ({players.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <AnimatePresence>
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <span className="text-2xl">{player.emoji}</span>
                  <span className="truncate font-semibold">{player.name}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          onClick={handleStartGame}
          disabled={players.length === 0}
          className="mt-4 rounded-lg px-12 py-4 text-xl font-bold text-white shadow-xl transition-all disabled:opacity-40"
          style={{ background: 'var(--bm-primary)' }}
          whileHover={players.length > 0 ? { scale: 1.05 } : {}}
          whileTap={players.length > 0 ? { scale: 0.95 } : {}}
        >
          Kvíz indítása
        </motion.button>
      </div>
    )
  }

  // ─── QUESTION ───────────────────────────────────────
  if (gameStatus === 'question' && currentQuestion) {
    const timerPercent = (timeLeft / TIMER_SECONDS) * 100

    return (
      <div
        className="flex min-h-screen flex-col p-6 text-white"
        style={{ background: HERO_BG }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <img
            src={BANKMONITOR_LOGO}
            alt="Bankmonitor"
            className="h-8"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-white/60">
              {questionIdx + 1} / {questions.length}
            </div>
            <div
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ background: 'var(--bm-primary)' }}
            >
              {currentQuestion.category}
            </div>
            <div className="text-sm text-white/60">
              {answerCount} / {players.length} válaszolt
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: timeLeft > 5 ? '#FD7E14' : '#FA4616',
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
            className="text-6xl font-black"
            style={{ color: timeLeft > 5 ? '#fff' : '#FA4616' }}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {timeLeft}
          </motion.span>
        </div>

        {/* Question text */}
        <h2 className="mb-10 text-center text-3xl font-extrabold leading-tight sm:text-4xl">
          {currentQuestion.text}
        </h2>

        {/* Answer grid */}
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4">
          {currentQuestion.options.map((option, idx) => (
            <motion.div
              key={option.label}
              className="flex items-center gap-4 rounded-xl p-6 text-xl font-bold text-white shadow-lg"
              style={{ backgroundColor: ANSWER_COLORS[idx] }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 text-lg">
                {option.label}
              </span>
              <span>{option.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleShowResults}
            className="rounded-lg border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20"
          >
            Eredmények mutatása
          </button>
        </div>
      </div>
    )
  }

  // ─── RESULTS ────────────────────────────────────────
  if (gameStatus === 'results' && currentQuestion) {
    const maxCount = Math.max(...Object.values(answerStats), 1)

    return (
      <div
        className="flex min-h-screen flex-col p-6 text-white"
        style={{ background: HERO_BG }}
      >
        <img
          src={BANKMONITOR_LOGO}
          alt="Bankmonitor"
          className="absolute left-8 top-8 h-8"
          style={{ filter: 'brightness(0) invert(1)' }}
        />

        <h2 className="mb-2 mt-8 text-center text-2xl font-bold">
          {currentQuestion.text}
        </h2>
        <p className="mb-8 text-center text-sm text-white/60">
          Helyes válasz:{' '}
          <span className="font-bold" style={{ color: '#FD7E14' }}>
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
                      opacity: isCorrect ? 1 : 0.35,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(widthPercent, 2)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                  {isCorrect && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-lg"
                      style={{
                        boxShadow: `0 0 20px ${ANSWER_COLORS[idx]}aa`,
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
          <h3 className="mb-4 text-center text-xl font-semibold text-white/80">
            Ranglista
          </h3>
          <div className="flex flex-col gap-2">
            {leaderboard.slice(0, 5).map((entry, idx) => (
              <motion.div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <span className="w-8 text-center text-lg font-bold text-white/50">
                  {idx + 1}
                </span>
                <span className="text-xl">{entry.emoji}</span>
                <span className="flex-1 truncate font-semibold">
                  {entry.name}
                </span>
                <span
                  className="font-mono font-bold"
                  style={{ color: '#FD7E14' }}
                >
                  {entry.score.toLocaleString('hu-HU')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <motion.button
            onClick={handleNextQuestion}
            className="rounded-lg px-10 py-4 text-xl font-bold text-white shadow-lg"
            style={{ background: 'var(--bm-primary)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {questionIdx + 1 < questions.length
              ? 'Következő kérdés'
              : 'Játék vége'}
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

    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
    const podiumHeights = ['h-32', 'h-44', 'h-24']
    const podiumLabels = ['2.', '1.', '3.']
    const podiumColors = ['#C0C0C0', '#FD7E14', '#CD7F32']

    return (
      <div
        className="flex min-h-screen flex-col items-center p-6 text-white"
        style={{ background: HERO_BG }}
      >
        <img
          src={BANKMONITOR_LOGO}
          alt="Bankmonitor"
          className="absolute left-8 top-8 h-8"
          style={{ filter: 'brightness(0) invert(1)' }}
        />

        <motion.h1
          className="mb-10 mt-8 text-5xl font-black"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Vége a kvíznek! 🎉
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
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: '#FD7E14' }}
                >
                  {entry.score.toLocaleString('hu-HU')}
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
            <span className="text-3xl font-black" style={{ color: '#FD7E14' }}>
              {players.length}
            </span>
            <span className="text-sm text-white/60">játékos</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black" style={{ color: '#FD7E14' }}>
              {avgScore.toLocaleString('hu-HU')}
            </span>
            <span className="text-sm text-white/60">átlagpontszám</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black" style={{ color: '#FD7E14' }}>
              {questions.length}
            </span>
            <span className="text-sm text-white/60">kérdés</span>
          </div>
        </div>

        {/* Full leaderboard */}
        <div className="w-full max-w-md">
          <h3 className="mb-4 text-center text-xl font-semibold text-white/80">
            Végeredmény
          </h3>
          <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto">
            {leaderboard.map((entry, idx) => (
              <motion.div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <span className="w-8 text-center text-lg font-bold text-white/50">
                  {idx + 1}
                </span>
                <span className="text-xl">{entry.emoji}</span>
                <span className="flex-1 truncate font-semibold">
                  {entry.name}
                </span>
                <span
                  className="font-mono font-bold"
                  style={{ color: '#FD7E14' }}
                >
                  {entry.score.toLocaleString('hu-HU')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center text-white"
      style={{ background: HERO_BG }}
    >
      <p className="text-xl">Töltés…</p>
    </div>
  )
}
