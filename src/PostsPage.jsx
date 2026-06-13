import { useState } from 'react'

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', color: '#FF0000', icon: '▶' },
  { id: 'tiktok',  label: 'TikTok',  color: '#69C9D0', icon: '♪' },
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

export default function PostsPage() {
  const [posts, setPosts] = useState(loadPosts)
  const [input, setInput] = useState('')

  function addPost() {
    const name = input.trim()
    if (!name) return
    const next = [
      ...posts,
      { id: Date.now(), name, youtube: false, tiktok: false, instagram: false }
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

  const totalPosted = posts.filter(p => p.youtube && p.tiktok && p.instagram).length
  const totalPartial = posts.filter(p => (p.youtube || p.tiktok || p.instagram) && !(p.youtube && p.tiktok && p.instagram)).length
  const totalPending = posts.filter(p => !p.youtube && !p.tiktok && !p.instagram).length

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
        <button onClick={addPost} className="posts-add-btn">
          + adicionar
        </button>
      </div>

      {posts.length === 0 && (
        <div className="posts-empty">
          <p>nenhum post ainda.</p>
          <p>adicione um post acima para começar.</p>
        </div>
      )}

      <div className="posts-list">
        {posts.map(post => {
          const allDone = post.youtube && post.tiktok && post.instagram
          const noneDone = !post.youtube && !post.tiktok && !post.instagram
          const statusClass = allDone ? 'post-done' : noneDone ? 'post-pending' : 'post-partial'

          return (
            <div key={post.id} className={`post-card ${statusClass}`}>
              <div className="post-header">
                <span className="post-name">{post.name}</span>
                <div className="post-header-right">
                  {allDone && <span className="post-badge post-badge--done">completo</span>}
                  {noneDone && <span className="post-badge post-badge--pending">pendente</span>}
                  {!allDone && !noneDone && <span className="post-badge post-badge--partial">parcial</span>}
                  <button className="post-delete" onClick={() => deletePost(post.id)} title="Deletar post">✕</button>
                </div>
              </div>
              <div className="post-platforms">
                {PLATFORMS.map(pl => (
                  <PlatformBadge
                    key={pl.id}
                    platform={pl}
                    checked={post[pl.id]}
                    onChange={v => togglePlatform(post.id, pl.id, v)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
