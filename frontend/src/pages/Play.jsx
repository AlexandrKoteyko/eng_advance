import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const I18N = {
  en: {
    back: '← Back', loading: 'Loading…', notFound: 'Puzzle not found',
    by: 'by', words: 'Find words', found: 'found',
    markDone: 'Mark done', unmark: '✓ Done', reset: '↺ Reset',
    allFound: 'Puzzle complete!', congrats: 'Great job!',
    backList: 'Back to list', playAgain: 'Play again',
    resetConfirm: 'Reset progress?',
  },
  uk: {
    back: '← Назад', loading: 'Завантаження…', notFound: 'Завдання не знайдено',
    by: 'автор', words: 'Знайди слова', found: 'знайдено',
    markDone: 'Позначити', unmark: '✓ Виконано', reset: '↺ Заново',
    allFound: 'Всі слова знайдено!', congrats: 'Вітаємо!',
    backList: 'До списку', playAgain: 'Грати ще раз',
    resetConfirm: 'Скинути прогрес?',
  },
  fi: {
    back: '← Takaisin', loading: 'Ladataan…', notFound: 'Tehtävää ei löydy',
    by: 'tekijä', words: 'Löydä sanat', found: 'löydetty',
    markDone: 'Merkitse', unmark: '✓ Tehty', reset: '↺ Nollaa',
    allFound: 'Kaikki löydetty!', congrats: 'Hienoa!',
    backList: 'Listaan', playAgain: 'Pelaa uudelleen',
    resetConfirm: 'Nollataan edistyminen?',
  },
}

const PALETTE = [
  { bg: 'rgba(56,217,169,.22)',  border: '#38d9a9', color: '#38d9a9' },
  { bg: 'rgba(249,115,22,.2)',   border: '#f97316', color: '#f97316' },
  { bg: 'rgba(168,85,247,.22)',  border: '#a855f7', color: '#c084fc' },
  { bg: 'rgba(234,179,8,.2)',    border: '#eab308', color: '#fbbf24' },
  { bg: 'rgba(236,72,153,.2)',   border: '#ec4899', color: '#f472b6' },
  { bg: 'rgba(14,165,233,.22)',  border: '#0ea5e9', color: '#38bdf8' },
  { bg: 'rgba(34,197,94,.2)',    border: '#22c55e', color: '#4ade80' },
  { bg: 'rgba(239,68,68,.2)',    border: '#ef4444', color: '#f87171' },
]

function getLine(s, e) {
  const dr = e.r - s.r, dc = e.c - s.c
  let end = e
  if (dr !== 0 && dc !== 0) {
    end = Math.abs(dr) > Math.abs(dc) ? { r: e.r, c: s.c } : { r: s.r, c: e.c }
  }
  const cells = []
  const sr = Math.sign(end.r - s.r), sc = Math.sign(end.c - s.c)
  const steps = Math.max(Math.abs(end.r - s.r), Math.abs(end.c - s.c))
  let r = s.r, c = s.c
  for (let i = 0; i <= steps; i++) { cells.push({ r, c }); r += sr; c += sc }
  return cells
}

export default function Play({ theme, lang }) {
  const t = I18N[lang] || I18N.en
  const { id } = useParams()
  const { me, getToken } = useAuth()
  const navigate = useNavigate()

  const [puzzle, setPuzzle]           = useState(null)
  const [loading, setLoading]         = useState(true)
  const [foundWords, setFoundWords]   = useState(new Set())
  const [foundCells, setFoundCells]   = useState({})  // "r,c" → palette index
  const [isDone, setIsDone]           = useState(false)
  const [selCells, setSelCells]       = useState([])
  const [showOverlay, setShowOverlay] = useState(false)

  const colorCounter = useRef(0)
  const wordColorMap = useRef({})
  const dragging     = useRef(false)
  const startCell    = useRef(null)

  const isDark  = theme === 'dark'
  const surface = isDark ? '#131929' : '#ffffff'
  const border  = isDark ? '#1e2d47' : '#d8deec'
  const text    = isDark ? '#e4ecf7' : '#0f1828'
  const muted   = isDark ? '#6b7fa3' : '#7a8aaa'
  const surface2= isDark ? '#1a2238' : '#eef1f8'

  // ── Load ──
  useEffect(() => {
    const token = getToken()
    axios.get(`/api/wordsearch/${id}/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).then(res => {
      const data = res.data
      setPuzzle(data)

      if (data.progress?.found_words?.length) {
        const fw = new Set(data.progress.found_words)
        setFoundWords(fw)
        setIsDone(data.progress.is_done || false)

        // Восстанавливаем подсветку по оригинальным координатам
        const cells = {}
        fw.forEach(word => {
          const idx = colorCounter.current % PALETTE.length
          wordColorMap.current[word] = idx
          colorCounter.current++
          const p = data.grid_data.placements?.find(pl => pl.word === word)
          if (!p) return
          const dr = p.direction === 'V' ? 1 : 0
          const dc = p.direction === 'H' ? 1 : 0
          for (let i = 0; i < word.length; i++) {
            cells[`${p.row + i * dr},${p.col + i * dc}`] = idx
          }
        })
        setFoundCells(cells)
      }
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const getPalette = (idx) => PALETTE[idx % PALETTE.length]

  // ── Drag ──
  const onStart = (r, c) => {
    dragging.current = true
    startCell.current = { r, c }
    setSelCells([{ r, c }])
  }

  const onMove = (r, c) => {
    if (!dragging.current || !startCell.current) return
    setSelCells(getLine(startCell.current, { r, c }))
  }

  const onEnd = () => {
    if (!dragging.current) return
    dragging.current = false
    setSelCells(prev => {
      checkWord(prev)
      return []
    })
  }

  // ── Check word — ищем по оригинальным координатам ──
  const checkWord = (cells) => {
    if (!puzzle || cells.length < 2) return

    const grid        = puzzle.grid_data.grid
    const word        = cells.map(({ r, c }) => grid[r]?.[c] || '').join('')
    const wordRev     = word.split('').reverse().join('')
    const placedWords = puzzle.grid_data.placed_words || []
    const match       = placedWords.find(w => w === word || w === wordRev)

    if (!match || foundWords.has(match)) return

    // Найдено — берём оригинальные координаты из placements
    const p = puzzle.grid_data.placements?.find(pl => pl.word === match)
    if (!p) return

    const colorIdx = colorCounter.current % PALETTE.length
    wordColorMap.current[match] = colorIdx
    colorCounter.current++

    // Подсвечиваем оригинальные клетки
    const dr = p.direction === 'V' ? 1 : 0
    const dc = p.direction === 'H' ? 1 : 0
    setFoundCells(prev => {
      const next = { ...prev }
      for (let i = 0; i < match.length; i++) {
        next[`${p.row + i * dr},${p.col + i * dc}`] = colorIdx
      }
      return next
    })

    setFoundWords(prev => {
      const next = new Set([...prev, match])

      if (me) {
        const token = getToken()
        axios.post(`/api/wordsearch/${id}/found/`,
          { word: match },
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => {
          if (res.data.is_done) setIsDone(true)
        }).catch(() => {})
      }

      if (next.size === placedWords.length) {
        setTimeout(() => setShowOverlay(true), 500)
      }

      return next
    })
  }

  // ── Touch ──
  const handleTouchMove = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const cell = el?.closest('[data-r]')
    if (!cell) return
    onMove(+cell.dataset.r, +cell.dataset.c)
  }

  // ── Mark done ──
  const handleToggleDone = async () => {
    const newDone = !isDone
    setIsDone(newDone)
    if (me) {
      try {
        await axios.post(`/api/wordsearch/${id}/done/`,
          { is_done: newDone },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        )
      } catch {}
    }
  }

  // ── Reset ──
  const handleReset = async (silent = false) => {
    if (!silent && !window.confirm(t.resetConfirm)) return
    setFoundWords(new Set())
    setIsDone(false)
    setFoundCells({})
    setShowOverlay(false)
    colorCounter.current = 0
    wordColorMap.current = {}
    if (me) {
      try {
        await axios.post(`/api/wordsearch/${id}/reset/`,
          {}, { headers: { Authorization: `Bearer ${getToken()}` } }
        )
      } catch {}
    }
  }

  // ── Render ──
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ color: muted }}>
      {t.loading}
    </div>
  )
  if (!puzzle) return (
    <div className="flex items-center justify-center min-h-screen" style={{ color: muted }}>
      {t.notFound}
    </div>
  )

  const grid        = puzzle.grid_data.grid || []
  const placedWords = puzzle.grid_data.placed_words || []
  const words       = puzzle.words || []
  const gridSize    = grid.length
  const progress    = placedWords.length ? (foundWords.size / placedWords.length) * 100 : 0

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => navigate('/wordsearch')}
          className="px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all flex-shrink-0"
          style={{ borderColor: border, color: muted, background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}>
          {t.back}
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-extrabold truncate"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', color: text }}>
            {puzzle.title}
          </h1>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex-shrink-0"
          style={{
            background: puzzle.language === 'en' ? 'rgba(79,142,247,.15)' : puzzle.language === 'uk' ? 'rgba(247,201,79,.15)' : 'rgba(56,217,169,.15)',
            color:      puzzle.language === 'en' ? '#4f8ef7' : puzzle.language === 'uk' ? '#f7c94f' : '#38d9a9',
          }}>
          {puzzle.language_display}
        </span>

        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <button onClick={() => handleReset(false)}
            className="px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
            style={{ borderColor: border, color: muted, background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}>
            {t.reset}
          </button>
          <button onClick={handleToggleDone}
            className="px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
            style={{
              borderColor: isDone ? '#38d9a9' : border,
              color:       isDone ? '#38d9a9' : muted,
              background:  isDone ? 'rgba(56,217,169,.12)' : 'transparent',
              fontFamily: 'DM Sans, sans-serif',
            }}>
            {isDone ? t.unmark : t.markDone}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 200px', gap: '24px', alignItems: 'start' }}>

        {/* Grid */}
        <div style={{ overflowX: 'auto' }}>
          <div
            style={{
              display: 'inline-grid',
              gridTemplateColumns: `repeat(${gridSize}, 34px)`,
              gap: '3px',
              background: surface,
              border: `1px solid ${border}`,
              borderRadius: '14px',
              padding: '10px',
              cursor: 'crosshair',
              userSelect: 'none',
              touchAction: 'none',
            }}
            onMouseLeave={() => { if (dragging.current) onEnd() }}
            onTouchMove={handleTouchMove}
            onTouchEnd={onEnd}
          >
            {grid.map((row, ri) =>
              row.map((cell, ci) => {
                const key      = `${ri},${ci}`
                const colorIdx = foundCells[key]
                const pal      = colorIdx !== undefined ? getPalette(colorIdx) : null
                const inSel    = selCells.some(s => s.r === ri && s.c === ci)

                return (
                  <div
                    key={key}
                    data-r={ri}
                    data-c={ci}
                    onMouseDown={() => onStart(ri, ci)}
                    onMouseEnter={() => onMove(ri, ci)}
                    onMouseUp={onEnd}
                    onTouchStart={() => onStart(ri, ci)}
                    style={{
                      width: '34px', height: '34px',
                      borderRadius: '5px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.82rem', fontWeight: '700',
                      fontFamily: 'Syne, sans-serif',
                      border: '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'background .1s, border-color .1s, color .1s',
                      background:  inSel ? 'rgba(79,142,247,.22)' : pal ? pal.bg : surface2,
                      borderColor: inSel ? '#4f8ef7'              : pal ? pal.border : 'transparent',
                      color:       inSel ? '#4f8ef7'              : pal ? pal.color : isDark ? '#b0bfd8' : '#3a4a6b',
                    }}
                  >
                    {cell}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Word panel */}
        <div style={{
          background: surface, border: `1px solid ${border}`,
          borderRadius: '14px', padding: '16px',
          position: 'sticky', top: 'calc(64px + 16px)',
        }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: muted }}>
            {t.words}
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            {words.map(w => {
              const isFound   = foundWords.has(w.word)
              const idx       = wordColorMap.current[w.word]
              const pal       = idx !== undefined ? getPalette(idx) : null
              const notPlaced = !placedWords.includes(w.word)

              return (
                <div key={w.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-semibold"
                  style={{
                    background:     isFound && pal ? pal.bg : 'transparent',
                    color:          isFound && pal ? pal.color : text,
                    textDecoration: isFound ? 'line-through' : 'none',
                    border:         `1px solid ${isFound && pal ? pal.border : border}`,
                    fontFamily: 'DM Sans, sans-serif',
                    opacity: notPlaced ? 0.4 : 1,
                  }}>
                  {isFound && pal && (
                    <span style={{ fontSize: '.72rem', flexShrink: 0, color: pal.color }}>✓</span>
                  )}
                  {w.word}
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div style={{ background: border, borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px', background: '#38d9a9',
              width: `${progress}%`, transition: 'width .4s',
            }} />
          </div>
          <div className="text-center text-xs mt-1.5" style={{ color: muted }}>
            {foundWords.size}/{placedWords.length} {t.found}
          </div>
        </div>
      </div>

      {/* ── Complete overlay ── */}
      {showOverlay && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-5"
          style={{ background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowOverlay(false) }}
        >
          <div className="text-center rounded-2xl p-12 border max-w-sm w-full"
            style={{ background: surface, borderColor: '#38d9a9', animation: 'popIn .35s ease' }}>
            <div style={{ fontSize: '3.2rem', marginBottom: '14px' }}>🎉</div>
            <h2 className="font-extrabold text-2xl mb-2"
              style={{ fontFamily: 'Syne, sans-serif', color: '#38d9a9' }}>
              {t.allFound}
            </h2>
            <p className="mb-6" style={{ color: muted }}>{t.congrats}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => { setShowOverlay(false); handleReset(true) }}
                className="px-5 py-2.5 rounded-xl border text-sm font-bold"
                style={{ borderColor: border, color: text, background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}>
                {t.playAgain}
              </button>
              <button onClick={() => navigate('/wordsearch')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: '#4f8ef7', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                {t.backList}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn { from { transform:scale(.8); opacity:0 } to { transform:scale(1); opacity:1 } }
      `}</style>
    </div>
  )
}