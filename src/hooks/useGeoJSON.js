import { useState, useEffect } from 'react'

/**
 * 加载中国省级/市级 GeoJSON 边界数据
 * 数据源：阿里云 DataV 地理数据 API
 *
 * @param {'china'|'province'|'city'} level - 数据层级
 * @returns {{ data: object|null, loading: boolean, error: string|null }}
 */
export function useChinaGeoJSON() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGeoJSON() {
      try {
        // DataV 全国省级边界（含所有省份 MultiPolygon）
        const url = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('GeoJSON 加载失败，使用简化数据', err.message)
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetchGeoJSON()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}

/**
 * 加载单个省份的详细 GeoJSON（含市级边界）
 * @param {string} adcode - 省份行政区划代码（如 110000 北京）
 */
export function useProvinceGeoJSON(adcode) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!adcode) return
    let cancelled = false

    async function fetchProvince() {
      setLoading(true)
      try {
        const url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.warn(`省份 ${adcode} 加载失败`, err.message)
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetchProvince()
    return () => { cancelled = true }
  }, [adcode])

  return { data, loading, error }
}
