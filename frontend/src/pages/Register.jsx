import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const I18N = {
  en: {
    title: 'Create account', sub: 'Already have one?', link: 'Log in',
    username: 'Username', role: 'Role', email: 'Email', lang: 'Interface Language',
    pass: 'Password', pass2: 'Confirm', btn: 'Sign up', loading: 'Creating…',
    stu: 'Student', tea: 'Teacher', hint: 'Admins are created via Django admin',
    err_net: 'Network error',
  },
  uk: {
    title: 'Створити акаунт', sub: 'Вже є акаунт?', link: 'Увійти',
    username: 'Нікнейм', role: 'Роль', email: 'Email', lang: 'Мова інтерфейсу',
    pass: 'Пароль', pass2: 'Підтвердити', btn: 'Зареєструватися', loading: 'Реєстрація…',
    stu: 'Учень', tea: 'Вчитель', hint: 'Адміни створюються через Django admin',
    err_net: 'Помилка мережі',
  },
  fi: {
    title: 'Luo tili', sub: 'Onko sinulla jo tili?', link: 'Kirjaudu',
    username: 'Käyttäjänimi', role: 'Rooli', email: 'Sähköposti', lang: 'Käyttöliittymän kieli',
    pass: 'Salasana', pass2: 'Vahvista', btn: 'Rekisteröidy', loading: 'Luodaan…',
    stu: 'Opiskelija', tea: 'Opettaja', hint: 'Ylläpitäjät luodaan Django adminissa',
    err_net: 'Verkkovirhe',
  },
}

const LANG_OPTIONS = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'uk', label: '🇺🇦 Українська' },
  { value: 'fi', label: '🇫🇮 Suomi' },
]

export default function Register({ theme, lang }) {
  const t = I18N[lang] || I18N.en
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
    role: 'student', preferred_language: lang || 'en',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const isDark  = theme === 'dark'
  const surface = isDark ? '#131929' : '#ffffff'
  const border  = isDark ? '#1e2d47' : '#d8deec'
  const text    = isDark ? '#e4ecf7' : '#0f1828'
  const muted   = isDark ? '#6b7fa3' : '#7a8aaa'
  const inputBg = isDark ? '#0e1220' : '#ffffff'

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.username || !form.email || !form.password) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/users/register/', form)
      login(res.data.tokens, res.data.user)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : t.err_net)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: inputBg, borderColor: border,
    color: text, fontFamily: 'DM Sans, sans-serif',
  }
  const focusOn  = (e) => e.target.style.borderColor = '#4f8ef7'
  const focusOff = (e) => e.target.style.borderColor = border

  const Field = ({ label, children }) => (
    <div className="mb-4">
      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: muted }}>
        {label}
      </label>
      {children}
    </div>
  )

  const Input = ({ type = 'text', value, onChange, autoComplete }) => (
    <input
      type={type} value={value} onChange={onChange} autoComplete={autoComplete}
      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
      style={inputStyle}
      onFocus={focusOn} onBlur={focusOff}
    />
  )

  const Select = ({ value, onChange, children }) => (
    <select
      value={value} onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
      style={inputStyle}
      onFocus={focusOn} onBlur={focusOff}>
      {children}
    </select>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg rounded-2xl p-11 border"
        style={{ background: surface, borderColor: border, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,.4)' : '0 4px 24px rgba(0,0,0,.08)' }}>

        <h1 className="text-3xl font-extrabold tracking-tight mb-1"
          style={{ fontFamily: 'Syne, sans-serif', color: text }}>
          {t.title}
        </h1>
        <p className="text-sm mb-8" style={{ color: muted }}>
          {t.sub}{' '}
          <Link to="/login/" style={{ color: '#4f8ef7' }} className="hover:underline">{t.link}</Link>
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm border"
            style={{ background: 'rgba(248,113,113,.1)', borderColor: 'rgba(248,113,113,.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username + Role */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.username}>
              <Input value={form.username} onChange={set('username')} autoComplete="username" />
            </Field>
            <Field label={t.role}>
              <Select value={form.role} onChange={set('role')}>
                <option value="student">{t.stu}</option>
                <option value="teacher">{t.tea}</option>
              </Select>
              <p className="text-xs mt-1" style={{ color: muted }}>{t.hint}</p>
            </Field>
          </div>

          <Field label={t.email}>
            <Input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </Field>

          <Field label={t.lang}>
            <Select value={form.preferred_language} onChange={set('preferred_language')}>
              {LANG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Field>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.pass}>
              <Input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
            </Field>
            <Field label={t.pass2}>
              <Input type="password" value={form.password2} onChange={set('password2')} autoComplete="new-password" />
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-base transition-all mt-2"
            style={{
              background: '#4f8ef7', color: '#fff',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}>
            {loading ? t.loading : t.btn}
          </button>
        </form>
      </div>
    </div>
  )
}