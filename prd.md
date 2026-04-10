# PRD: Live Quiz Game — Élő Kvíz Platform

## Összefoglaló

Kahoot-szerű, valós idejű multiplayer kvíz platform, amelyet egy 20 perces fejlesztői előadás élő demójaként építünk fel ~15 perc alatt Claude Code agent csapattal (T-Max). Az előadás helyszíne **Pécs**, a közönség fejlesztőkből áll. A demó csúcspontja: a közönség QR kódot olvas be és élőben játszik a frissen épített alkalmazással.

---

## Célok

1. **Élő demó:** 15 perc alatt, agent csapattal felépíteni egy működő multiplayer kvíz játékot
2. **Közönség bevonása:** Az előadás végén a teremben ülők telefonról játszanak
3. **Wow-faktor:** Vizuálisan látványos, animált, valós idejű szinkronizáció

---

## Funkcionális követelmények

### 1. Admin / Presenter nézet (Desktop)

- **Lobby képernyő**
  - Egyedi game PIN generálás (4-6 jegyű kód)
  - QR kód megjelenítés (a játék linkjével + PIN-nel)
  - Csatlakozott játékosok listája valós időben (név + avatar/emoji)
  - "Játék indítása" gomb (csak ha legalább 1 játékos van)

- **Kérdés képernyő**
  - Kérdés szövege nagyban
  - 4 válaszlehetőség (A/B/C/D), színkódolva (piros/kék/zöld/sárga)
  - Visszaszámláló timer (15 másodperc/kérdés)
  - Válaszok beérkezésének élő számlálója ("12/25 válaszolt")

- **Eredmény képernyő (kérdésenként)**
  - Helyes válasz kiemelése
  - Oszlopdiagram: hányan választották melyik opciót
  - Top 5 leaderboard a kérdés után

- **Végső eredmény képernyő**
  - Top 3 dobogó animációval (confetti)
  - Teljes rangsor scrollozható lista
  - Összesített statisztikák (átlag pontszám, leggyorsabb válasz)

### 2. Player nézet (Mobil-optimalizált)

- **Belépés képernyő**
  - PIN beviteli mező VAGY QR kódból automatikus belépés
  - Név megadása (kötelező, max 20 karakter)
  - Emoji/avatar választó (8-10 opció)

- **Várakozás képernyő**
  - "Várakozás a játék indítására..." üzenet
  - Saját név és emoji megjelenítése

- **Válasz képernyő**
  - 4 nagy, színes gomb (A/B/C/D) — a válaszok szövege IS megjelenik a telefonon
  - Visszaszámláló timer szinkronban az adminnal
  - Válasz után: "Válasz elküldve ✓" visszajelzés

- **Eredmény képernyő (kérdésenként)**
  - Helyes/helytelen visszajelzés (zöld pipa / piros X)
  - Szerzett pontszám (gyorsaság alapú: max 1000 pont, lineárisan csökken)
  - Aktuális helyezés

- **Végső eredmény (mobil)**
  - Saját helyezés nagyban
  - Összesített pontszám

### 3. Valós idejű szinkronizáció

- **Technológia:** Supabase Realtime (Presence + Broadcast)
- **Szinkronizálandó események:**
  - Játékos csatlakozás/kilépés → Lobby frissítés
  - Játék indítása → Összes kliens átnavigál
  - Kérdés megjelenítése → Timer szinkron indulás
  - Válasz beküldése → Admin számlálója frissül
  - Kérdés lezárása → Eredmény megjelenítés mindenhol
  - Következő kérdés / Játék vége → Navigáció szinkron

### 4. Pontozási rendszer

- Alap: 1000 pont helyes válaszért
- Gyorsasági bónusz: lineárisan csökken 1000-ról 500-ra a 15 mp alatt
- Helytelen válasz: 0 pont
- Nem válaszolt: 0 pont

---

## Kvíz tartalom — Kérdésbank

### Kategória 1: AI és fejlesztés (5 kérdés)

1. **Melyik évben jelent meg a ChatGPT?**
   - A) 2021 | B) 2022 ✓ | C) 2023 | D) 2020

2. **Mit jelent az LLM rövidítés?**
   - A) Long Learning Machine | B) Large Language Model ✓ | C) Linear Logic Module | D) Low Latency Memory

3. **Melyik programozási nyelvet használják legtöbbet AI fejlesztésre?**
   - A) Java | B) C++ | C) Python ✓ | D) Rust

4. **Mi az a "hallucination" az AI kontextusában?**
   - A) Az AI álmodik | B) Az AI magabiztosan állít valótlant ✓ | C) Az AI leáll | D) Az AI képeket generál

5. **Hány paramétere van a GPT-4 modellnek (becsült)?**
   - A) 175 milliárd | B) 1,8 trillió ✓ | C) 500 milliárd | D) 10 milliárd

### Kategória 2: Pécs (5 kérdés)

6. **Melyik hegység lábánál található Pécs?**
   - A) Villányi-hegység | B) Mecsek ✓ | C) Bakony | D) Bükk

7. **Melyik híres épület található Pécsen, amely UNESCO világörökség?**
   - A) Pannonhalmi apátság | B) Hollókői ófalu | C) Ókeresztény sírkamrák ✓ | D) Fertődi kastély

8. **Mi a neve Pécs ikonikus terének, ahol a dzsámi áll?**
   - A) Kossuth tér | B) Széchenyi tér ✓ | C) Dóm tér | D) Király utca

9. **Hány lakosa van Pécsnek megközelítőleg (2024)?**
   - A) 200 000 | B) 100 000 | C) 140 000 ✓ | D) 180 000

10. **Milyen kulturális címet nyert el Pécs 2010-ben?**
    - A) Gasztronómiai főváros | B) Európa Kulturális Fővárosa ✓ | C) Sport fővárosa | D) Zöld főváros

### Kategória 3: Fun / Geek (5 kérdés)

11. **Mi a válasz az élet, a világmindenség, meg minden kérdésére?**
    - A) 7 | B) 42 ✓ | C) 100 | D) 3.14

12. **Melyik billentyűkombináció a "mentés" szinte minden programban?**
    - A) Ctrl+Z | B) Ctrl+V | C) Ctrl+S ✓ | D) Ctrl+X

13. **Mit jelent a HTTP 418-as státuszkód?**
    - A) Server Error | B) Not Found | C) I'm a teapot ✓ | D) Forbidden

14. **Hány bit egy byte?**
    - A) 4 | B) 16 | C) 8 ✓ | D) 2

15. **Mi a "localhost" IP címe?**
    - A) 192.168.1.1 | B) 0.0.0.0 | C) 10.0.0.1 | D) 127.0.0.1 ✓

---

## Technológiai stack

| Réteg | Technológia |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS 4 + Framer Motion (animációk) |
| **Realtime** | Supabase Realtime (Broadcast + Presence) |
| **Database** | Supabase PostgreSQL (games, players, answers táblák) |
| **QR kód** | `qrcode.react` npm csomag |
| **Deployment** | GitHub → Netlify (automatikus deploy main branch-ről) |
| **Confetti** | `canvas-confetti` npm csomag |

---

## Adatbázis séma

### `games` tábla
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
pin         TEXT UNIQUE NOT NULL          -- 6 jegyű játék PIN
status      TEXT DEFAULT 'lobby'          -- lobby | active | question | results | finished
current_q   INTEGER DEFAULT 0            -- aktuális kérdés indexe (0-based)
created_at  TIMESTAMPTZ DEFAULT now()
```

### `players` tábla
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
game_id     UUID REFERENCES games(id) ON DELETE CASCADE
name        TEXT NOT NULL
emoji       TEXT DEFAULT '😀'
score       INTEGER DEFAULT 0
created_at  TIMESTAMPTZ DEFAULT now()
```

### `answers` tábla
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
game_id     UUID REFERENCES games(id) ON DELETE CASCADE
player_id   UUID REFERENCES players(id) ON DELETE CASCADE
question_idx INTEGER NOT NULL             -- kérdés index
answer      TEXT NOT NULL                 -- 'A', 'B', 'C', 'D'
is_correct  BOOLEAN NOT NULL
points      INTEGER DEFAULT 0
answered_at TIMESTAMPTZ DEFAULT now()
UNIQUE(game_id, player_id, question_idx)
```

---

## Deployment pipeline

### GitHub repository
- Repo neve: `Szotasz/live-quiz-game`
- Branch stratégia: `main` → automatikus production deploy

### Netlify konfiguráció
- **Site name:** `live-quiz-game` (→ `live-quiz-game.netlify.app`)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Runtime:** Next.js plugin (`@netlify/plugin-nextjs`) — automatikusan felismeri
- **Environment variables (Netlify UI-ban vagy `netlify.toml`-ban):**
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase projekt URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
  - `NEXT_PUBLIC_APP_URL` — `https://live-quiz-game.netlify.app` (QR kód generáláshoz)

### `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Deploy flow a demón
1. Agent csapat fejleszt → commit-ok a `main` branch-re
2. `git push origin main` → Netlify automatikusan build-el és deploy-ol (~60-90 mp)
3. A QR kód a Netlify URL-re mutat → közönség azonnal használhatja
4. **Fontos:** A Supabase env var-ok előre be lesznek állítva, így a deploy után azonnal működik

### Supabase projekt
- Meglévő vagy új projekt a `xbsjcpllwnyrsogxgmne` HELYETT — külön projekt erre a demóra
- Migrációk az agent csapat futtatja (`supabase db push` vagy Supabase MCP-n keresztül)
- RLS policy-k: nyitott (demó célra, nem production)

---

## Oldalstruktúra (route-ok)

```
/                     → Landing / Admin lobby létrehozás
/admin/[gameId]       → Admin/Presenter nézet (lobby → kérdések → eredmények)
/play                 → Játékos belépés (PIN megadás)
/play/[gameId]        → Játékos nézet (várakozás → válaszolás → eredmény)
```

---

## Agent csapat felosztás (Tmux / Ralph)

A projekt 6 párhuzamos user story-ra bontható:

| # | User Story | Leírás | Függőség |
|---|---|---|---|
| **US-1** | Projekt alapok + DB | Next.js init, Supabase setup, DB migráció, environment config | — |
| **US-2** | Game engine + Realtime | Supabase Realtime csatornák, game state management, pontozás logika | US-1 |
| **US-3** | Admin Lobby UI | PIN megjelenítés, QR kód, játékos lista, játék indítás gomb | US-1 |
| **US-4** | Admin Kérdés + Eredmény UI | Kérdés kijelzés, timer, válasz statisztikák, leaderboard, confetti | US-1, US-2 |
| **US-5** | Player mobil UI | Belépés, névadás, válasz gombok, eredmény visszajelzés | US-1, US-2 |
| **US-6** | Kérdésbank + kvíz logika | 15 kérdés JSON, kategória rendszer, randomizálás, helyes válasz ellenőrzés | — |
| **US-7** | Deploy pipeline | GitHub repo init, netlify.toml, Netlify site létrehozás + Supabase env vars, automatikus deploy | US-1 |

### Párhuzamosítási terv
```
Fázis 1 (parallel): US-1 + US-6
Fázis 2 (parallel): US-2 + US-3 + US-5 + US-7  (miután US-1 kész)
Fázis 3:            US-4                          (miután US-2 kész)
```

---

## UI/UX irányelvek

- **Színek:** Élénk, Kahoot-stílusú — piros (#E21B3C), kék (#1368CE), zöld (#26890C), sárga (#D89E00)
- **Betűtípus:** Inter (fejlécek bold, nagy méret a kivetítőn való olvashatóságért)
- **Animációk:** Framer Motion — kérdés belépés, timer pörgés, confetti, leaderboard átrendezés
- **Mobil-first a player oldalon:** Nagy gombok, egyszerű UI, egy kézzel használható
- **Admin oldal:** Kivetítőre optimalizált — nagy betűk, magas kontraszt, sötét háttér

---

## Demó forgatókönyv (az előadáson)

1. **0:00-1:00** — Bevezető: "Most 15 perc alatt felépítünk egy Kahoot klónt agent csapattal"
2. **1:00-2:00** — PRD megmutatása, agent csapat indítása
3. **2:00-12:00** — Élő fejlesztés, agent-ek párhuzamos munkája a kivetítőn
4. **12:00-13:00** — `git push origin main` → Netlify deploy elindul (közben magyarázat)
5. **13:00-14:00** — Deploy kész, Netlify URL-en QR kód megjelenik a kivetítőn
6. **14:00-15:00** — Közönség beolvas QR kódot, csatlakozik telefonról
7. **15:00-20:00** — **A közönség játszik!** 5-10 kérdés, élő rangsor, győztes kihirdetése

---

## Sikerességi kritériumok

- [ ] A Netlify deploy sikeresen lefut (`live-quiz-game.netlify.app` elérhető)
- [ ] QR kód a Netlify URL-re mutat, közönség csatlakozni tud telefonról
- [ ] Valós idejű szinkronizáció működik (kérdés megjelenés, válaszok beérkezése)
- [ ] Legalább 10 kérdés játszható
- [ ] Leaderboard helyesen rangsorol gyorsaság + helyesség alapján
- [ ] Confetti animáció a végén
- [ ] 30+ egyidejű játékos kezelése

---

## Kockázatok és mitigáció

| Kockázat | Mitigáció |
|---|---|
| Helyszíni WiFi lassú | Hotspot backup telefonról |
| Supabase Realtime limit | Free tier 200 concurrent — bőven elég |
| Build hiba a demó alatt | Előre tesztelt fallback branch git-ben |
| Netlify deploy lassú/hibás | Fallback: `next dev` lokálisan + ngrok tunnel |
| Túl sok kérdés, kifut az idő | Kérdések száma csökkenthető menet közben |
