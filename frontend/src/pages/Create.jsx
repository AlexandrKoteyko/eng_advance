import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const I18N = {
  en: {
    hd: 'Create Word Search', title: 'Puzzle title', lang: 'Language',
    vis: 'Visibility', priv: 'Private', pub: 'Public', words: 'Words',
    modeComma: 'Comma list', modeManual: 'One by one',
    commaHint: 'Enter words separated by commas. Example: CAT, DOG, BIRD',
    colWord: 'Word', colHint: 'Hint (optional)', addRow: '+ Add word',
    submit: 'Generate & Save', submitting: 'Generating…',
    errTitle: 'Enter a title', errWords: 'Add at least 2 words',
    errAuth: 'Login as teacher or admin', ok: 'Created! Redirecting…',
  },
  uk: {
    hd: 'Створити філворд', title: 'Назва завдання', lang: 'Мова',
    vis: 'Доступ', priv: 'Приватне', pub: 'Публічне', words: 'Слова',
    modeComma: 'Через кому', modeManual: 'По одному',
    commaHint: 'Введіть слова через кому. Приклад: КІТ, ПЕС, ПТАХ',
    colWord: 'Слово', colHint: 'Підказка (необов\'язково)', addRow: '+ Додати слово',
    submit: 'Згенерувати та зберегти', submitting: 'Генерую…',
    errTitle: 'Введіть назву', errWords: 'Додайте хоча б 2 слова',
    errAuth: 'Увійдіть як вчитель або адмін', ok: 'Створено! Переходжу…',
  },
  fi: {
    hd: 'Luo täytäpeli', title: 'Tehtävän nimi', lang: 'Kieli',
    vis: 'Näkyvyys', priv: 'Yksityinen', pub: 'Julkinen', words: 'Sanat',
    modeComma: 'Pilkulla erotettu', modeManual: 'Yksitellen',
    commaHint: 'Kirjoita sanat pilkuilla erotettuina. Esimerkki: KISSA, KOIRA',
    colWord: 'Sana', colHint: 'Vihje (valinnainen)', addRow: '+ Lisää sana',
    submit: 'Luo ja tallenna', submitting: 'Luodaan…',
    errTitle: 'Anna nimi', errWords: 'Lisää vähintään 2 sanaa',
    errAuth: 'Kirjaudu opettajana tai ylläpitäjänä', ok: 'Luotu! Siirrytään…',
  },
}

const LANGS = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'uk', label: '🇺🇦 Українська' },
  { value: 'fi', label: '🇫🇮 Suomi' },
]

export default function Create({ theme, lang }) {
  const t = I18N[lang] || I18N.en
  const { me, getToken } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle]       = useState('')
  const [language, setLanguage] = useState(lang || 'en')
  const [isPublic, setIsPublic] = useState(false)
  const [mode, setMode]         = useState('comma')
  const [commaText, setCommaText] = useState('')
  const [rows, setRows]         = useState([
    { id: 1, word: '', hint: '' },
    { id: 2, word: '', hint: '' },
    { id: 3, word: '', hint: '' },
  ])
  const [nextId, setNextId]     = useState(4)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  const isDark  = theme === 'dark'
  const surface = isDark ? '#131929' : '#ffffff'
  const border  = isDark ? '#1e2d47' : '#d8deec'
  const text    = isDark ? '#e4ecf7' : '#0f1828'
  const muted   = isDark ? '#6b7fa3' : '#7a8aaa'
  const inputBg = isDark ? '#0e1220' : '#ffffff'
  const surface2= isDark ? '#1a2238' : '#eef1f8'

  // Редирект если не учитель/админ
  useEffect(() => {
    if (!me || (me.role !== 'teacher' && me.role !== 'admin')) {
      navigate('/wordsearch')
    }
  }, [me])

  const commaWords = commaText
    .split(',')
    .map(w => w.trim().toUpperCase())
    .filter(Boolean)

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: inputBg, border: `1px solid ${border}`,
    borderRadius: '10px', color: text,
    fontSize: '.95rem', outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'border-color .2s',
  }
  const focusOn  = e => e.target.style.borderColor = '#4f8ef7'
  const focusOff = e => e.target.style.borderColor = border

  const addRow = () => {
    setRows(r => [...r, { id: nextId, word: '', hint: '' }])
    setNextId(n => n + 1)
  }

  const removeRow = (id) => {
    setRows(r => r.filter(row => row.id !== id))
  }

  const updateRow = (id, field, value) => {
    setRows(r => r.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!title.trim()) { setError(t.errTitle); return }
    const token = getToken()
    if (!token) { setError(t.errAuth); return }

    let words = []
    if (mode === 'comma') {
      words = commaWords.map(w => ({ word: w, hint: '' }))
    } else {
      words = rows
        .filter(r => r.word.trim())
        .map(r => ({ word: r.word.trim(), hint: r.hint.trim() }))
    }

    if (words.length < 2) { setError(t.errWords); return }

    setLoading(true)
    try {
      const res = await axios.post('/api/wordsearch/create/', {
        title: title.trim(), language, is_public: isPublic, words,
      }, { headers: { Authorization: `Bearer ${token}` } })

      setSuccess(t.ok)
      setTimeout(() => navigate(`/wordsearch/${res.data.id}`), 1100)
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Network error')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '660px', margin: '0 auto', padding: '44px 20px 60px' }}>

      <h1 className="font-extrabold mb-7"
        style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.9rem', letterSpacing: '-1px', color: text }}>
        {t.hd}
      </h1>

      <div className="rounded-2xl p-8 border"
        style={{ background: surface, borderColor: border, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,.4)' : '0 4px 24px rgba(0,0,0,.08)' }}>

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm border"
            style={{ background: 'rgba(248,113,113,.1)', borderColor: 'rgba(248,113,113,.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm border"
            style={{ background: 'rgba(56,217,169,.1)', borderColor: 'rgba(56,217,169,.3)', color: '#38d9a9' }}>
            {success}
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: muted }}>
            {t.title}
          </label>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            style={inputStyle} onFocus={focusOn} onBlur={focusOff}
          />
        </div>

        {/* Lang + Visibility */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>

          {/* Language */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: muted }}>
              {t.lang}
            </label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              style={{ ...inputStyle }}
              onFocus={focusOn} onBlur={focusOff}>
              {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          {/* Visibility toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: muted }}>
              {t.vis}
            </label>
            <div className="flex items-center gap-3 mt-1">
              {/* Toggle */}
              <div
                onClick={() => setIsPublic(p => !p)}
                style={{
                  position: 'relative', width: '42px', height: '23px',
                  borderRadius: '12px', cursor: 'pointer', flexShrink: 0,
                  background: isPublic ? '#4f8ef7' : surface2,
                  border: `1px solid ${isPublic ? '#4f8ef7' : border}`,
                  transition: 'background .2s, border-color .2s',
                }}>
                <div style={{
                  position: 'absolute', top: '2px', left: '2px',
                  width: '17px', height: '17px', borderRadius: '50%',
                  background: '#fff',
                  transform: isPublic ? 'translateX(19px)' : 'none',
                  transition: 'transform .2s',
                }} />
              </div>
              <span className="text-sm" style={{ color: text }}>
                {isPublic ? t.pub : t.priv}
              </span>
            </div>
          </div>
        </div>

        {/* Words */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: muted }}>
            {t.words}
          </label>

          {/* Mode switcher */}
          <div className="flex gap-2 mb-3">
            {[
              { key: 'comma',  label: t.modeComma },
              { key: 'manual', label: t.modeManual },
            ].map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                style={{
                  background:  mode === m.key ? surface2 : 'transparent',
                  borderColor: mode === m.key ? '#4f8ef7' : border,
                  color:       mode === m.key ? text : muted,
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Comma mode */}
          {mode === 'comma' && (
            <div>
              <textarea
                value={commaText}
                onChange={e => setCommaText(e.target.value)}
                placeholder={t.commaHint}
                style={{
                  ...inputStyle, minHeight: '90px', resize: 'vertical',
                  lineHeight: '1.5',
                }}
                onFocus={focusOn} onBlur={focusOff}
              />
              <p className="text-xs mt-1" style={{ color: muted }}>{t.commaHint}</p>

              {/* Preview tags */}
              {commaWords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {commaWords.map((w, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                      style={{ background: surface2, borderColor: border, color: text }}>
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual mode */}
          {mode === 'manual' && (
            <div>
              {/* Column headers */}
              <div className="flex gap-2 mb-1.5 text-xs font-bold" style={{ color: muted }}>
                <span style={{ flex: 1 }}>{t.colWord}</span>
                <span style={{ flex: 1.3 }}>{t.colHint}</span>
                <span style={{ width: '32px' }} />
              </div>

              <div className="flex flex-col gap-2">
                {rows.map(row => (
                  <div key={row.id} className="flex gap-2">
                    <input
                      type="text" value={row.word}
                      onChange={e => updateRow(row.id, 'word', e.target.value)}
                      placeholder={t.colWord}
                      style={{ ...inputStyle, flex: 1, padding: '8px 12px' }}
                      onFocus={focusOn} onBlur={focusOff}
                    />
                    <input
                      type="text" value={row.hint}
                      onChange={e => updateRow(row.id, 'hint', e.target.value)}
                      placeholder={t.colHint}
                      style={{ ...inputStyle, flex: 1.3, padding: '8px 12px' }}
                      onFocus={focusOn} onBlur={focusOff}
                    />
                    <button onClick={() => removeRow(row.id)}
                      className="flex items-center justify-center rounded-lg border transition-all"
                      style={{
                        width: '34px', height: '34px', flexShrink: 0,
                        borderColor: border, background: 'transparent',
                        color: muted, fontSize: '1.1rem', cursor: 'pointer',
                        alignSelf: 'center',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = '#f87171'; e.target.style.color = '#f87171' }}
                      onMouseLeave={e => { e.target.style.borderColor = border; e.target.style.color = muted }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addRow}
                className="w-full py-2 mt-2 rounded-lg text-sm transition-all"
                style={{
                  border: `1px dashed ${border}`, background: 'transparent',
                  color: muted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f8ef7'; e.currentTarget.style.color = text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted }}>
                {t.addRow}
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-base transition-all"
          style={{
            background: '#4f8ef7', color: '#fff',
            opacity: loading ? 0.5 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif', border: 'none',
          }}>
          {loading ? t.submitting : t.submit}
        </button>
      </div>
    </div>
  )
}