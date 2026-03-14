import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import WordSearch from './pages/WordSearch'
import Play from './pages/Play'
import Create from './pages/Create'


export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [lang, setLang] = useState(() => localStorage.getItem('uiLang') || 'en')

  const handleTheme = (t) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  const handleLang = (l) => {
    setLang(l)
    localStorage.setItem('uiLang', l)
  }

  const props = { theme, lang }

  return (
    <BrowserRouter>
      <div style={{ background: theme === 'dark' ? '#080b12' : '#f4f6fb', minHeight: '100vh' }}>
        <Navbar theme={theme} setTheme={handleTheme} lang={lang} setLang={handleLang} />
        <div style={{ paddingTop: '64px' }}>
          <Routes>
            <Route path="/"         element={<Home {...props} />} />
            <Route path="/login/"   element={<Login {...props} />} />
            <Route path="/register/" element={<Register {...props} />} />
            <Route path="/account/" element={<Account {...props} />} />
            <Route path="/wordsearch" element={<WordSearch {...props} />} />
            <Route path="/wordsearch/:id" element={<Play {...props} />} />
            <Route path="/wordsearch/create" element={<Create {...props} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}