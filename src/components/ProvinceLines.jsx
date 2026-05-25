import { useMemo, useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useChinaGeoJSON } from '../hooks/useGeoJSON'

const R = 2.21

function geoToVec3(lon, lat) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -R * Math.sin(phi) * Math.cos(theta),
     R * Math.cos(phi),
     R * Math.sin(phi) * Math.sin(theta),
  )
}

function ringToPoints(ring) {
  return ring.map(([lon, lat]) => geoToVec3(lon, lat))
}

// ====== 发光边界线 ======
function GlowBoundary({ points, color = '#ffaa33', opacity = 0.5, highlighted = false }) {
  const glowGeom = useMemo(() => {
    const arr = new Float32Array(points.length * 3)
    for (let i = 0; i < points.length; i++) {
      arr[i * 3] = points[i].x; arr[i * 3 + 1] = points[i].y; arr[i * 3 + 2] = points[i].z
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [points])

  const hOp = highlighted ? opacity * 2 : opacity

  return (
    <>
      <line geometry={glowGeom}>
        <lineBasicMaterial color={highlighted ? '#ffdd66' : color} transparent opacity={hOp * 0.35} depthTest={true} depthWrite={false} blending={THREE.AdditiveBlending} />
      </line>
      <line geometry={glowGeom}>
        <lineBasicMaterial color={highlighted ? '#ffffff' : color} transparent opacity={hOp * 0.75} depthTest={true} depthWrite={false} />
      </line>
    </>
  )
}

// ====== 省份填充点云 ======
function ProvincePoints({ rings, color = '#ffcc44', highlighted = false }) {
  const allPts = useMemo(() => {
    const pts = []
    for (const ring of rings) {
      if (!ring || ring.length < 4) continue
      const v = ringToPoints(ring)
      for (let i = 0; i < Math.min(v.length * 3, 60); i++) {
        const a = Math.random()
        const idx = Math.floor(Math.random() * v.length)
        const nxt = (idx + 1) % v.length
        const p = new THREE.Vector3().lerpVectors(v[idx], v[nxt], a)
        const norm = p.clone().normalize()
        p.add(norm.multiplyScalar(0.02 + Math.random() * 0.06))
        pts.push(p)
      }
    }
    const arr = new Float32Array(pts.length * 3)
    for (let i = 0; i < pts.length; i++) {
      arr[i * 3] = pts[i].x; arr[i * 3 + 1] = pts[i].y; arr[i * 3 + 2] = pts[i].z
    }
    return arr
  }, [rings])

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(allPts, 3))
    return g
  }, [allPts])

  if (allPts.length === 0) return null

  return (
    <points geometry={geom}>
      <pointsMaterial color={highlighted ? '#ffdd66' : color} size={highlighted ? 0.025 : 0.012}
        transparent opacity={highlighted ? 0.5 : 0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// ====== 计算多边形中心（经纬度平均） ======
function computeCenter(rings) {
  if (!rings || rings.length === 0 || !rings[0] || rings[0].length === 0) return null
  const mainRing = rings[0]
  let sumLon = 0, sumLat = 0, count = 0
  for (const pt of mainRing) {
    if (pt.length >= 2) {
      sumLon += pt[0]
      sumLat += pt[1]
      count++
    }
  }
  if (count === 0) return null
  return { lon: sumLon / count, lat: sumLat / count }
}

// ====== 可点击省份中心球 ======
function ClickTarget({ center, name, onSelect }) {
  const { camera, raycaster } = useThree()
  const pos = useMemo(() => {
    if (!center) return null
    return geoToVec3(center.lon, center.lat)
  }, [center])

  // 侦测点击：使用全局 raycaster（由 Globe 场景层提供）
  const ref = useRef()

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (pos && name) {
      // 世界坐标（pos 在 Earth group 局部空间，需要传到父级处理）
      onSelect?.(name, pos.clone())
    }
  }, [name, pos, onSelect])

  if (!pos) return null

  return (
    <mesh ref={ref} position={pos} onClick={handleClick}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshBasicMaterial color="#ffdd00" transparent opacity={0} depthTest={true} />
    </mesh>
  )
}

// ====== 单个省份 ======
function GeoFeature({ feature, index, selectedProvince, onSelectProvince }) {
  const { geometry, properties } = feature
  if (!geometry) return null

  const name = properties?.name || ''

  const rings = []
  if (geometry.type === 'Polygon') {
    rings.push(...geometry.coordinates)
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      rings.push(...polygon)
    }
  }

  const outerRings = rings.length > 0 ? [rings[0]] : []
  const innerRings = rings.slice(1)
  const isChina = name === '中国'
  const highlighted = selectedProvince === name
  const color = isChina ? '#ffcc66' : highlighted ? '#ffdd66' : '#ff9922'

  // 计算省份中心
  const center = useMemo(() => computeCenter(rings), [rings])

  const handleProvinceSelect = useCallback((provName, worldPos) => {
    onSelectProvince?.(provName, worldPos)
  }, [onSelectProvince])

  return (
    <group>
      {outerRings.map((ring, ri) => {
        const pts = ringToPoints(ring)
        if (pts.length < 4) return null
        return <GlowBoundary key={`${index}-${ri}`} points={pts} color={color} opacity={isChina ? 0.55 : 0.4} highlighted={highlighted} />
      })}
      {innerRings.map((ring, ri) => {
        const pts = ringToPoints(ring)
        if (pts.length < 4) return null
        return <GlowBoundary key={`inner-${index}-${ri}`} points={pts} color={color} opacity={0.25} highlighted={highlighted} />
      })}
      <ProvincePoints rings={rings} color={color} highlighted={highlighted} />
      {/* 非中国整体时加可点击中心 */}
      {!isChina && center && (
        <ClickTarget center={center} name={name} onSelect={handleProvinceSelect} />
      )}
    </group>
  )
}

// ====== 主组件 ======
export default function ProvinceLines({ selectedProvince, onSelectProvince }) {
  const { data, loading } = useChinaGeoJSON()

  const features = useMemo(() => {
    if (!data?.features) return []
    return data.features
  }, [data])

  return (
    <group>
      {features.map((feature, i) => (
        <GeoFeature
          key={feature.properties?.adcode || i}
          feature={feature}
          index={i}
          selectedProvince={selectedProvince}
          onSelectProvince={onSelectProvince}
        />
      ))}
    </group>
  )
}
