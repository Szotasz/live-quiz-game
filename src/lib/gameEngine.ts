import { supabase } from '@/lib/supabase'

export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createGame() {
  const pin = generatePin()
  const { data, error } = await supabase
    .from('games')
    .insert({ pin, status: 'lobby', current_q: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinGame(gameId: string, name: string, emoji: string) {
  const { data, error } = await supabase
    .from('players')
    .insert({ game_id: gameId, name, emoji, score: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function startGame(gameId: string) {
  const { data, error } = await supabase
    .from('games')
    .update({ status: 'question', current_q: 0 })
    .eq('id', gameId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function submitAnswer(
  gameId: string,
  playerId: string,
  questionIdx: number,
  answer: string,
  timeElapsed: number,
  isCorrect: boolean
) {
  const score = isCorrect
    ? Math.max(500, Math.round(1000 - (timeElapsed / 15) * 500))
    : 0

  const { data: answerRow, error: answerError } = await supabase
    .from('answers')
    .insert({
      game_id: gameId,
      player_id: playerId,
      question_idx: questionIdx,
      answer,
      is_correct: isCorrect,
      points: score,
    })
    .select()
    .single()
  if (answerError) throw answerError

  if (score > 0) {
    const { error: updateError } = await supabase.rpc('increment_score', {
      p_player_id: playerId,
      p_points: score,
    })
    // Fallback: if the RPC doesn't exist, do a manual read-then-update
    if (updateError) {
      const { data: player } = await supabase
        .from('players')
        .select('score')
        .eq('id', playerId)
        .single()
      await supabase
        .from('players')
        .update({ score: (player?.score ?? 0) + score })
        .eq('id', playerId)
    }
  }

  return { ...answerRow, score }
}

export async function getLeaderboard(gameId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('score', { ascending: false })
  if (error) throw error
  return data
}

export async function nextQuestion(gameId: string, questionIdx: number) {
  const { data, error } = await supabase
    .from('games')
    .update({ current_q: questionIdx, status: 'question' })
    .eq('id', gameId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function showResults(gameId: string) {
  const { data, error } = await supabase
    .from('games')
    .update({ status: 'results' })
    .eq('id', gameId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function endGame(gameId: string) {
  const { data, error } = await supabase
    .from('games')
    .update({ status: 'finished' })
    .eq('id', gameId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAnswerStats(gameId: string, questionIdx: number) {
  const { data, error } = await supabase
    .from('answers')
    .select('answer')
    .eq('game_id', gameId)
    .eq('question_idx', questionIdx)
  if (error) throw error

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.answer] = (counts[row.answer] ?? 0) + 1
  }
  return counts
}
