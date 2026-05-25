import { useEffect, useRef } from 'react'
import { getFoodColor } from '../data/foods'

export default function InfoPanel({ food, onClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (food && panelRef.current) {
      panelRef.current.classList.remove('panel-enter')
      void panelRef.current.offsetWidth // reflow 触发重播动画
      panelRef.current.classList.add('panel-enter')
    }
  }, [food?.id])

  if (!food) return null

  const color = getFoodColor(food)

  return (
    <div
      ref={panelRef}
      className="panel-enter absolute left-6 bottom-8 z-20
                 bg-black/75 backdrop-blur-xl rounded-2xl px-6 py-4
                 border border-amber-500/10 shadow-[0_0_60px_rgba(0,0,0,0.8)]
                 max-w-xs"
    >
      {/* 口味标签 */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {food.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-xs font-medium border"
            style={{ color, borderColor: color + '44', background: color + '14' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 菜名 + emoji */}
      <h3 className="text-xl font-bold text-white/90 mb-0.5">
        {food.emoji} {food.name}
      </h3>

      {/* 城市信息 */}
      <p className="text-amber-400/70 text-sm mb-2">
        📍 {food.province} · {food.city}
      </p>

      {/* 简介 */}
      <p className="text-xs text-white/45 leading-relaxed">
        {food.desc}
      </p>

      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-6 h-6 rounded-full
                   border border-white/10 text-white/30 hover:text-white/70
                   hover:border-white/20 transition-colors text-sm flex items-center justify-center"
      >
        ×
      </button>
    </div>
  )
}
