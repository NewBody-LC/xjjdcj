# 小鸡舰队出击自动化系统

> **Midscene + Playwright 混合方案** - 高效、低成本的 Canvas 游戏自动化解决方案

## 🎯 项目概述

这是一个针对 **小鸡舰队出击** 游戏的自动化系统，采用 **方案 B（混合模式）**：

- **第一阶段**：使用 Midscene 进行视觉识别（消耗 Token，一次性）
- **第二阶段**：使用 Playwright 直接点击（无 Token 消耗，可重复使用）

## ✨ 核心优势

| 特性 | 说明 |
|------|------|
| 🎮 **Canvas 支持** | 完美支持 Canvas 渲染的游戏界面 |
| 💰 **低成本** | 识别一次，重复使用，大幅降低 Token 消耗 |
| 🚀 **高效率** | 直接坐标点击，执行速度快 |
| 📝 **可视化** | 自动截图记录操作过程 |
| 🔧 **易扩展** | 配置文件驱动，易于添加新功能 |

## 📁 项目结构

```
xjjdcj-Midscene/
├── src/
│   ├── index.js          # 主入口
│   ├── discover.js       # 元素发现（使用 Midscene）
│   ├── automation.js     # 自动化执行（使用 Playwright）
│   └── test.js           # 测试工具
├── config/
│   └── elements.json     # 元素坐标配置
├── screenshots/          # 截图保存目录
├── logs/                 # 日志目录
├── package.json          # 项目配置
├── .env.example          # 环境变量模板
└── README.md             # 使用文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd xjjdcj-Midscene
npm install
```

### 2. 配置 AI 模型

复制环境变量模板：

```bash
copy .env.example .env
```

编辑 `.env` 文件，填入你的 AI 模型 API Key（推荐阿里云通义千问）：

```bash
# 阿里云通义千问
MIDSCENE_MODEL_API_KEY=sk-your-api-key-here
MIDSCENE_MODEL_NAME=qwen3.5-plus
MIDSCENE_MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MIDSCENE_MODEL_FAMILY=qwen3.5
```

### 3. 元素发现（第一阶段）

使用 Midscene 识别游戏界面元素，记录坐标：

```bash
npm run discover
```

⚠️ **注意**：此步骤会消耗 AI Token，但只需执行一次。

### 4. 运行自动化（第二阶段）

使用缓存的坐标执行自动化操作：

```bash
npm run run
```

✅ **优势**：此步骤不消耗 Token，可以无限次重复执行。

## 📖 使用指南

### 命令列表

| 命令 | 说明 |
|------|------|
| `npm start` | 显示主菜单 |
| `npm run discover` | 元素发现模式（消耗 Token） |
| `npm run run` | 执行自动化（无 Token 消耗） |
| `npm run test` | 测试工具 |
| `npm run init` | 初始化配置 |

### 测试单个操作

```bash
# 测试点击指定元素
npm run test -- click 冒险活动

# 测试指定工作流
npm run test -- workflow 每日任务

# 测试元素发现
npm run test -- discover
```

## ⚙️ 配置文件

### 元素配置 (`config/elements.json`)

```json
{
  "elements": {
    "冒险活动": {
      "name": "冒险活动",
      "description": "主界面冒险活动按钮",
      "coordinates": { "x": 1200, "y": 600 },
      "confidence": 0.9
    }
  },
  "workflows": {
    "每日任务": {
      "name": "每日任务",
      "steps": [
        { "action": "click", "target": "任务" },
        { "action": "click", "target": "领取奖励" },
        { "action": "click", "target": "关闭" }
      ]
    }
  }
}
```

### 环境变量 (`.env`)

```bash
# AI 模型配置
MIDSCENE_MODEL_API_KEY=your-api-key
MIDSCENE_MODEL_NAME=qwen3.5-plus
MIDSCENE_MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MIDSCENE_MODEL_FAMILY=qwen3.5

# 游戏配置
GAME_URL=https://www.wanyiwan.top/game/xjjdcj
GAME_WIDTH=1920
GAME_HEIGHT=1080

# 自动化配置
ACTION_DELAY=1000
LOAD_TIMEOUT=30000
```

## 💰 成本分析

### Token 消耗对比

| 方案 | 每次执行成本 | 适用场景 |
|------|-------------|---------|
| **纯 Midscene** | ¥0.06-0.30 | 界面经常变化 |
| **方案 B（混合）** | ¥0（识别后） | 界面相对稳定 ✅ |
| **纯 Playwright** | ¥0 | 坐标完全固定 |

### 成本示例（每日执行 10 次）

- **纯 Midscene**：每日 ¥0.6-3.0，每月 ¥18-90
- **方案 B**：首次 ¥0.5-2.0（识别），之后每月 ¥0
- **节省**：每月可节省 ¥18-90

## 🎮 支持的操作

### 元素操作
- ✅ 点击按钮
- ✅ 等待加载
- ✅ 截图记录
- ✅ 批量执行

### 工作流
- ✅ 每日任务
- ✅ 冒险活动
- ✅ 自定义流程

## 🔧 自定义扩展

### 添加新元素

1. 编辑 `config/elements.json`
2. 在 `elements` 中添加新元素
3. 运行 `npm run discover` 识别坐标

```json
{
  "elements": {
    "新按钮": {
      "name": "新按钮",
      "description": "描述信息",
      "coordinates": null
    }
  }
}
```

### 添加新工作流

1. 编辑 `config/elements.json`
2. 在 `workflows` 中添加新工作流

```json
{
  "workflows": {
    "新流程": {
      "name": "新流程",
      "description": "描述信息",
      "steps": [
        { "action": "click", "target": "按钮1" },
        { "action": "wait", "duration": 2000 },
        { "action": "click", "target": "按钮2" }
      ]
    }
  }
}
```

## 📸 截图记录

系统会自动截图保存到 `screenshots/` 目录：

- `initial-*.png` - 初始状态
- `final-*.png` - 最终状态
- `error-*.png` - 错误状态
- `step-*.png` - 步骤截图

## 🐛 故障排除

### 元素识别失败

1. 检查游戏是否完全加载
2. 确认元素确实在页面上
3. 尝试重新运行 `npm run discover`

### 点击位置不准确

1. 游戏界面可能发生变化
2. 重新运行 `npm run discover` 更新坐标
3. 检查游戏分辨率设置

### Token 消耗过快

1. 使用方案 B 的第二阶段（`npm run run`）
2. 避免频繁使用 `npm run discover`
3. 批量操作，减少 API 调用次数

## 📚 相关资源

- **Midscene.js**: https://midscenejs.com
- **Puppeteer**: https://pptr.dev
- **Skills 文档**: https://skills.sh/web-infra-dev/midscene-skills/browser-automation

## ⚠️ 免责声明

本工具仅供学习研究使用，请遵守游戏服务条款。使用自动化工具可能违反游戏规则，请自行承担风险。

## 📄 许可证

MIT License

---

**创建时间**: 2026-03-19  
**版本**: 1.0.0  
**作者**: xjjdcj-automation
