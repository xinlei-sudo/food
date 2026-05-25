# 华夏食境 · 中国美食地理 3D 可视化

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.170-black)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-6-purple)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com)

一个基于 React + Three.js 的 3D 交互式中国美食地图。旋转地球、点击省份下钻、搜索美食，用炫酷的暗黑科技风 UI 探索中国各地的地道风味。

## 截图

旋转 3D 地球，聚焦中国区域：
- 34 个省级行政区美食标记（动漫 emoji 徽章）
- GeoJSON 省界线叠加
- 暗黑主题 + 光晕 + 粒子星空

## 功能

| 功能 | 说明 |
|------|------|
| 3D 地球 | 高清纹理地球，微弱自转，暗黑科技风 |
| 省界线 | DataV GeoJSON 实时加载，发光轮廓 + 点云填充 |
| 省份下钻 | 点击省界 → 相机飞近 → 高亮边界 → 该省美食弹入 |
| 美食标记 | 34 省代表性美食 emoji 徽章，入场弹跳动画 |
| 悬停卡片 | 鼠标悬停 → 磨砂玻璃浮层，显示口味标签和位置 |
| 搜索框 | 按菜名/城市/省份/口味搜索，键盘 ↑↓ 导航 |
| 筛选栏 | 区域筛选（北方/川渝/江浙沪...）+ 口味筛选（辣/甜/酸...） |
| 小雨特效 | 粒子雨从球体上方落下 + 背景蓝光 |
| 相机飞行 | easeOutExpo 缓动，平滑飞向目标城市 |

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| Vite 6 | 构建工具 |
| Tailwind CSS 3 | 样式 |
| @react-three/fiber | React 三维渲染 |
| @react-three/drei | 3D 辅助（OrbitControls、Stars、Html...） |
| Three.js 0.170 | 3D 引擎 |
| DataV GeoJSON API | 省界数据 |

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/xinlei-sudo/food.git
cd food

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 浏览器打开 http://localhost:5173
```

## 项目结构

```
src/
├── App.jsx                    # 主布局 + 状态管理
├── main.jsx                   # React 入口
├── index.css                  # Tailwind + 全局样式
├── data/
│   └── foods.js               # 34 省美食数据集
├── hooks/
│   └── useGeoJSON.js          # GeoJSON 加载 Hook
└── components/
    ├── Globe.jsx              # 3D 场景主容器
    ├── FoodMarkers.jsx        # 美食标记管理
    ├── AnimeMarker.jsx        # 动漫 emoji 标记
    ├── ProvinceLines.jsx      # GeoJSON 省界线
    ├── SearchBar.jsx          # 搜索框
    ├── FilterBar.jsx          # 筛选栏
    ├── HoverCard.jsx          # 悬停卡片
    ├── InfoPanel.jsx          # 详情面板
    └── RainEffect.jsx         # 粒子雨特效
```

## 数据集

`src/data/foods.js` 包含 34 条美食数据，每条含：
- 菜名、省份、城市、经纬度
- 口味标签（麻辣/酸甜/鲜香等）
- 150 字简介
- 美食 emoji + 图片占位符

## 许可

MIT
