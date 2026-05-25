import { useState, Suspense, useCallback, useMemo } from 'react'
import Globe from './components/Globe'
import InfoPanel from './components/InfoPanel'
import HoverCard from './components/HoverCard'
import FilterBar, { filterFoods } from './components/FilterBar'
import SearchBar from './components/SearchBar'
import foods from './data/foods'

/** 去除省份全称中的后缀，用于匹配 foods 数据中的短名称 */
function stripProvince(name) {
  return (name || '').replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区|行政區/g, '')
}

export default function App() {
  const [selectedFood, setSelectedFood] = useState(null)
  const [hoveredFood, setHoveredFood] = useState(null)
  const [hoverPos, setHoverPos] = useState(null)

  // 筛选状态
  const [activeRegion, setActiveRegion] = useState('all')
  const [activeTaste, setActiveTaste] = useState('all')
  const [weatherOn, setWeatherOn] = useState(false)

  // 省份下钻
  const [selectedProvince, setSelectedProvince] = useState(null)

  // 外部聚焦（搜索触发）
  const [externalFocus, setExternalFocus] = useState(null)

  // 筛选后的 activeIds：合并区域/口味筛选 + 省份下钻
  const activeIds = useMemo(() => {
    let filtered = filterFoods(foods, activeRegion, activeTaste)
    // 如果选中了省份，用归一化名称匹配（GeoJSON 全称 vs foods 短称）
    if (selectedProvince) {
      const target = stripProvince(selectedProvince)
      filtered = filtered.filter(f => stripProvince(f.province) === target)
    }
    return new Set(filtered.map(f => f.id))
  }, [activeRegion, activeTaste, selectedProvince])

  // 省份下钻时显示归一化名称
  const provinceLabel = useMemo(() => {
    if (!selectedProvince) return ''
    return stripProvince(selectedProvince)
  }, [selectedProvince])

  const handleSelect = useCallback((food) => {
    setSelectedFood(prev => prev?.id === food.id ? null : food)
  }, [])

  const handleHover = useCallback((food, pos) => {
    setHoveredFood(food)
    setHoverPos(pos)
  }, [])

  const handleClose = useCallback(() => setSelectedFood(null), [])

  // 搜索飞行
  const handleFlyTo = useCallback((food, pos) => {
    setSelectedFood(food)
    setSelectedProvince(null)
    setExternalFocus(pos)
  }, [])

  // 省份选择：设置省份 + 清除已选美食
  const handleProvinceSelect = useCallback((name) => {
    setSelectedProvince(prev => prev === name ? null : name)
    setSelectedFood(null)
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#080c18]">
      {/* 光晕背景 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px]"
             style={{ background: 'radial-gradient(circle, rgba(0,120,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full blur-[100px]"
             style={{ background: 'radial-gradient(circle, rgba(255,160,30,0.06) 0%, transparent 70%)' }} />
        {weatherOn && (
          <div className="absolute inset-0 blur-[80px] opacity-30 transition-opacity duration-1000"
               style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.1) 0%, transparent 60%)' }} />
        )}
      </div>

      <h1 className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-2xl font-bold tracking-[0.3em] pointer-events-none
                     bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent
                     drop-shadow-[0_0_30px_rgba(255,180,50,0.3)]">
        华夏食境
      </h1>
      <p className="absolute top-20 left-1/2 -translate-x-1/2 z-10 text-xs tracking-[0.5em] text-white/25 pointer-events-none">
        中国美食地理 · 3D 可视化
      </p>

      <p className="absolute top-28 left-1/2 -translate-x-1/2 z-10 text-xs text-white/15 tracking-wider pointer-events-none">
        🖱 拖动旋转 &nbsp;|&nbsp; 🔍 滚轮缩放 &nbsp;|&nbsp; 📍 双击省份下钻
      </p>

      {/* 省份下钻提示条 */}
      {selectedProvince && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-20
                        flex items-center gap-3 bg-black/60 backdrop-blur-md
                        rounded-full px-5 py-2 border border-amber-400/20">
          <span className="text-amber-300 text-sm font-bold">📍 {provinceLabel}</span>
          <span className="text-white/30 text-xs">
            {activeIds.size} 道美食
          </span>
          <button
            onClick={() => setSelectedProvince(null)}
            className="text-white/40 hover:text-white/80 text-sm transition-colors"
          >
            ✕ 退出下钻
          </button>
        </div>
      )}

      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
        </div>
      }>
        <Globe
          selectedId={selectedFood?.id}
          onSelect={handleSelect}
          onHover={handleHover}
          activeIds={activeIds}
          weatherOn={weatherOn}
          selectedProvince={selectedProvince}
          onSelectProvince={handleProvinceSelect}
          externalFocus={externalFocus}
        />
      </Suspense>

      <SearchBar onFlyTo={handleFlyTo} />
      <HoverCard food={hoveredFood} screenPos={hoverPos} />
      <InfoPanel food={selectedFood} onClose={handleClose} />

      <FilterBar
        activeRegion={activeRegion} onRegionChange={setActiveRegion}
        activeTaste={activeTaste} onTasteChange={setActiveTaste}
        weatherOn={weatherOn} onWeatherToggle={() => setWeatherOn(v => !v)}
      />
    </div>
  )
}
