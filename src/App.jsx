import { useState, useEffect } from 'react'
import './App.css'

// ─── POSTS PAGE ──────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'youtube',   label: 'YouTube',   color: '#FF4040', icon: '▶' },
  { id: 'tiktok',    label: 'TikTok',    color: '#69C9D0', icon: '♪' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', icon: 'f' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C', icon: '◉' },
]

const POSTS_KEY = 'pixverse_posts'

function loadPosts() {
  try { return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]') } catch { return [] }
}
function savePosts(posts) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

function PlatformBadge({ platform, checked, onChange }) {
  return (
    <button
      className={`platform-badge ${checked ? 'platform-badge--on' : ''}`}
      style={{ '--badge-color': platform.color }}
      onClick={() => onChange(!checked)}
      title={`Marcar como postado no ${platform.label}`}
    >
      <span className="platform-icon">{platform.icon}</span>
      <span className="platform-name">{platform.label}</span>
      {checked && <span className="platform-check">✓</span>}
    </button>
  )
}

function PostCard({ post, statusClass, allDone, noneDone, onDelete, onTogglePlatform, onSaveCaption }) {
  const [captionMode, setCaptionMode] = useState(null) // null | 'edit' | 'view'
  const [draftCaption, setDraftCaption] = useState(post.legenda || '')

  function handleOpenEdit() {
    setDraftCaption(post.legenda || '')
    setCaptionMode('edit')
  }

  function handleSave() {
    onSaveCaption(post.id, draftCaption)
    setCaptionMode(null)
  }

  function handleCancel() {
    setDraftCaption(post.legenda || '')
    setCaptionMode(null)
  }

  return (
    <div className={`post-card ${statusClass}`}>
      <div className="post-header">
        <span className="post-name">{post.name}</span>
        <div className="post-header-right">
          {allDone  && <span className="post-badge post-badge--done">completo</span>}
          {noneDone && <span className="post-badge post-badge--pending">pendente</span>}
          {!allDone && !noneDone && <span className="post-badge post-badge--partial">parcial</span>}
          <button className="post-delete" onClick={() => onDelete(post.id)} title="Deletar post">✕</button>
        </div>
      </div>

      <div className="post-platforms">
        {PLATFORMS.map(pl => (
          <PlatformBadge
            key={pl.id}
            platform={pl}
            checked={post[pl.id]}
            onChange={v => onTogglePlatform(post.id, pl.id, v)}
          />
        ))}
      </div>

      <div className="post-caption-row">
        <button className="caption-toggle-btn" onClick={handleOpenEdit}>
          ✏ legenda do post
          {post.legenda && <span className="caption-saved-dot" title="legenda salva" />}
        </button>
        {post.legenda && captionMode !== 'edit' && (
          <button
            className="caption-view-btn"
            onClick={() => setCaptionMode(captionMode === 'view' ? null : 'view')}
          >
            {captionMode === 'view' ? '▲ ocultar' : '▼ visualizar legenda'}
          </button>
        )}
      </div>

      {captionMode === 'edit' && (
        <div className="caption-editor">
          <textarea
            className="caption-textarea"
            value={draftCaption}
            onChange={e => setDraftCaption(e.target.value)}
            placeholder="escreva a legenda do post aqui..."
            autoFocus
            rows={6}
          />
          <div className="caption-actions">
            <button className="caption-save-btn" onClick={handleSave}>salvar</button>
            <button className="caption-cancel-btn" onClick={handleCancel}>cancelar</button>
          </div>
        </div>
      )}

      {captionMode === 'view' && post.legenda && (
        <div className="caption-viewer">
          <p className="caption-viewer-text">{post.legenda}</p>
        </div>
      )}
    </div>
  )
}

function PostsPage() {
  const [posts, setPosts] = useState(loadPosts)
  const [input, setInput] = useState('')

  function addPost() {
    const name = input.trim()
    if (!name) return
    const next = [
      ...posts,
      { id: Date.now(), name, youtube: false, tiktok: false, facebook: false, instagram: false }
    ]
    setPosts(next)
    savePosts(next)
    setInput('')
  }

  function deletePost(id) {
    const next = posts.filter(p => p.id !== id)
    setPosts(next)
    savePosts(next)
  }

  function togglePlatform(id, platform, value) {
    const next = posts.map(p => p.id === id ? { ...p, [platform]: value } : p)
    setPosts(next)
    savePosts(next)
  }

  function saveCaption(id, text) {
    const next = posts.map(p => p.id === id ? { ...p, legenda: text } : p)
    setPosts(next)
    savePosts(next)
  }

  const totalPosted  = posts.filter(p =>  p.youtube &&  p.tiktok &&  p.facebook &&  p.instagram).length
  const totalPartial = posts.filter(p => (p.youtube ||  p.tiktok ||  p.facebook ||  p.instagram) && !(p.youtube && p.tiktok && p.facebook && p.instagram)).length
  const totalPending = posts.filter(p => !p.youtube && !p.tiktok && !p.facebook && !p.instagram).length

  return (
    <div className="posts-page">
      <div className="posts-stats">
        <div className="stat">
          <span className="stat-val">{posts.length}</span>
          <span className="stat-key">posts</span>
        </div>
        <div className="stat">
          <span className="stat-val" style={{ color: 'var(--green)' }}>{totalPosted}</span>
          <span className="stat-key">completos</span>
        </div>
        <div className="stat">
          <span className="stat-val" style={{ color: 'var(--yellow)' }}>{totalPartial}</span>
          <span className="stat-key">parciais</span>
        </div>
        <div className="stat">
          <span className="stat-val" style={{ color: 'var(--red)' }}>{totalPending}</span>
          <span className="stat-key">pendentes</span>
        </div>
      </div>

      <div className="posts-add">
        <input
          type="text"
          placeholder="nome do post..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addPost()}
          className="posts-input"
        />
        <button onClick={addPost} className="posts-add-btn">+ adicionar</button>
      </div>

      {posts.length === 0 && (
        <div className="posts-empty">
          <p>nenhum post ainda.</p>
          <p>adicione um nome acima para começar.</p>
        </div>
      )}

      <div className="posts-list">
        {posts.map(post => {
          const allDone  = post.youtube && post.tiktok && post.facebook && post.instagram
          const noneDone = !post.youtube && !post.tiktok && !post.facebook && !post.instagram
          const statusClass = allDone ? 'post-done' : noneDone ? 'post-pending' : 'post-partial'

          return (
            <PostCard
              key={post.id}
              post={post}
              statusClass={statusClass}
              allDone={allDone}
              noneDone={noneDone}
              onDelete={deletePost}
              onTogglePlatform={togglePlatform}
              onSaveCaption={saveCaption}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── ACCOUNTS PAGE (original) ────────────────────────────────────────────────

const ACCOUNTS = [
  { id: 'aviator',               name: 'aviator',               email: 'aviatorvelasaltas@gmail.com' },
  { id: 'garp',                  name: 'garp',                  email: 'garpbloxparcerias@gmail.com' },
  { id: 'fzn',                   name: 'FZN',                   email: 'kaliandriksouza@gmail.com' },
  { id: 'kaliankali',            name: 'kaliankali',            email: 'kaliankali001@gmail.com' },
  { id: 'kaliandrik',            name: 'kaliandrik',            email: 'contatokaliandrik@gmail.com' },
  { id: 'kaliandrik_a',          name: 'Kaliandrik A',          email: 'tralhadrey@gmail.com' },
  { id: 'kaliandrik_0',          name: 'Kaliandrik 0',          email: 'kaliandrik15@gmail.com' },
  { id: 'negociosinvestimentos',  name: 'negociosinvestimentos', email: 'negociosivestimentos@gmail.com' },
  { id: 'wastech',               name: 'wastech',               email: 'wasttech22@gmail.com' },
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
      <div className="bar-meta">
        <span className="bar-label" style={{ color }}>{points} pts</span>
        <span className="bar-pct">{Math.round(pct)}%</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function AccountCard({ account, state, onUse, onReset }) {
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

  const isFull = state.points === MAX_POINTS && !state.lastUsed

  return (
    <div className={`card status-${statusColor}`}>
      <div className="card-header">
        <div>
          <p className="card-name">{account.name}</p>
          <p className="card-email">{account.email}</p>
        </div>
        <div className="card-header-right">
          <div className={`badge badge-${statusColor}`}>
            {isFull ? 'FULL' : state.points === 0 ? 'VAZIO' : 'ATIVO'}
          </div>
          {!isFull && (
            <button className="reset-btn" onClick={() => onReset(account.id)} title="Resetar pontos">
              ↺
            </button>
          )}
        </div>
      </div>

      <PointsBar points={state.points} />

      {timer && (
        <div className="reset-row">
          <span className="reset-icon">⟳</span>
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

function Reminders() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pixverse_reminders') || '[]') } catch { return [] }
  })
  const [input, setInput] = useState('')

  function save(next) {
    setItems(next)
    localStorage.setItem('pixverse_reminders', JSON.stringify(next))
  }

  function add() {
    const text = input.trim()
    if (!text) return
    save([...items, { id: Date.now(), text, pinned: false }])
    setInput('')
  }

  function remove(id) { save(items.filter(i => i.id !== id)) }

  function togglePin(id) {
    save(items.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i))
  }

  const pinned = items.filter(i => i.pinned)
  const normal = items.filter(i => !i.pinned)
  const sorted = [...pinned, ...normal]

  return (
    <section className="reminders">
      <div className="reminders-header">
        <span className="reminders-title">lembretes</span>
        <span className="reminders-count">{items.length}</span>
        {pinned.length > 0 && (
          <span className="reminders-pinned-count">📌 {pinned.length} fixado{pinned.length > 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="reminders-input-row">
        <input
          type="text"
          placeholder="adicionar lembrete..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button onClick={add}>+ adicionar</button>
      </div>
      {items.length === 0 && <p className="reminders-empty">nenhum lembrete ainda</p>}
      <ul className="reminders-list">
        {sorted.map(item => (
          <li key={item.id} className={`reminder-item ${item.pinned ? 'reminder-pinned' : ''}`}>
            <span className="reminder-dot">▸</span>
            <span className="reminder-text">{item.text}</span>
            <button
              className={`reminder-pin ${item.pinned ? 'reminder-pin-active' : ''}`}
              onClick={() => togglePin(item.id)}
              title={item.pinned ? 'Desafixar' : 'Fixar'}
            >📌</button>
            <button className="reminder-delete" onClick={() => remove(item.id)}>✕</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]     = useState('accounts') // 'accounts' | 'posts'
  const [stored, setStored] = useState(loadState)

  useEffect(() => {
    const id = setInterval(() => setStored(s => ({ ...s })), 10000)
    return () => clearInterval(id)
  }, [])

  function handleUse(id, amount) {
    setStored(prev => {
      const cur  = getAccountState(prev, id)
      const next = {
        ...prev,
        [id]: {
          points:   Math.max(0, cur.points - amount),
          lastUsed: cur.lastUsed ?? Date.now(),
        }
      }
      saveState(next)
      return next
    })
  }

  function handleReset(id) {
    setStored(prev => {
      const next = { ...prev, [id]: { points: MAX_POINTS, lastUsed: null } }
      saveState(next)
      return next
    })
  }

  const states     = ACCOUNTS.map(a => getAccountState(stored, a.id))
  const totalAvail = states.reduce((s, a) => s + a.points, 0)
  const totalMax   = ACCOUNTS.length * MAX_POINTS

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

        <nav className="header-nav">
          <button
            className={`nav-btn ${page === 'accounts' ? 'nav-btn--active' : ''}`}
            onClick={() => setPage('accounts')}
          >
            contas
          </button>
          <button
            className={`nav-btn ${page === 'posts' ? 'nav-btn--active' : ''}`}
            onClick={() => setPage('posts')}
          >
            análise de posts
          </button>
        </nav>

        {page === 'accounts' && (
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
              <span className="stat-val">{Math.round((totalAvail / totalMax) * 100)}%</span>
              <span className="stat-key">capacidade</span>
            </div>
          </div>
        )}
      </header>

      {page === 'accounts' && (
        <>
          <main className="grid">
            {ACCOUNTS.map((acc, i) => (
              <AccountCard
                key={acc.id}
                account={acc}
                state={states[i]}
                onUse={handleUse}
                onReset={handleReset}
              />
            ))}
          </main>
          <Reminders />
        </>
      )}

      {page === 'posts' && <PostsPage />}
    </div>
  )
}
