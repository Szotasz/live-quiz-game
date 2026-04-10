export interface Question {
  id: number
  category: string
  text: string
  options: { label: string; text: string }[]
  correctAnswer: string
}

export const questions: Question[] = [
  // AI es fejlesztes
  {
    id: 1,
    category: 'AI es fejlesztes',
    text: 'Melyik evben jelent meg a ChatGPT?',
    options: [
      { label: 'A', text: '2021' },
      { label: 'B', text: '2022' },
      { label: 'C', text: '2023' },
      { label: 'D', text: '2020' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 2,
    category: 'AI es fejlesztes',
    text: 'Mit jelent az LLM rovidites?',
    options: [
      { label: 'A', text: 'Long Learning Machine' },
      { label: 'B', text: 'Large Language Model' },
      { label: 'C', text: 'Linear Logic Module' },
      { label: 'D', text: 'Low Latency Memory' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 3,
    category: 'AI es fejlesztes',
    text: 'Melyik programozasi nyelvet hasznaljak legtobbet AI fejlesztesre?',
    options: [
      { label: 'A', text: 'Java' },
      { label: 'B', text: 'C++' },
      { label: 'C', text: 'Python' },
      { label: 'D', text: 'Rust' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 4,
    category: 'AI es fejlesztes',
    text: 'Mi az a "hallucination" az AI kontextusaban?',
    options: [
      { label: 'A', text: 'Az AI almodik' },
      { label: 'B', text: 'Az AI magabiztosan allit valotlant' },
      { label: 'C', text: 'Az AI leall' },
      { label: 'D', text: 'Az AI kepeket general' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 5,
    category: 'AI es fejlesztes',
    text: 'Hany parametere van a GPT-4 modellnek (becsult)?',
    options: [
      { label: 'A', text: '175 milliard' },
      { label: 'B', text: '1,8 trillio' },
      { label: 'C', text: '500 milliard' },
      { label: 'D', text: '10 milliard' },
    ],
    correctAnswer: 'B',
  },
  // Pecs
  {
    id: 6,
    category: 'Pecs',
    text: 'Melyik hegyseg labanal talalhato Pecs?',
    options: [
      { label: 'A', text: 'Villanyi-hegyseg' },
      { label: 'B', text: 'Mecsek' },
      { label: 'C', text: 'Bakony' },
      { label: 'D', text: 'Bukk' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 7,
    category: 'Pecs',
    text: 'Melyik hires epulet talalhato Pecsen, amely UNESCO vilagorokseg?',
    options: [
      { label: 'A', text: 'Pannonhalmi apatsag' },
      { label: 'B', text: 'Hollokoi ofalu' },
      { label: 'C', text: 'Okereszteny sirkamrak' },
      { label: 'D', text: 'Fertodi kastely' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 8,
    category: 'Pecs',
    text: 'Mi a neve Pecs ikonikus terenek, ahol a dzsami all?',
    options: [
      { label: 'A', text: 'Kossuth ter' },
      { label: 'B', text: 'Szechenyi ter' },
      { label: 'C', text: 'Dom ter' },
      { label: 'D', text: 'Kiraly utca' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 9,
    category: 'Pecs',
    text: 'Hany lakosa van Pecsnek megkozelitoleg (2024)?',
    options: [
      { label: 'A', text: '200 000' },
      { label: 'B', text: '100 000' },
      { label: 'C', text: '140 000' },
      { label: 'D', text: '180 000' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 10,
    category: 'Pecs',
    text: 'Milyen kulturalis cimet nyert el Pecs 2010-ben?',
    options: [
      { label: 'A', text: 'Gasztronomiai fovaros' },
      { label: 'B', text: 'Europa Kulturalis Fovarosa' },
      { label: 'C', text: 'Sport fovarosa' },
      { label: 'D', text: 'Zold fovaros' },
    ],
    correctAnswer: 'B',
  },
  // Fun / Geek
  {
    id: 11,
    category: 'Fun / Geek',
    text: 'Mi a valasz az elet, a vilagmindenség, meg minden kerdesere?',
    options: [
      { label: 'A', text: '7' },
      { label: 'B', text: '42' },
      { label: 'C', text: '100' },
      { label: 'D', text: '3.14' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 12,
    category: 'Fun / Geek',
    text: 'Melyik billentyukombinacio a "mentes" szinte minden programban?',
    options: [
      { label: 'A', text: 'Ctrl+Z' },
      { label: 'B', text: 'Ctrl+V' },
      { label: 'C', text: 'Ctrl+S' },
      { label: 'D', text: 'Ctrl+X' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 13,
    category: 'Fun / Geek',
    text: 'Mit jelent a HTTP 418-as statuszkod?',
    options: [
      { label: 'A', text: 'Server Error' },
      { label: 'B', text: 'Not Found' },
      { label: 'C', text: "I'm a teapot" },
      { label: 'D', text: 'Forbidden' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 14,
    category: 'Fun / Geek',
    text: 'Hany bit egy byte?',
    options: [
      { label: 'A', text: '4' },
      { label: 'B', text: '16' },
      { label: 'C', text: '8' },
      { label: 'D', text: '2' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 15,
    category: 'Fun / Geek',
    text: 'Mi a "localhost" IP cime?',
    options: [
      { label: 'A', text: '192.168.1.1' },
      { label: 'B', text: '0.0.0.0' },
      { label: 'C', text: '10.0.0.1' },
      { label: 'D', text: '127.0.0.1' },
    ],
    correctAnswer: 'D',
  },
]
