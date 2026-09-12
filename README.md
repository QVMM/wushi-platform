# 狮舞阶段式标准化教学平台

南狮（醒狮）阶段式标准化教学的高保真交互原型 —— Vite + React + TypeScript + Tailwind CSS v4。

## 功能概览

- **学习首页**：总体进度、继续学习卡片、四阶段总览
- **阶段路径**：初 → 中 → 高 + 场景教学，锁定/解锁示意
- **阶段详情**：课时列表与进度
- **课时学习（教练实验室）**：
  - 模拟视频播放器（播放/暂停、拖拽进度、0.5x/1x、骨架叠加开关）
  - 关键帧芯片与动作拆解时间轴
  - SVG 姿态骨架面板
  - 要领 / 易错 / 口诀 / 安全 选项卡
  - 考核标准清单
- **动作标准库**：术语表 + 评分维度
- **我的进度**：本地 mock 进度（无鉴权）

## 环境要求

- Node.js 18+
- npm 9+

## 安装与运行

```bash
cd /workspace/wushi-platform
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

浏览器访问：http://127.0.0.1:5173/

## 构建

```bash
npm run build
npm run preview
```

## 素材

课时静帧图片位于 `public/lessons/`，来源于 `wushi-materials/web-assets/`（未包含大型 mp4）。

## 设计语言

- 墨色背景 `#0B0C0F` / `#12141A`
- 朱红 `#C23A2B`、哑金 `#C6A15B`
- 标题：Noto Serif SC；界面：Inter / 系统黑体
- 文化 × 科技：印章角标、细金线分隔，避免民俗堆砌

## 路由

| 路径 | 页面 |
|------|------|
| `/` | 学习首页 |
| `/path` | 阶段路径 |
| `/stage/:stageId` | 阶段详情（beginner / intermediate / advanced / concept） |
| `/lesson/:lessonId` | 课时学习 |
| `/standards` | 动作标准库 |
| `/profile` | 我的进度 |

## 技术栈

- Vite 7 · React 19 · TypeScript
- Tailwind CSS v4（`@tailwindcss/vite`）
- react-router-dom v7

## 素材说明

- Logo 醒狮图标来自 Flaticon 免费图标库，原型演示用途；正式商用请按 Flaticon 许可补全署名或购买授权。
