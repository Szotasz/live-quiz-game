@AGENTS.md

# Live Quiz Game - Project Guide

## Tech Stack
- Next.js 15 (App Router) with TypeScript
- Tailwind CSS 4 + Framer Motion for animations
- Supabase Realtime (Broadcast + Presence) for multiplayer sync
- Supabase PostgreSQL for persistence
- `qrcode.react` for QR codes, `canvas-confetti` for confetti

## Supabase
- Project ID: `ngioqhbeeviursajjiqa`
- URL: `https://ngioqhbeeviursajjiqa.supabase.co`
- Use `import { supabase } from '@/lib/supabase'` everywhere
- DB tables: `games`, `players`, `answers` (already created)

## Key Files Already Created
- `src/lib/supabase.ts` — Supabase client singleton
- `src/data/questions.ts` — 15 quiz questions with Question type
- `.env.local` — Environment variables
- `netlify.toml` — Netlify deploy config

## Routes
- `/` — Landing / Admin lobby creation
- `/admin/[gameId]` — Admin/Presenter view
- `/play` — Player join (PIN entry)
- `/play/[gameId]` — Player game view

## UI Guidelines
- Kahoot-style colors: red #E21B3C, blue #1368CE, green #26890C, yellow #D89E00
- Dark background for admin (projector-optimized)
- Mobile-first for player views, large touch targets
- Use Framer Motion for animations
- Use 'use client' directive for all interactive components

## Realtime Channel Pattern
Use Supabase Broadcast + Presence on channel `game:{gameId}`:
- Broadcast events: `game:start`, `game:question`, `game:answer`, `game:results`, `game:end`
- Presence: track joined players in lobby

## Scoring
- Correct: 1000 base, linearly decreasing to 500 over 15 seconds
- Incorrect/no answer: 0 points

## IMPORTANT
- Read AGENTS.md and check `node_modules/next/dist/docs/` for Next.js 15 API changes before writing code
- All page/layout components are Server Components by default — add 'use client' for interactive ones
- Use the App Router pattern (src/app/...)
