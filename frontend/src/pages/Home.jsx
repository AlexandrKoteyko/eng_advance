import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const I18N = {
  en: {
    eyebrow: 'Language Learning Platform',
    title: ['Learn languages through', 'games'],
    sub: 'Solve word search puzzles in English, Ukrainian and Finnish. Built for students and teachers.',
    play: 'Start Playing', reg: 'Create Account',
    feat_label: 'Features', feat_title: 'Everything you need to learn',
    cta_title: 'Ready to start?', cta_sub: 'Join students already learning new languages', cta_btn: "Sign up — it's free",
    features: [
      { icon: '🔍', title: 'Word Search', desc: 'Find hidden words in the grid. Simple, addictive, effective for vocabulary.' },
      { icon: '🌍', title: '3 Languages', desc: 'English, Ukrainian and Finnish. Switch the interface language anytime.' },
      { icon: '👩‍🏫', title: 'For Teachers', desc: 'Create custom puzzles with your word lists and publish for students.' },
      { icon: '📊', title: 'Track Progress', desc: 'Mark puzzles as done and filter what you still need to complete.' },
    ],
  },
  uk: {
    eyebrow: 'Платформа вивчення мов',
    title: ['Вивчай мови через', 'ігри'],
    sub: "Розв'язуй філворди англійською, українською та фінською. Для учнів та вчителів.",
    play: 'Почати грати', reg: 'Створити акаунт',
    feat_label: 'Можливості', feat_title: 'Все що потрібно для навчання',
    cta_title: 'Готовий почати?', cta_sub: 'Сотні учнів вже вивчають нові мови', cta_btn: 'Зареєструватись — безплатно',
    features: [
      { icon: '🔍', title: 'Філворди', desc: 'Знаходь приховані слова у сітці. Просто, захоплююче, ефективно.' },
      { icon: '🌍', title: '3 мови', desc: 'Англійська, українська та фінська — перемикай мову будь-коли.' },
      { icon: '👩‍🏫', title: 'Для вчителів', desc: 'Створюй власні завдання зі своїми словами та публікуй для учнів.' },
      { icon: '📊', title: 'Прогрес', desc: 'Відмічай виконані завдання та фільтруй нові.' },
    ],
  },
  fi: {
    eyebrow: 'Kielenoppimisalusta',
    title: ['Opi kieliä', 'pelien kautta'],
    sub: 'Ratkaise täytäpelat englanniksi, ukrainaksi ja suomeksi. Opiskelijoille ja opettajille.',
    play: 'Aloita pelaaminen', reg: 'Luo tili',
    feat_label: 'Ominaisuudet', feat_title: 'Kaikki mitä tarvitset',
    cta_title: 'Valmis aloittamaan?', cta_sub: 'Satoja opiskelijoita oppii jo uusia kieliä', cta_btn: 'Rekisteröidy — ilmaiseksi',
    features: [
      { icon: '🔍', title: 'Täytäpelat', desc: 'Löydä piilotetut sanat ruudukosta. Yksinkertaista, koukuttavaa ja tehokasta.' },
      { icon: '🌍', title: '3 kieltä', desc: 'Englanti, ukraina ja suomi — vaihda kieli milloin tahansa.' },
      { icon: '👩‍🏫', title: 'Opettajille', desc: 'Luo mukautettuja tehtäviä ja jaa opiskelijoille.' },
      { icon: '📊', title: 'Seuraa edistymistä', desc: 'Merkitse valmiit tehtävät ja suodata uudet.' },
    ],
  },
}

export default function Home({ theme, lang }) {
  const t = I18N[lang] || I18N.en
  const { me } = useAuth()

  const isDark  = theme === 'dark'
  const text    = isDark ? '#e4ecf7' : '#0f1828'
  const text2   = isDark ? '#b0bfd8' : '#3a4a6b'
  const muted   = isDark ? '#6b7fa3' : '#7a8aaa'
  const surface = isDark ? '#131929' : '#ffffff'
  const border  = isDark ? '#1e2d47' : '#d8deec'

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 py-16">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: isDark
            ? 'radial-gradient(ellipse 70% 60% at 65% 40%, rgba(79,142,247,.09) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 15% 70%, rgba(56,217,169,.07) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 70% 60% at 65% 40%, rgba(47,111,224,.07) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 15% 70%, rgba(26,170,130,.05) 0%, transparent 60%)',
        }} />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(79,142,247,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
            style={{ background: 'rgba(79,142,247,.1)', borderColor: 'rgba(79,142,247,.2)', color: '#4f8ef7' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {t.eyebrow}
          </div>

          {/* Title */}
          <h1 className="font-extrabold leading-tight mb-5"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)', letterSpacing: '-2px', color: text }}>
            {t.title[0]}{' '}
            <em className="not-italic" style={{ color: '#4f8ef7' }}>{t.title[1]}</em>
          </h1>

          <p className="text-base mb-9 leading-relaxed" style={{ color: muted, maxWidth: '460px' }}>
            {t.sub}
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link to="/wordsearch/"
              className="px-7 py-3 rounded-xl font-bold text-base transition-all hover:opacity-85"
              style={{ background: '#4f8ef7', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
              {t.play}
            </Link>
            {!me && (
              <Link to="/register/"
                className="px-7 py-3 rounded-xl font-bold text-base border transition-all"
                style={{ background: 'transparent', borderColor: border, color: text, fontFamily: 'DM Sans, sans-serif' }}>
                {t.reg}
              </Link>
            )}
          </div>
        </div>

        {/* Floating lang cards */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 hidden lg:flex">
          {[
            { flag: '🇬🇧', name: 'English',     code: 'EN', delay: '0s' },
            { flag: '🇺🇦', name: 'Українська',  code: 'UK', delay: '-1.7s' },
            { flag: '🇫🇮', name: 'Suomi',        code: 'FI', delay: '-3.4s' },
          ].map(c => (
            <div key={c.code}
              className="rounded-xl px-6 py-4 text-center border min-w-32"
              style={{
                background: surface, borderColor: border,
                boxShadow: isDark ? '0 4px 24px rgba(0,0,0,.4)' : '0 4px 24px rgba(0,0,0,.08)',
                animation: `floatY 5s ease-in-out infinite ${c.delay}`,
              }}>
              <div className="text-3xl mb-1">{c.flag}</div>
              <div className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: text }}>{c.name}</div>
              <div className="text-xs" style={{ color: muted }}>{c.code}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4f8ef7' }}>{t.feat_label}</p>
          <h2 className="font-extrabold mb-12"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', letterSpacing: '-1px', color: text }}>
            {t.feat_title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.features.map((f, i) => (
              <div key={i}
                className="rounded-xl p-7 border transition-all hover:-translate-y-1"
                style={{ background: surface, borderColor: border }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: 'rgba(79,142,247,.1)' }}>
                  {f.icon}
                </div>
                <div className="font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: text }}>{f.title}</div>
                <div className="text-sm leading-relaxed" style={{ color: muted }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center border-t" style={{ borderColor: border }}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-extrabold mb-3"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '-1px', color: text }}>
            {t.cta_title}
          </h2>
          <p className="mb-8 text-sm" style={{ color: muted }}>{t.cta_sub}</p>
          <Link
            to={me ? '/wordsearch/' : '/register/'}
            className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-85 inline-block"
            style={{ background: '#4f8ef7', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
            {me ? t.play : t.cta_btn}
          </Link>
        </div>
      </section>

      {/* Float animation */}
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}