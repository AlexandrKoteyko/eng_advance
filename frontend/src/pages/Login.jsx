import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const I18N = {
  en: { title: 'Welcome back', sub: 'No account?', link: 'Sign up', email: 'Email', pass: 'Password', btn: 'Log in', loading: 'Logging in…', err_net: 'Network error' },
  uk: { title: 'З поверненням', sub: 'Немає акаунту?', link: 'Зареєструватися', email: 'Email', pass: 'Пароль', btn: 'Увійти', loading: 'Вхід…', err_net: 'Помилка мережі' },
  fi: { title: 'Tervetuloa takaisin', sub: 'Ei tiliä?', link: 'Rekisteröidy', email: 'Sähköposti', pass: 'Salasana', btn: 'Kirjaudu', loading: 'Kirjaudutaan…', err_net: 'Verkkovirhe' },
}

export default function Login({ theme, lang }) {
  const t = I18N[lang] || I18N.en
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const isDark = theme === 'dark'
  const surface  = isDark ? '#131929' : '#ffffff'
  const border   = isDark ? '#1e2d47' : '#d8deec'
  const text     = isDark ? '#e4ecf7' : '#0f1828'
  const muted    = isDark ? '#6b7fa3' : '#7a8aaa'
  const inputBg  = isDark ? '#0e1220' : '#ffffff'

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/users/login/', { email, password })
      login(res.data.tokens, res.data.user)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : t.err_net)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl p-11 border"
        style={{ background: surface, borderColor: border, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,.4)' : '0 4px 24px rgba(0,0,0,.08)' }}>

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-1"
          style={{ fontFamily: 'Syne, sans-serif', color: text }}>
          {t.title}
        </h1>
        <p className="text-sm mb-8" style={{ color: muted }}>
          {t.sub}{' '}
          <Link to="/register/" style={{ color: '#4f8ef7' }} className="hover:underline">{t.link}</Link>
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm border"
            style={{ background: 'rgba(248,113,113,.1)', borderColor: 'rgba(248,113,113,.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: muted }}>
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ background: inputBg, borderColor: border, color: text, fontFamily: 'DM Sans, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#4f8ef7'}
              onBlur={e => e.target.style.borderColor = border}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: muted }}>
              {t.pass}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ background: inputBg, borderColor: border, color: text, fontFamily: 'DM Sans, sans-serif' }}
              onFocus={e => e.target.style.borderColor = '#4f8ef7'}
              onBlur={e => e.target.style.borderColor = border}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-base transition-all"
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