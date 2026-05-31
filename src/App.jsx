import { useState, useEffect } from 'react'
import './App.css'

const ACCOUNTS = [
  { id: 'aviator',              name: 'aviator',               email: 'aviatorvelasaltas@gmail.com' },
  { id: 'garp',                 name: 'garp',                  email: 'garpbloxparcerias@gmail.com' },
  { id: 'fzn',                  name: 'FZN',                   email: 'kaliandriksouza@gmail.com' },
  { id: 'kaliankali',           name: 'kaliankali',            email: 'kaliankali001@gmail.com' },
  { id: 'kaliandrik',           name: 'kaliandrik',            email: 'contatokaliandrik@gmail.com' },
  { id: 'kaliandrik_a',         name: 'Kaliandrik A',          email: 'tralhadrey@gmail.com' },
  { id: 'kaliandrik_0',         name: 'Kaliandrik 0',          email: 'kaliandrik15@gmail.com' },
  { id: 'negociosinvestimentos', name: 'negociosinvestimentos', email: 'negociosivestimentos@gmail.com' },
  { id: 'wastech',              name: 'wastech',               email: 'wasttech22@gmail.com' },
]

const MAX_POINTS = 60
const STORAGE_KEY = 'pixverse_accounts'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function getAccountState(stored, id) {
  const s = stored[id]
  if (!s) return { points: MAX_POINTS, lastUsed: null }
  const now = Date.now()
  if (s.lastUsed && now - s.lastUsed >= 24 * 60 * 60 * 1000) {
    return { points: MAX_POINTS, lastUsed: null }
  }
  return s
}

function timeUntilReset(lastUsed) {
  if (!lastUsed) return null
  const diff = lastUsed + 24 * 60 * 60 * 1000 - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function PointsBar({ points }) {
  const pct = (points / MAX_POINTS) * 100
  const color = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div className="bar-wrap">
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="bar-label" style={{ color }}>{points}/{MAX_POINTS}</span>
    </div>
  )
}

function AccountCard({ account, state, onUse }) {
  const [input, setInput] = useState('')
  const [timer, setTimer] = useState(() => timeUntilReset(state.lastUsed))
  const pct = (state.points / MAX_POINTS) * 100
  const statusColor = pct > 50 ? 'green' : pct > 20 ? 'yellow' : 'red'

  useEffect(() => {
    if (!state.lastUsed) { setTimer(null); return }
    const id = setInterval(() => {
      const t = timeUntilReset(state.lastUsed)
      setTimer(t)
      if (!t) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [state.lastUsed])

  function handleUse() {
    const v = parseInt(input, 10)
    if (!v || v <= 0 || v > state.points) return
    onUse(account.id, v)
    setInput('')
  }

  return (
    <div className={`card status-${statusColor}`}>
      <div className="card-header">
        <div>
          <p className="card-name">{account.name}</p>
          <p className="card-email">{account.email}</p>
        </div>
        <div className={`badge badge-${statusColor}`}>
          {state.points === MAX_POINTS && !state.lastUsed ? 'FULL' : state.points === 0 ? 'VAZIO' : 'ATIVO'}
        </div>
      </div>

      <PointsBar points={state.points} />

      {timer && (
        <div className="reset-row">
          <span className="reset-label">reset em</span>
          <span className="reset-timer">{timer}</span>
        </div>
      )}

      <div className="use-row">
        <input
          type="number"
          min="1"
          max={state.points}
          placeholder="pts usados"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleUse()}
          disabled={state.points === 0}
        />
        <button onClick={handleUse} disabled={!input || state.points === 0}>
          usar
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [stored, setStored] = useState(loadState)

  useEffect(() => {
    const id = setInterval(() => setStored(s => ({ ...s })), 10000)
    return () => clearInterval(id)
  }, [])

  function handleUse(id, amount) {
    setStored(prev => {
      const cur = getAccountState(prev, id)
      const next = {
        ...prev,
        [id]: {
          points: Math.max(0, cur.points - amount),
          lastUsed: cur.lastUsed ?? Date.now(),
        }
      }
      saveState(next)
      return next
    })
  }

  const states = ACCOUNTS.map(a => getAccountState(stored, a.id))
  const totalAvail = states.reduce((s, a) => s + a.points, 0)
  const totalMax = ACCOUNTS.length * MAX_POINTS

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">
          <span className="logo">PX</span>
          <div>
            <h1>PIXVERSE</h1>
            <p>gerenciador de contas</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-val">{totalAvail}</span>
            <span className="stat-key">pts disponíveis</span>
          </div>
          <div className="stat">
            <span className="stat-val">{ACCOUNTS.length}</span>
            <span className="stat-key">contas</span>
          </div>
          <div className="stat">
            <span className="stat-val">{Math.round((totalAvail/totalMax)*100)}%</span>
            <span className="stat-key">capacidade</span>
          </div>
        </div>
      </header>

      <main className="grid">
        {ACCOUNTS.map((acc, i) => (
          <AccountCard
            key={acc.id}
            account={acc}
            state={states[i]}
            onUse={handleUse}
          />
        ))}
      </main>
    </div>
  )
}