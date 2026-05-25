import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import FoodMarkers from './FoodMarkers'
import RainEffect from './RainEffect'
import ProvinceLines from './ProvinceLines'

const R = 2.2

// ====== 相机飞行动画器 ======
function CameraFlyController({ focusPos, focusDone, controlsRef }) {
  const { camera } = useThree()
  const animRef = useRef({
    active: false,
    camStart: new THREE.Vector3(),
    camEnd: new THREE.Vector3(),
    targetStart: new THREE.Vector3(),
    targetEnd: new THREE.Vector3(),
    startTime: 0,
    duration: 1.8,
  })

  useEffect(() => {
    if (!focusPos || !controlsRef?.current) return
    const a = animRef.current
    a.camStart.copy(camera.position)
    a.targetStart.copy(controlsRef.current.target)
    // 聚焦点（球面上城市位置）
    a.targetEnd.copy(focusPos)
    // 相机目标位置：沿法线外移
    const dir = focusPos.clone().normalize()
    a.camEnd.copy(focusPos).add(dir.multiplyScalar(1.6))
    a.camEnd.y += 0.25
    a.active = true
    a.startTime = performance.now() / 1000
  }, [focusPos, camera.position, controlsRef])

  useFrame(() => {
    const a = animRef.current
    if (!a.active) return

    const elapsed = performance.now() / 1000 - a.startTime
    const d = Math.min(elapsed / a.duration, 1.0)
    // easeOutExpo
    const t = d >= 1 ? 1 : 1 - Math.pow(2, -10 * d)

    camera.position.lerpVectors(a.camStart, a.camEnd, t)
    if (controlsRef?.current) {
      controlsRef.current.target.lerpVectors(a.targetStart, a.targetEnd, t)
    }

    if (d >= 1) {
      a.active = false
      focusDone?.()
    }
  })

  return null
}

// ====== 地球本体 ======
function Earth({ selectedId, onSelect, onHover, activeIds, onMarkerWorldPos, selectedProvince, onSelectProvince, freshKey, earthRef }) {
  const [colorMap, bumpMap, specMap] = useTexture([
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  ])

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += 0.03 * delta
  })

  return (
    <group ref={earthRef} rotation={[0.25, 4.55, 0.05]}>
      <mesh>
        <sphereGeometry args={[R, 128, 128]} />
        <meshPhongMaterial
          map={colorMap} bumpMap={bumpMap} bumpScale={0.05}
          specularMap={specMap} specular={new THREE.Color('grey')} shininess={5}
        />
      </mesh>
      {/* 省界线（GeoJSON 数据） */}
      <ProvinceLines selectedProvince={selectedProvince} onSelectProvince={onSelectProvince} />

      <FoodMarkers
        selectedId={selectedId} onSelect={onSelect} onHover={onHover}
        activeIds={activeIds} earthGroupRef={earthRef} onFocusWorld={onMarkerWorldPos}
        freshKey={freshKey}
      />
    </group>
  )
}

// ====== 大气层 ======
function Atmosphere() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[R + 0.04, 64, 64]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R + 0.15, 64, 64]} />
        <shaderMaterial
          transparent depthWrite={false} side={THREE.BackSide}
          uniforms={{ uColor: { value: new THREE.Color('#3366cc') } }}
          vertexShader={`
            varying vec3 vNormal; varying vec3 vPosition;
            void main() {
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vNormal = normalize(mat3(modelMatrix) * normal);
              vPosition = wp.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal; varying vec3 vPosition;
            uniform vec3 uColor;
            void main() {
              vec3 vd = normalize(cameraPosition - vPosition);
              float f = 1.0 - abs(dot(vd, vNormal));
              gl_FragColor = vec4(uColor, pow(f, 3.5) * 0.35);
            }
          `}
        />
      </mesh>
    </>
  )
}

// ====== 轨道环 ======
function OrbitalRing({ radius, count, color, speed, tilt }) {
  const pts = useMemo(() => {
    const a = []
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2
      a.push(Math.cos(ang) * radius, 0, Math.sin(ang) * radius)
    }
    return new Float32Array(a)
  }, [radius, count])
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) { ref.current.rotation.y += speed * delta; ref.current.rotation.x = tilt }
  })
  return (
    <line ref={ref} rotation={[tilt, 0, 0]}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pts, 3]} /></bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
    </line>
  )
}

// ====== 浮动粒子 ======
function FloatingParticles({ count = 200 }) {
  const ref = useRef()
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      const r = 3 + Math.random() * 5
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      a[i] = r * Math.sin(ph) * Math.cos(th)
      a[i + 1] = r * Math.sin(ph) * Math.sin(th)
      a[i + 2] = r * Math.cos(ph)
    }
    return a
  }, [count])
  useFrame((_, delta) => {
    if (ref.current) { ref.current.rotation.y += 0.02 * delta; ref.current.rotation.x += 0.01 * delta }
  })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial color="#88aacc" size={0.03} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// ====== 场景初始化 ======
function SceneSetup() {
  const { camera } = useThree()
  useState(() => { camera.position.set(1.5, 1.2, 4.5) })
  return null
}

// ====== 主组件 ======
export default function Globe({ selectedId, onSelect, onHover, activeIds, weatherOn, focusWorldPos, onFocusDone, selectedProvince, onSelectProvince, externalFocus }) {
  const [markerWorldPos, setMarkerWorldPos] = useState(null)
  const controlsRef = useRef(null)
  const earthRef = useRef(null)

  // 局部坐标 → 世界坐标
  const toWorld = (localPos) => {
    if (!earthRef.current) return localPos
    const world = localPos.clone()
    earthRef.current.localToWorld(world)
    return world
  }

  const handleMarkerWorldPos = (pos) => {
    // 标记点击已经转换到世界坐标，直接使用
    setMarkerWorldPos(pos)
  }

  // 外部聚焦触发（搜索等）— 需要 toWorld 转换
  useEffect(() => {
    if (externalFocus) {
      const wp = toWorld(new THREE.Vector3(externalFocus.x, externalFocus.y, externalFocus.z))
      setMarkerWorldPos(wp)
    }
  }, [externalFocus])

  // 省份点击 — 需要 toWorld 转换
  const handleProvinceSelect = (name, localPos) => {
    setMarkerWorldPos(toWorld(localPos))
    onSelectProvince?.(name, localPos)
  }

  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 40, near: 0.1, far: 100 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <SceneSetup />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, -1, -3]} intensity={0.3} color="#3355aa" />

      <Stars radius={30} depth={60} count={600} factor={3} saturation={0} fade speed={0.2} />

      <Earth
        selectedId={selectedId} onSelect={onSelect} onHover={onHover}
        activeIds={activeIds} onMarkerWorldPos={handleMarkerWorldPos}
        selectedProvince={selectedProvince} onSelectProvince={handleProvinceSelect}
        freshKey={selectedProvince || ''}
        earthRef={earthRef}
      />
      <Atmosphere />

      <OrbitalRing radius={2.7} count={120} color="#3388cc" speed={0.08} tilt={0.3} />
      <OrbitalRing radius={3.0} count={80} color="#aa6622" speed={-0.05} tilt={0.5} />
      <FloatingParticles count={60} />

      <RainEffect active={weatherOn} count={400} />

      <CameraFlyController
        focusPos={markerWorldPos}
        focusDone={() => {
          setMarkerWorldPos(null)
          onFocusDone?.()
        }}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping dampingFactor={0.15}
        rotateSpeed={0.25} zoomSpeed={1.5}
        minDistance={2.5} maxDistance={10}
        autoRotate autoRotateSpeed={0.1}
      />
    </Canvas>
  )
}
