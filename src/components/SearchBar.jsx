import { useState, useRef, useEffect, useCallback } from 'react'
import foods from '../data/foods'

const R = 2.2

function latLonToWorld(lat, lon) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  // 返回 Three.js Vector3 格式（会被 Globe 中的 CameraFlyController 使用）
  return {
    x: -R * Math.sin(phi) * Math.cos(theta),
    y:  R * Math.cos(phi),
    z:  R * Math.sin(phi) * Math.sin(theta),
  }
}

export default function SearchBar({ onFlyTo }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [focused, setFocused] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const doSearch = useCallback((q) => {
    if (!q.trim()) { setResults([]); return }
    const low = q.toLowerCase()
    const matches = foods.filter(f =>
      f.name.includes(q) || f.city.includes(q) || f.province.includes(q) ||
      f.name.toLowerCase().includes(low) || f.city.toLowerCase().includes(low) ||
      f.tags.some(t => t.includes(q))
    ).slice(0, 8)
    setResults(matches)
    setActiveIdx(-1)
  }, [])

  useEffect(() => {
    doSearch(query)
  }, [query, doSearch])

  const handleSelect = (food) => {
    const pos = latLonToWorld(food.lat, food.lon)
    onFlyTo?.(food, pos)
    setQuery('')
    setResults([])
    setFocused(false)
    inputRef.current?.blur()
  }

  // 键盘导航
  const handleKeyDown = (e) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(prev => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      handleSelect(results[activeIdx])
    } else if (e.key === 'Escape') {
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  // 点击外部关闭
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="fixed top-24 right-8 z-30 w-72">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="🔍 搜索美食、城市、口味..."
          className="w-full px-4 py-2.5 rounded-xl text-sm
                     bg-white/5 backdrop-blur-xl border border-white/10
                     text-white/90 placeholder-white/25
                     focus:outline-none focus:border-amber-400/30 focus:bg-white/8
                     transition-all duration-300"
        />

        {/* 下拉结果 */}
        {focused && results.length > 0 && (
          <div className="absolute top-full mt-2 w-full rounded-xl overflow-hidden
                          bg-black/80 backdrop-blur-xl border border-white/10
                          shadow-2xl shadow-black/50">
            {results.map((food, i) => (
              <button
                key={food.id}
                onMouseDown={() => handleSelect(food)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${i === activeIdx ? 'bg-amber-400/10' : 'hover:bg-white/5'}`}
              >
                <span className="text-xl">{food.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white/85 text-sm font-medium truncate">{food.name}</div>
                  <div className="text-white/30 text-xs">{food.province} · {food.city}</div>
                </div>
                <div className="flex gap-1">
                  {food.tags.slice(0, 2).map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40">{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 快捷键提示 */}
        {!focused && !query && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 text-xs pointer-events-none
                          border border-white/10 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  )
}
