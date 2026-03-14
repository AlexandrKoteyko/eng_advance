import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LANGS = [
  { label: 'UA', value: 'uk' },
  { label: 'EN', value: 'en' },
  { label: 'FI', value: 'fi' },
]

const NAV_I18N = {
  en: { home: 'Home', wordsearch: 'Word Search', account: 'Account', logout: 'Log out', login: 'Log in', register: 'Sign up' },
  uk: { home: 'Головна', wordsearch: 'Філворди', account: 'Акаунт', logout: 'Вийти', login: 'Увійти', register: 'Реєстрація' },
  fi: { home: 'Etusivu', wordsearch: 'Täytäpelat', account: 'Tili', logout: 'Kirjaudu ulos', login: 'Kirjaudu', register: 'Rekisteröidy' },
}

export default function Navbar({ lang, setLang, theme, setTheme }) {
  const { me, logout } = useAuth()
  const navigate = useNavigate()

  const isDark = theme === 'dark'
  const t = NAV_I18N[lang] || NAV_I18N.en

  const border  = isDark ? '#1e2d47' : '#d8deec'
  const text    = isDark ? '#e4ecf7' : '#0f1828'
  const muted   = isDark ? '#6b7fa3' : '#7a8aaa'
  const surface2= isDark ? '#1a2238' : '#eef1f8'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b flex items-center px-7 gap-0"
      style={{
        background: isDark ? 'rgba(8,11,18,.85)' : 'rgba(244,246,251,.9)',
        borderColor: border,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="font-bold text-xl mr-9 tracking-tight"
        style={{ fontFamily: 'Syne, sans-serif', color: text }}
      >
        Lang<span style={{ color: '#4f8ef7' }}>Learn</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1 flex-1">
        <NavLink to="/"           label={t.home}       theme={theme} />
        <NavLink to="/wordsearch" label={t.wordsearch} theme={theme} />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Lang switcher */}
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button
              key={l.value}
              onClick={() => setLang(l.value)}
              className="px-2 py-1 rounded-md text-xs font-bold border transition-all"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                background:   lang === l.value ? surface2    : 'transparent',
                borderColor:  lang === l.value ? '#4f8ef7'   : border,
                color:        lang === l.value ? text        : muted,
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="w-9 h-9 rounded-lg border flex items-center justify-center text-base transition-all"
          style={{ background: surface2, borderColor: border }}
        >
          {isDark ? '🌙' : '☀️'}
        </button>

        {/* Auth */}
        {me ? (
          <div className="flex items-center gap-2">
            <Link to="/account/">
              <GhostBtn theme={theme}>{t.account}</GhostBtn>
            </Link>
            <GhostBtn theme={theme} onClick={handleLogout}>{t.logout}</GhostBtn>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login/">
              <GhostBtn theme={theme}>{t.login}</GhostBtn>
            </Link>
            <Link to="/register/">
              <PrimaryBtn>{t.register}</PrimaryBtn>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, label, theme }) {
  const isDark  = theme === 'dark'
  const muted   = isDark ? '#6b7fa3' : '#7a8aaa'
  const active  = window.location.pathname === to

  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
      style={{
        color:      active ? '#4f8ef7' : muted,
        background: active ? 'rgba(79,142,247,.1)' : 'transparent',
      }}
    >
      {label}
    </Link>
  )
}

function GhostBtn({ children, onClick, theme }) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all"
      style={{
        background:  'transparent',
        borderColor: isDark ? '#1e2d47' : '#d8deec',
        color:       isDark ? '#e4ecf7' : '#0f1828',
        fontFamily:  'DM Sans, sans-serif',
      }}
    >
      {children}
    </button>
  )
}

function PrimaryBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-85"
      style={{ background: '#4f8ef7', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
    >
      {children}
    </button>
  )
}