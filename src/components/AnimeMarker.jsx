import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { getFoodColor } from '../data/foods'

const R = 2.2

function latLonToPos(lat, lon) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -R * Math.sin(phi) * Math.cos(theta),
     R * Math.cos(phi),
     R * Math.sin(phi) * Math.sin(theta),
  )
}

/**
 * 单个动漫美食标记
 * 使用 drei/Html 在 3D 位置渲染 DOM
 */
export const FoodBadge = memo(function FoodBadge({ food, index, onSelect, onHover, isSelected, earthGroupRef, onFocusWorld, freshKey }) {
  const [entered, setEntered] = useState(false)
  const [hovered, setHovered] = useState(false)
  const color = getFoodColor(food)
  const pos = latLonToPos(food.lat, food.lon)
  // 向外偏移到球面上方
  const offset = pos.clone().normalize().multiplyScalar(R * 1.07)

  // 入场动画触发（延迟错开 + freshKey 变化重播）
  useEffect(() => {
    setEntered(false)
    const timer = setTimeout(() => setEntered(true), 80 + index * 40)
    return () => clearTimeout(timer)
  }, [index, freshKey])

  const handleClick = useCallback(() => {
    onSelect(food)
    // 触发相机飞行：从本地坐标转世界坐标
    const local = pos.clone()
    if (earthGroupRef?.current) {
      const world = local.clone()
      earthGroupRef.current.localToWorld(world)
      onFocusWorld?.(world)
    } else {
      onFocusWorld?.(local)
    }
  }, [food, onSelect, earthGroupRef, pos, onFocusWorld])

  const badgeRef = useRef(null)

  const handlePointerEnter = useCallback(() => {
    setHovered(true)
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      onHover?.(food, { x: rect.left + rect.width / 2, y: rect.top })
    }
  }, [food, onHover])

  const handlePointerLeave = useCallback(() => {
    setHovered(false)
    onHover?.(null, null)
  }, [onHover])

  const scale = hovered ? 1.45 : isSelected ? 1.25 : 1

  return (
    <Html
      position={offset}
      center
      style={{
        pointerEvents: 'auto',
        transform: `scale(${scale})`,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: entered ? 1 : 0,
      }}
      zIndexRange={[0, 30]}
      occlude={false}
    >
      <div
        ref={badgeRef}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          animation: entered ? `markerBounce 0.6s ${0.08 + index * 0.04}s cubic-bezier(0.34, 1.56, 0.64, 1) both` : 'none',
        }}
      >
        {/* 底部光晕 */}
        <div style={{
          position: 'absolute', inset: -10,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
          opacity: hovered ? 0.9 : 0.3,
          transition: 'opacity 0.3s',
        }} />

        {/* 主徽章 */}
        <div style={{
          position: 'relative',
          width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}22, ${color}44)`,
          border: `2px solid ${color}88`,
          boxShadow: hovered
            ? `0 0 24px ${color}66, 0 0 48px ${color}33, inset 0 0 12px ${color}22`
            : `0 0 12px ${color}33, 0 0 24px ${color}11`,
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(4px)',
        }}>
          <span style={{
            fontSize: 26,
            lineHeight: 1,
            filter: hovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' : 'none',
            transition: 'filter 0.3s',
          }}>
            {food.emoji}
          </span>
        </div>

        {/* 城市名小标签 */}
        <div style={{
          textAlign: 'center', marginTop: 3,
          fontSize: 11, fontWeight: 700,
          color: hovered ? '#ffffff' : '#ddccaa',
          textShadow: hovered ? '0 0 10px rgba(255,220,150,0.5)' : '0 0 6px rgba(0,0,0,0.8)',
          transition: 'all 0.3s',
          letterSpacing: 1,
          whiteSpace: 'nowrap',
          background: hovered ? 'rgba(0,0,0,0.5)' : 'transparent',
          borderRadius: 8,
          padding: hovered ? '1px 8px' : '0',
        }}>
          {food.city}
        </div>

        {/* 选中指示环 */}
        {isSelected && (
          <div style={{
            position: 'absolute', top: -8, left: -8, right: -8, bottom: -8,
            borderRadius: '50%',
            border: `2px dashed ${color}`,
            animation: 'spin 8s linear infinite',
            opacity: 0.6,
          }} />
        )}
      </div>

      {/* 注入 keyframes */}
      <style>{`
        @keyframes markerBounce {
          0%   { opacity: 0; transform: translateY(-16px) scale(0.3); }
          60%  { opacity: 1; transform: translateY(3px) scale(1.08); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </Html>
  )
})

export default FoodBadge
