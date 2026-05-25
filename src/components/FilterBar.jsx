import { useMemo } from 'react'

// 区划定义
const REGIONS = [
  { key: 'all',   label: '全部' },
  { key: 'north', label: '北方',  ids: ['beijing','tianjin','hebei','shanxi','neimenggu','liaoning','jilin','heilongjiang','shandong','henan','shaanxi','gansu','qinghai','ningxia','xinjiang'] },
  { key: 'south', label: '南方',  ids: ['guangdong','guangxi','hainan','fujian','jiangxi','hunan','yunnan','guizhou','hubei','anhui','zhejiang','jiangsu','shanghai','taiwan','hongkong','macau','tibet'] },
  { key: 'cy',    label: '川渝',  ids: ['sichuan','chongqing'] },
  { key: 'jzh',   label: '江浙沪', ids: ['jiangsu','zhejiang','shanghai'] },
  { key: 'xn',    label: '西南',  ids: ['yunnan','guizhou','guangxi'] },
  { key: 'xb',    label: '西北',  ids: ['xinjiang','gansu','qinghai','ningxia','shaanxi'] },
]

const TASTES = [
  { key: 'all',    label: '全部' },
  { key: 'spicy',  label: '🌶️ 辣党', tags: ['麻辣','香辣','酸辣','辛辣','微辣'] },
  { key: 'sweet',  label: '🍯 甜党', tags: ['酸甜','香甜','甜香','鲜甜'] },
  { key: 'sour',   label: '🍋 酸爽', tags: ['酸辣','酸甜'] },
  { key: 'light',  label: '🍃 清淡', tags: ['鲜美','清淡','嫩滑','原味'] },
]

export default function FilterBar({
  activeRegion, onRegionChange,
  activeTaste, onTasteChange,
  weatherOn, onWeatherToggle,
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20
                    flex flex-col items-center gap-3">
      {/* 筛选行 */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* 区域筛选 */}
        <div className="flex gap-1 bg-white/5 backdrop-blur-md rounded-full px-1.5 py-1 border border-white/5">
          {REGIONS.map(r => (
            <button
              key={r.key}
              onClick={() => onRegionChange(r.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                ${activeRegion === r.key
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/20'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-white/8" />

        {/* 口味筛选 */}
        <div className="flex gap-1 bg-white/5 backdrop-blur-md rounded-full px-1.5 py-1 border border-white/5">
          {TASTES.map(t => (
            <button
              key={t.key}
              onClick={() => onTasteChange(t.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                ${activeTaste === t.key
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/20'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 天气开关 */}
      <button
        onClick={onWeatherToggle}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-300 border backdrop-blur-md
          ${weatherOn
            ? 'bg-sky-500/15 text-sky-300 border-sky-400/30 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
            : 'bg-white/5 text-white/30 border-white/5 hover:text-white/50'
          }`}
      >
        <span className={`text-sm ${weatherOn ? 'animate-bounce' : ''}`}>
          {weatherOn ? '🌧️' : '☁️'}
        </span>
        {weatherOn ? '小雨中...' : '小雨'}
      </button>
    </div>
  )
}

// 导出筛选逻辑工具函数
export function filterFoods(foods, regionKey, tasteKey) {
  const region = REGIONS.find(r => r.key === regionKey)
  const taste = TASTES.find(t => t.key === tasteKey)

  let result = foods

  if (region && region.ids) {
    const idSet = new Set(region.ids)
    result = result.filter(f => idSet.has(f.id))
  }

  if (taste && taste.tags) {
    const tagSet = new Set(taste.tags)
    result = result.filter(f => f.tags.some(tag => tagSet.has(tag)))
  }

  return result
}

export { REGIONS, TASTES }
