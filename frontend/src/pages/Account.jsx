import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const I18N = {
  en: {
    tabInfo: 'Profile', tabPuzzles: 'My Puzzles', tabPass: 'Change Password',
    lUser: 'Username', lEmail: 'Email', lLang: 'Interface Language', lJoined: 'Joined',
    lOld: 'Current Password', lNew: 'New Password', lNew2: 'Confirm New Password',
    btnSave: 'Save Password', saving: 'Saving…', createLbl: 'Create Puzzle',
    empty: 'No puzzles yet', words: 'words', public: 'Public', private: 'Private',
    play: 'Play', del: 'Delete', passOk: 'Password changed!', delConfirm: 'Delete this puzzle?',
    roles: { admin: 'Admin', teacher: 'Teacher', student: 'Student' },
    langs: { en: 'English', uk: 'Ukrainian', fi: 'Finnish' },
    err_net: 'Network error',
  },
  uk: {
    tabInfo: 'Профіль', tabPuzzles: 'Мої завдання', tabPass: 'Змінити пароль',
    lUser: 'Нікнейм', lEmail: 'Email', lLang: 'Мова інтерфейсу', lJoined: 'Зареєстровано',
    lOld: 'Поточний пароль', lNew: 'Новий пароль', lNew2: 'Підтвердити пароль',
    btnSave: 'Зберегти пароль', saving: 'Зберігаю…', createLbl: 'Створити завдання',
    empty: 'Завдань ще немає', words: 'слів', public: 'Публічне', private: 'Приватне',
    play: 'Грати', del: 'Видалити', passOk: 'Пароль змінено!', delConfirm: 'Видалити це завдання?',
    roles: { admin: 'Адмін', teacher: 'Вчитель', student: 'Учень' },
    langs: { en: 'Англійська', uk: 'Українська', fi: 'Фінська' },
    err_net: 'Помилка мережі',
  },
  fi: {
    tabInfo: 'Profiili', tabPuzzles: 'Omat tehtävät', tabPass: 'Vaihda salasana',
    lUser: 'Käyttäjänimi', lEmail: 'Sähköposti', lLang: 'Käyttöliittymän kieli', lJoined: 'Liittynyt',
    lOld: 'Nykyinen salasana', lNew: 'Uusi salasana', lNew2: 'Vahvista uusi salasana',
    btnSave: 'Tallenna salasana', saving: 'Tallennetaan…', createLbl: 'Luo tehtävä',
    empty: 'Ei tehtäviä vielä', words: 'sanaa', public: 'Julkinen', private: 'Yksityinen',
    play: 'Pelaa', del: 'Poista', passOk: 'Salasana vaihdettu!', delConfirm: 'Poista tämä tehtävä?',
    roles: { admin: 'Ylläpitäjä', teacher: 'Opettaja', student: 'Opiskelija' },
    langs: { en: 'Englanti', uk: 'Ukraina', fi: 'Suomi' },
    err_net: 'Verkkovirhe',
  },
}

export default function Account({ theme, lang }) {
  const t = I18N[lang] || I18N.en
  const { me, getToken, logout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]         = useState('info')
  const [puzzles, setPuzzles] = useState([])
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', new_password2: '' })
  const [passMsg, setPassMsg]   = useState(null) // { type: 'ok'|'err', text }
  const [passBusy, setPassBusy] = useState(false)

  const isDark  = theme === 'dark'
  const surface = isDark ? '#131929' : '#ffffff'
  const surface2= isDark ? '#1a2238' : '#eef1f8'
  const border  = isDark ? '#1e2d47' : '#d8deec'
  const text    = isDark ? '#e4ecf7' : '#0f1828'
  const muted   = isDark ? '#6b7fa3' : '#7a8aaa'
  const inputBg = isDark ? '#0e1220' : '#ffffff'

  useEffect(() => { if (!me) navigate('/login/') }, [me])

  // ── load puzzles ──
  useEffect(() => {
    if (tab !== 'puzzles') return
    const token = getToken()
    axios.get('/api/wordsearch/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const all = Array.isArray(res.data) ? res.data : res.data.results || []
        setPuzzles(all.filter(p => p.author === me?.username))
      })
      .catch(() => {})
  }, [tab])

  // ── toggle visibility ──
  const toggleVis = async (id, isPub) => {
    try {
      const res = await axios.patch(`/api/wordsearch/${id}/manage/`,
        { is_public: !isPub },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
      if (res.status === 200) {
        setPuzzles(ps => ps.map(p => p.id === id ? { ...p, is_public: !isPub } : p))
      }
    } catch {}
  }

  // ── delete puzzle ──
  const delPuzzle = async (id) => {
    if (!confirm(t.delConfirm)) return
    try {
      await axios.delete(`/api/wordsearch/${id}/manage/`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
      setPuzzles(ps => ps.filter(p => p.id !== id))
    } catch {}
  }

  // ── change password ──
  const changePass = async (e) => {
    e?.preventDefault()
    if (!passForm.old_password || !passForm.new_password || !passForm.new_password2) return
    setPassBusy(true)
    setPassMsg(null)
    try {
      await axios.post('/api/users/change-password/', passForm,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
      setPassMsg({ type: 'ok', text: t.passOk })
      setPassForm({ old_password: '', new_password: '', new_password2: '' })
    } catch (err) {
      const data = err.response?.data
      setPassMsg({ type: 'err', text: data ? Object.values(data).flat().join(' ') : t.err_net })
    } finally {
      setPassBusy(false)
    }
  }

  if (!me) return null

  const roleBadgeColor = {
    admin:   { bg: 'rgba(247,147,79,.15)',  color: '#f7934f' },
    teacher: { bg: 'rgba(79,142,247,.15)',  color: '#4f8ef7' },
    student: { bg: 'rgba(56,217,169,.15)',  color: '#38d9a9' },
  }[me.role] || {}

  const inputStyle = {
    background: inputBg, borderColor: border,
    color: text, fontFamily: 'DM Sans, sans-serif',
  }
  const focusOn  = e => e.target.style.borderColor = '#4f8ef7'
  const focusOff = e => e.target.style.borderColor = border

  const TABS = [
    { key: 'info',    label: t.tabInfo },
    ...(me.role === 'teacher' || me.role === 'admin' ? [{ key: 'puzzles', label: t.tabPuzzles }] : []),
    { key: 'pass',    label: t.tabPass },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* ── Header ── */}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4f8ef7, #38d9a9)', fontFamily: 'Syne, sans-serif' }}>
          {(me.username || '?')[0].toUpperCase()}
        </div>
        <div>
          <div className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: text }}>
            {me.username}
          </div>
          <div className="text-sm mt-0.5" style={{ color: muted }}>{me.email}</div>
          <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: roleBadgeColor.bg, color: roleBadgeColor.color }}>
            {t.roles[me.role] || me.role}
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-0.5 border-b mb-8" style={{ borderColor: border }}>
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className="px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all"
            style={{
              borderBottomColor: tab === tb.key ? '#4f8ef7' : 'transparent',
              color: tab === tb.key ? '#4f8ef7' : muted,
              background: 'transparent',
              fontFamily: 'DM Sans, sans-serif',
            }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── Tab: INFO ── */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: t.lUser,   value: me.username },
            { label: t.lEmail,  value: me.email },
            { label: t.lLang,   value: t.langs[me.preferred_language] || me.preferred_language },
            { label: t.lJoined, value: me.date_joined ? new Date(me.date_joined).toLocaleDateString() : '—' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-5 border" style={{ background: surface2, borderColor: border }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: muted }}>{item.label}</div>
              <div className="font-medium" style={{ color: text }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: PUZZLES ── */}
      {tab === 'puzzles' && (
        <div>
          <a href="/wordsearch/create/"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm mb-6 transition-all hover:opacity-85"
            style={{ background: '#4f8ef7', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
            + {t.createLbl}
          </a>

          {puzzles.length === 0 ? (
            <div className="text-center py-16" style={{ color: muted }}>
              <div className="text-4xl mb-3">🔍</div>
              <div>{t.empty}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {puzzles.map(p => (
                <div key={p.id} className="rounded-xl p-5 border transition-all hover:-translate-y-0.5"
                  style={{ background: surface, borderColor: border }}>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: p.language === 'en' ? 'rgba(79,142,247,.15)' : p.language === 'uk' ? 'rgba(247,201,79,.15)' : 'rgba(56,217,169,.15)',
                      color:      p.language === 'en' ? '#4f8ef7' : p.language === 'uk' ? '#f7c94f' : '#38d9a9',
                    }}>
                    {p.language_display || p.language}
                  </span>
                  <div className="font-bold mt-2 mb-1" style={{ fontFamily: 'Syne, sans-serif', color: text }}>{p.title}</div>
                  <div className="text-xs mb-4" style={{ color: muted }}>{p.word_count} {t.words}</div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <a href={`/wordsearch/${p.id}/`}
                      className="px-3 py-1 rounded-lg text-xs font-bold border transition-all hover:border-blue-400"
                      style={{ borderColor: border, color: text }}>
                      {t.play}
                    </a>
                    <button onClick={() => toggleVis(p.id, p.is_public)}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{
                        background: p.is_public ? 'rgba(56,217,169,.15)' : 'rgba(107,127,163,.15)',
                        color:      p.is_public ? '#38d9a9' : muted,
                      }}>
                      {p.is_public ? t.public : t.private}
                    </button>
                    <button onClick={() => delPuzzle(p.id)}
                      className="px-3 py-1 rounded-lg text-xs font-bold border transition-all hover:border-red-400 hover:text-red-400"
                      style={{ borderColor: border, color: muted }}>
                      {t.del}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: PASSWORD ── */}
      {tab === 'pass' && (
        <form onSubmit={changePass} className="max-w-sm">
          {passMsg && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm border"
              style={passMsg.type === 'ok'
                ? { background: 'rgba(56,217,169,.1)', borderColor: 'rgba(56,217,169,.3)', color: '#38d9a9' }
                : { background: 'rgba(248,113,113,.1)', borderColor: 'rgba(248,113,113,.3)', color: '#fca5a5' }}>
              {passMsg.text}
            </div>
          )}

          {[
            { label: t.lOld,  key: 'old_password' },
            { label: t.lNew,  key: 'new_password' },
            { label: t.lNew2, key: 'new_password2' },
          ].map(f => (
            <div key={f.key} className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: muted }}>
                {f.label}
              </label>
              <input
                type="password"
                value={passForm[f.key]}
                onChange={e => setPassForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={focusOn} onBlur={focusOff}
              />
            </div>
          ))}

          <button type="submit" disabled={passBusy}
            className="px-7 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: '#4f8ef7', color: '#fff',
              opacity: passBusy ? 0.5 : 1,
              cursor: passBusy ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}>
            {passBusy ? t.saving : t.btnSave}
          </button>
        </form>
      )}
    </div>
  )
}