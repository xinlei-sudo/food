import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import foods from '../data/foods'
import { FoodBadge } from './AnimeMarker'

const R = 2.2

// ====== 散落装饰光点 ======
function ScatteredDots() {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = []
    for (let i = 0; i < 60; i++) {
      const lat = 18 + Math.random() * 36
      const lon = 73 + Math.random() * 62
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      const r = R + 0.04 + Math.random() * 0.12
      arr.push(
        -r * Math.sin(phi) * Math.cos(theta),
         r * Math.cos(phi),
         r * Math.sin(phi) * Math.sin(theta),
      )
    }
    return new Float32Array(arr)
  }, [])
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += 0.02 * delta })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#8899bb" size={0.015} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// ====== 主组件 ======
export default function FoodMarkers({ selectedId, onSelect, onHover, activeIds, earthGroupRef, onFocusWorld, freshKey }) {
  const visible = activeIds ? foods.filter(f => activeIds.has(f.id)) : foods

  return (
    <group>
      {visible.map((food, i) => (
        <FoodBadge
          key={food.id}
          food={food}
          index={i}
          onSelect={onSelect}
          onHover={onHover}
          isSelected={selectedId === food.id}
          earthGroupRef={earthGroupRef}
          onFocusWorld={onFocusWorld}
          freshKey={freshKey}
        />
      ))}
      <ScatteredDots />
    </group>
  )
}
