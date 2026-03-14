import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const I18N = {
  en: {
    title: 'Word Search', subtitle: 'Find hidden words in the grid',
    create: 'Create Puzzle', filter_all: 'All', filter_my: 'Mine',
    search: 'Search…', words: 'words', play: 'Play',
    empty: 'No puzzles found', loading: 'Loading…',
    public: 'Public', private: 'Private',
    hideDone: 'Hide done', showDone: 'Show done',
    langs: { en: 'English', uk: 'Ukrainian', fi: 'Finnish' },
  },
  uk: {
    title: 'Філворди', subtitle: 'Знаходь приховані слова у сітці',
    create: 'Створити завдання', filter_all: 'Всі', filter_my: 'Мої',
    search: 'Пошук…', words: 'слів', play: 'Грати',
    empty: 'Завдань не знайдено', loading: 'Завантаження…',
    public: 'Публічне', private: 'Приватне',
    hideDone: 'Сховати виконані', showDone: 'Показати виконані',
    langs: { en: 'Англійська', uk: 'Українська', fi: 'Фінська' },
  },
  fi: {
    title: 'Täytäpelat', subtitle: 'Löydä piilotetut sanat ruudukosta',
    create: 'Luo tehtävä', filter_all: 'Kaikki', filter_my: 'Omat',
    search: 'Haku…', words: 'sanaa', play: 'Pelaa',
    empty: 'Tehtäviä ei löydy', loading: 'Ladataan…',
    public: 'Julkinen', private: 'Yksityinen',
    hideDone: 'Piilota tehdyt', showDone: 'Näytä tehdyt',
    langs: { en: 'Englanti', uk: 'Ukraina', fi: 'Suomi' },
  },
}

const LANG_FILTERS = [
  { value: '',   label: '🌍' },
  { value: 'en', label: '🇬🇧' },
  { value: 'uk', label: '🇺🇦' },
  { value: 'fi', label: '🇫🇮' },
]

export default function WordSearch({ theme, lang }) {
  const t = I18N[lang] || I18N.en
  const { me, getToken } = useAuth()
  const navigate = useNavigate()

  const [puzzles, setPuzzles]       = useState([])
  const [progress, setProgress]     = useState({}) // id → { is_done, found_words }
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterLang, setFilterLang] = useState('')
  const [filterMine, setFilterMine] = useState(false)
  const [hideDone, setHideDone]     = useState(false)

  const isDark  = theme === 'dark'
  const surface = isDark ? '#131929' : '#ffffff'
  const surface2= isDark ? '#1a2238' : '#eef1f8'
  const border  = isDark ? '#1e2d47' : '#d8deec'
  const text    = isDark ? '#e4ecf7' : '#0f1828'
  const muted   = isDark ? '#6b7fa3' : '#7a8aaa'
  const inputBg = isDark ? '#0e1220' : '#ffffff'

  // ── Load puzzles ──
  useEffect(() => {
    const token = getToken()
    axios.get('/api/wordsearch/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        const all = Array.isArray(res.data) ? res.data : res.data.results || []
        setPuzzles(all)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Load progress (только для залогиненных) ──
  useEffect(() => {
    if (!me) return
    const token = getToken()
    axios.get('/api/wordsearch/my-progress/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        const map = {}
        data.forEach(p => {
          map[p.id] = { is_done: p.is_done, found_words: p.found_words || [] }
        })
        setProgress(map)
      })
      .catch(() => {})
  }, [me])

  const filtered = puzzles.filter(p => {
    if (filterMine && p.author !== me?.username) return false
    if (filterLang && p.language !== filterLang) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (hideDone && progress[p.id]?.is_done) return false
    return true
  })

  const canCreate = me?.role === 'teacher' || me?.role === 'admin'

  const FilterBtn = ({ active, onClick, children }) => (
    <button onClick={onClick}
      className="px-3 py-2 rounded-xl border text-sm transition-all"
      style={{
        background:  active ? 'rgba(79,142,247,.1)' : surface2,
        borderColor: active ? '#4f8ef7' : border,
        color:       active ? '#4f8ef7' : muted,
        fontFamily: 'DM Sans, sans-serif',
        cursor: 'pointer',
      }}>
      {children}
    </button>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif', color: text }}>
            {t.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: muted }}>{t.subtitle}</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/wordsearch/create')}
            className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-85 inline-flex items-center gap-2"
            style={{ background: '#4f8ef7', color: '#fff', fontFamily: 'DM Sans, sans-serif', border: 'none', cursor: 'pointer' }}>
            + {t.create}
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">

        {/* Search */}
        <input
          type="text" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.search}
          className="px-4 py-2 rounded-xl border text-sm outline-none transition-all flex-1 min-w-48"
          style={{ background: inputBg, borderColor: border, color: text, fontFamily: 'DM Sans, sans-serif' }}
          onFocus={e => e.target.style.borderColor = '#4f8ef7'}
          onBlur={e => e.target.style.borderColor = border}
        />

        {/* Lang filter */}
        <div className="flex gap-1">
          {LANG_FILTERS.map(l => (
            <FilterBtn key={l.value} active={filterLang === l.value} onClick={() => setFilterLang(l.value)}>
              {l.label}
            </FilterBtn>
          ))}
        </div>

        {/* Mine filter */}
        {me && (
          <FilterBtn active={filterMine} onClick={() => setFilterMine(f => !f)}>
            {t.filter_my}
          </FilterBtn>
        )}

        {/* Hide done */}
        {me && (
          <FilterBtn active={hideDone} onClick={() => setHideDone(f => !f)}>
            {hideDone ? t.showDone : t.hideDone}
          </FilterBtn>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="text-center py-20" style={{ color: muted }}>{t.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <div style={{ color: muted }}>{t.empty}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PuzzleCard
              key={p.id} p={p} t={t}
              prog={progress[p.id]}
              theme={theme} surface={surface} border={border} text={text} muted={muted}
              onClick={() => navigate(`/wordsearch/${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PuzzleCard({ p, t, prog, theme, surface, border, text, muted, onClick }) {
  const langColor = {
    en: { bg: 'rgba(79,142,247,.15)',  color: '#4f8ef7' },
    uk: { bg: 'rgba(247,201,79,.15)',  color: '#f7c94f' },
    fi: { bg: 'rgba(56,217,169,.15)',  color: '#38d9a9' },
  }[p.language] || {}

  const isDone     = prog?.is_done
  const foundCount = prog?.found_words?.length || 0
  const progress   = p.word_count ? Math.round((foundCount / p.word_count) * 100) : 0

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-5 border transition-all hover:-translate-y-1 hover:border-blue-400 flex flex-col cursor-pointer"
      style={{
        background: surface, borderColor: isDone ? 'rgba(56,217,169,.4)' : border,
        boxShadow: theme === 'dark' ? '0 4px 24px rgba(0,0,0,.3)' : '0 4px 24px rgba(0,0,0,.06)',
      }}>

      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ background: langColor.bg, color: langColor.color }}>
          {p.language_display || p.language}
        </span>
        {isDone && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(56,217,169,.15)', color: '#38d9a9' }}>
            ✓ Done
          </span>
        )}
      </div>

      <div className="font-bold text-base mb-1 flex-1"
        style={{ fontFamily: 'Syne, sans-serif', color: text }}>
        {p.title}
      </div>

      <div className="text-xs mb-1" style={{ color: muted }}>
        {p.word_count} {t.words}
      </div>

      <div className="text-xs mb-3" style={{ color: muted }}>
        {p.author}
      </div>

      {/* Progress bar — только если есть прогресс */}
      {foundCount > 0 && !isDone && (
        <div className="mb-3">
          <div style={{ background: theme === 'dark' ? '#1e2d47' : '#d8deec', borderRadius: '4px', height: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px', background: '#4f8ef7',
              width: `${progress}%`, transition: 'width .4s',
            }} />
          </div>
          <div className="text-xs mt-1" style={{ color: muted }}>{foundCount}/{p.word_count}</div>
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            background: p.is_public ? 'rgba(56,217,169,.15)' : 'rgba(107,127,163,.15)',
            color:      p.is_public ? '#38d9a9' : muted,
          }}>
          {p.is_public ? t.public : t.private}
        </span>

        <span
          className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-85"
          style={{ background: '#4f8ef7', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
          {t.play}
        </span>
      </div>
    </div>
  )
}