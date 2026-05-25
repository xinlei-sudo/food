import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 粒子雨特效
 * 在地球上方生成下落粒子，模拟小雨效果
 * active: 是否开启
 * count: 粒子数量
 */
export default function RainEffect({ active = false, count = 400 }) {
  const ref = useRef()
  const geomRef = useRef()

  // 初始粒子位置（球壳外随机分布）
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      const r = 2.5 + Math.random() * 2.5       // 半径 2.5~5.0
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1) // 球面均匀分布

      arr[i]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i + 1] = r * Math.sin(phi) * Math.sin(theta) + 2  // 偏上方
      arr[i + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (!ref.current || !geomRef.current || !active) return

    const pos = geomRef.current.attributes.position.array
    const dt = delta * 0.9

    for (let i = 0; i < pos.length; i += 3) {
      // 雨滴下落
      pos[i + 1] -= dt * (0.6 + Math.random() * 0.1)

      // 重置：掉出底部范围则回到顶部
      if (pos[i + 1] < -4) {
        pos[i + 1] = 3 + Math.random() * 1.5
        // 随机横向偏移
        const r = 2.5 + Math.random() * 2.5
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        pos[i]     = r * Math.sin(phi) * Math.cos(theta)
        pos[i + 1] = 3 + Math.random() * 2
        pos[i + 2] = r * Math.cos(phi)
      }
    }
    geomRef.current.attributes.position.needsUpdate = true
    ref.current.visible = true
  })

  return (
    <points ref={ref} visible={active}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8899dd"
        size={0.025}
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
