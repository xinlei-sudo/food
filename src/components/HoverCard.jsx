import { useState, useEffect, useRef } from 'react'
import { getFoodColor } from '../data/foods'

/**
 * 悬浮磨砂玻璃卡片
 * 通过 3D 坐标投影到屏幕定位
 * food: 当前悬停的美食对象
 * screenPos: { x, y } 屏幕坐标
 */
export default function HoverCard({ food, screenPos }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (food) {
      // 延迟 300ms 出现，防止快速划过时闪烁
      timerRef.current = setTimeout(() => setVisible(true), 300)
    } else {
      setVisible(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [food?.id])

  if (!food) return null

  const color = getFoodColor(food)
  const opacity = visible ? 1 : 0

  return (
    <div
      className="fixed z-30 pointer-events-none transition-all duration-300 ease-out"
      style={{
        left: screenPos.x,
        top: screenPos.y,
        opacity,
        transform: `translate(-50%, -110%) scale(${visible ? 1 : 0.9})`,
      }}
    >
      {/* 小三角箭头 */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
           style={{ background: 'rgba(12, 14, 24, 0.92)' }} />

      <div
        className="rounded-xl px-4 py-3 min-w-[220px] max-w-[260px]
                   backdrop-blur-2xl border shadow-2xl"
        style={{
          background: 'rgba(12, 14, 24, 0.88)',
          borderColor: color + '33',
          boxShadow: `0 0 40px ${color}15, 0 12px 40px rgba(0,0,0,0.6)`,
        }}
      >
        {/* 口味标签 */}
        <div className="flex gap-1 mb-2 flex-wrap">
          {food.tags.map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
              style={{ color, background: color + '18', border: `1px solid ${color}22` }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 菜名 */}
        <h4 className="text-white/90 font-bold text-sm mb-0.5">
          {food.emoji} {food.name}
        </h4>

        {/* 位置 */}
        <p className="text-white/40 text-xs">
          📍 {food.province} · {food.city}
        </p>
      </div>
    </div>
  )
}
