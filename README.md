# 🧠 码狼算法 — 算法可视化学习小程序

> 微信小程序 | 28 个算法 | Canvas 动画 | 免费无广告

<p align="center">
  <img src="./screenshots/gh_qrcode.jpg" width="200" alt="小程序码">
</p>
<p align="center"><b>👆 微信扫码体验</b></p>
<p align="center">或微信搜索「<b>码狼算法</b>」</p>

---

## 📊 算法清单（28个）

| 分类 | 算法 |
|------|------|
| 📊 排序 (12) | 冒泡、选择、插入、希尔、鸡尾酒、计数、基数、梳、桶、快速、归并、堆 |
| 🔍 搜索 (5) | 线性、二分、跳跃、插值、斐波那契 |
| 🗺️ 图算法 (2) | BFS 走迷宫、DFS 走迷宫 |
| 🏗️ 数据结构 (2) | 栈 (Stack)、队列 (Queue) |
| 🧮 动态规划 (2) | 斐波那契 DP、0/1 背包 |
| 🔢 数学 (5) | 埃氏筛法、欧几里得 GCD、快速幂、斐波那契搜索 |

## 🎨 特性

- **Canvas 2D 动画** — 每个算法每步状态可视化，播放/暂停/单步/速度调节
- **多色高亮** — 蓝色默认、黄色比较、红色交换、绿色已排序、紫色基准
- **迷宫可视化** — BFS/DFS 网格展示墙、已访问、当前节点、最终路径
- **DP 表格** — 背包问题三色高亮数据来源（不选/放入/当前）
- **WeUI 设计** — 腾讯官方 UI 样式库，橙黄色暖调主题

## 🛠 技术栈

- 微信小程序原生框架 (WXML + WXSS + JS)
- Canvas 2D API 动画引擎
- WeUI WXSS 样式库
- 步骤快照机制（算法执行 → 记录状态 → 逐帧回放）

## 🚀 本地运行

```bash
git clone https://github.com/supercodewolf/suanfa.git
```

用**微信开发者工具**打开项目根目录，配置 AppID 即可运行。

## 📝 项目结构

```
miniprogram/
├── pages/
│   ├── index/          # 首页 — 算法分类列表
│   └── detail/         # 详情页 — Canvas 动画 + 播放控制
├── utils/
│   ├── algorithms.js   # 28 个算法核心实现
│   └── visualizer.js   # Canvas 绘图引擎（6种快照类型）
├── data/
│   └── algorithmMeta.js # 算法元信息
└── styles/
    └── weui.wxss       # WeUI 样式
```

## 📄 License

MIT

---

<p align="center">
  <sub>⭐ 如果觉得有用，给个 Star 吧~</sub>
</p>
