export interface Question {
  id: number
  category: string
  text: string
  options: { label: string; text: string }[]
  correctAnswer: string
}

export const questions: Question[] = [
  // ─────────── Workshop I. felelevenítő (2026-03-26) ───────────
  {
    id: 1,
    category: 'Workshop I. ismétlés',
    text: 'Mi a promptolás 4 pillére? (Szerep, Kontextus, Feladat, ?)',
    options: [
      { label: 'A', text: 'Hossz' },
      { label: 'B', text: 'Formátum' },
      { label: 'C', text: 'Stílus' },
      { label: 'D', text: 'Nyelv' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 2,
    category: 'Workshop I. ismétlés',
    text: '„Senior hitelszakértőként írj egy ajánlatot…" — melyik pillért érvényesíti ez a mondat?',
    options: [
      { label: 'A', text: 'Feladat' },
      { label: 'B', text: 'Kontextus' },
      { label: 'C', text: 'Szerep' },
      { label: 'D', text: 'Formátum' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 3,
    category: 'Workshop I. ismétlés',
    text: 'Mit jelent a „kontextus" egy promptban?',
    options: [
      { label: 'A', text: 'A feladat lépéseinek felsorolása' },
      { label: 'B', text: 'A háttér és az adatok, amiket az AI-nak tudnia kell' },
      { label: 'C', text: 'Az output hosszának megadása' },
      { label: 'D', text: 'A modell neve' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 4,
    category: 'Workshop I. ismétlés',
    text: 'Melyik a JOBB prompt egy jelzáloghitel-ajánlatról szóló emailhez?',
    options: [
      { label: 'A', text: '„Írj egy emailt lakáshitelről."' },
      { label: 'B', text: '„Generálj emailt az ajánlatról."' },
      { label: 'C', text: '„Senior hitelszakértőként írj Kovács Ádámnak, aki 35M Ft hitelt keres 20 évre — emeld ki a 5.98%-os UniCredit ajánlat előnyeit, max 150 szó."' },
      { label: 'D', text: '„Reklámszöveg, lakáshitel, kedvező, gyors."' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 5,
    category: 'Workshop I. ismétlés',
    text: 'Mit jelent a „Skill" a mi munkafolyamatunkban?',
    options: [
      { label: 'A', text: 'Egy drága AI modell, ami mindent tud' },
      { label: 'B', text: 'Előre megírt utasítás-készlet, amit az AI mindig ugyanúgy követ — a munkátokra szabva' },
      { label: 'C', text: 'Automatikusan elvégez mindent helyettünk, beavatkozás nélkül' },
      { label: 'D', text: 'Csak programozók tudják használni' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 6,
    category: 'Workshop I. ismétlés',
    text: 'Az első workshopon mit töltöttünk ki AI-val meeting jegyzetből?',
    options: [
      { label: 'A', text: 'Banki kölcsönigénylő űrlapokat (K&H, CIB, Raiffeisen)' },
      { label: 'B', text: 'Munkaszerződést' },
      { label: 'C', text: 'Adóbevallást' },
      { label: 'D', text: 'Lakásbiztosítási kötvényt' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 7,
    category: 'Workshop I. ismétlés',
    text: '167 oldalas banki ajánlat → hány mondatos közérthető összefoglalót készítettünk az ügyfélnek?',
    options: [
      { label: 'A', text: '1 mondatot' },
      { label: 'B', text: '5 mondatot' },
      { label: 'C', text: '20 mondatot' },
      { label: 'D', text: '50 mondatot' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 8,
    category: 'Workshop I. ismétlés',
    text: 'Melyik NEM kulcs-eleme egy jó sales emailnek?',
    options: [
      { label: 'A', text: 'Személyre szabott megnyitás' },
      { label: 'B', text: 'Értéket adó tartalom' },
      { label: 'C', text: 'Egyértelmű call-to-action' },
      { label: 'D', text: 'Minél hosszabb legyen, hogy minden részletet lefedjen' },
    ],
    correctAnswer: 'D',
  },
  {
    id: 9,
    category: 'Workshop II. mai nap',
    text: 'Mi a mai workshop fő fókusza az elsőhöz képest?',
    options: [
      { label: 'A', text: 'Python programozás tanulása' },
      { label: 'B', text: 'Skillek, MCP szerverek, pluginok — AI testre szabása' },
      { label: 'C', text: 'Kriptovaluta-kereskedés' },
      { label: 'D', text: 'Excel makrózás' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 10,
    category: 'Workshop I. ismétlés',
    text: 'Mi az AI legnagyobb ereje az ügyfélszerzésben?',
    options: [
      { label: 'A', text: 'Teljes automatizálás — nem kell embert bevonni' },
      { label: 'B', text: 'Ügyfelek automatikus felhívása' },
      { label: 'C', text: 'Percek alatt megír egy perszonalizált emailt, amire egyébként fél óra kellene' },
      { label: 'D', text: 'Kiválasztja helyettünk, kit ne szolgáljunk ki' },
    ],
    correctAnswer: 'C',
  },

  // ─────────── Aktuális magyar pénzügyi témák (2026) ───────────
  {
    id: 11,
    category: 'Aktuális magyar',
    text: 'Az Otthon Start Program 2026 januárjától milyen fix kamat mellett indult?',
    options: [
      { label: 'A', text: '2%' },
      { label: 'B', text: '3%' },
      { label: 'C', text: '5%' },
      { label: 'D', text: '6,5%' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 12,
    category: 'Aktuális magyar',
    text: 'Mit jelent a THM rövidítés egy hitelnél?',
    options: [
      { label: 'A', text: 'Teljes Havi Mutató' },
      { label: 'B', text: 'Teljes Hiteldíj Mutató' },
      { label: 'C', text: 'Törlesztési Havi Minimum' },
      { label: 'D', text: 'Tényleges Havi Muszáj' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 13,
    category: 'Aktuális magyar',
    text: 'Maximum mekkora összeget lehet igényelni Babaváró hitelként Magyarországon 2026-ban?',
    options: [
      { label: 'A', text: '5 millió Ft' },
      { label: 'B', text: '10 millió Ft' },
      { label: 'C', text: '11 millió Ft' },
      { label: 'D', text: '20 millió Ft' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 14,
    category: 'Aktuális magyar',
    text: 'Hány bank és pénzintézet ajánlatát hasonlítja össze a Bankmonitor?',
    options: [
      { label: 'A', text: '10+' },
      { label: 'B', text: '25+' },
      { label: 'C', text: '50+' },
      { label: 'D', text: '100+' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 15,
    category: 'Aktuális magyar',
    text: 'Melyik intézmény határozza meg Magyarországon a jegybanki alapkamatot?',
    options: [
      { label: 'A', text: 'Pénzügyminisztérium' },
      { label: 'B', text: 'Magyar Államkincstár' },
      { label: 'C', text: 'Magyar Nemzeti Bank (MNB)' },
      { label: 'D', text: 'Európai Központi Bank' },
    ],
    correctAnswer: 'C',
  },
]
