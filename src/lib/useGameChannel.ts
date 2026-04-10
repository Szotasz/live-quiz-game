'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface GameHandlers {
  onGameStart?: () => void
  onQuestion?: (payload: { questionIdx: number }) => void
  onResults?: (payload: { questionIdx: number }) => void
  onEnd?: () => void
  onAnswerCount?: (payload: { count: number }) => void
  onPresenceSync?: (state: Record<string, unknown[]>) => void
}

export function useGameChannel(gameId: string, handlers: GameHandlers) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const handlersRef = useRef(handlers)
  const pendingPresenceRef = useRef<Record<string, unknown> | null>(null)
  handlersRef.current = handlers

  const [presenceState, setPresenceState] = useState<Record<string, unknown[]>>({})

  const broadcast = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      channelRef.current?.send({
        type: 'broadcast',
        event,
        payload,
      })
    },
    []
  )

  const trackPresence = useCallback(
    (data: Record<string, unknown>) => {
      if (channelRef.current) {
        channelRef.current.track(data)
      } else {
        pendingPresenceRef.current = data
      }
    },
    []
  )

  useEffect(() => {
    if (!gameId) return

    const channel = supabase.channel(`game:${gameId}`)

    channel
      .on('broadcast', { event: 'game:start' }, () => {
        handlersRef.current.onGameStart?.()
      })
      .on('broadcast', { event: 'game:question' }, ({ payload }) => {
        handlersRef.current.onQuestion?.(payload as { questionIdx: number })
      })
      .on('broadcast', { event: 'game:results' }, ({ payload }) => {
        handlersRef.current.onResults?.(payload as { questionIdx: number })
      })
      .on('broadcast', { event: 'game:end' }, () => {
        handlersRef.current.onEnd?.()
      })
      .on('broadcast', { event: 'game:answer_count' }, ({ payload }) => {
        handlersRef.current.onAnswerCount?.(payload as { count: number })
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setPresenceState(state as Record<string, unknown[]>)
        handlersRef.current.onPresenceSync?.(state as Record<string, unknown[]>)
      })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channelRef.current = channel
        // If there's pending presence data, track it now
        if (pendingPresenceRef.current) {
          channel.track(pendingPresenceRef.current)
          pendingPresenceRef.current = null
        }
      }
    })
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [gameId])

  return { channel: channelRef.current, presenceState, broadcast, trackPresence }
}
