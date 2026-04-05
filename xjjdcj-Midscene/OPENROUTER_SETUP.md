# OpenRouter 配置指南

## 🚀 快速开始

### 1. 获取 API Key

1. 访问 [OpenRouter](https://openrouter.ai)
2. 点击右上角 **Sign In** 登录
3. 进入 **Settings** → **API Keys**
4. 点击 **Create Key** 创建新密钥
5. 复制生成的 API Key（格式：`sk-or-v1-...`）

### 2. 配置项目

编辑 `.env` 文件，填入你的 API Key：

```bash
MIDSCENE_MODEL_API_KEY=sk-or-v1-your-actual-key-here
```

### 3. 选择模型

OpenRouter 支持多种视觉模型，推荐：

| 模型 | 名称 | 特点 | 价格 |
|------|------|------|------|
| **Qwen2-VL-72B** | `qwen/qwen2-vl-72b-instruct` | 视觉能力强，中文好 | $0.5/1M tokens |
| **Gemini Flash 1.5** | `google/gemini-flash-1.5` | 速度快，性价比高 | $0.075/1M tokens |
| **Claude 3 Haiku** | `anthropic/claude-3-haiku` | 稳定可靠 | $0.25/1M tokens |
| **Llama 3.2 Vision** | `meta-llama/llama-3.2-90b-vision-instruct` | 开源免费 | 免费 |

修改 `.env` 中的模型名称：
```bash
MIDSCENE_MODEL_NAME=qwen/qwen2-vl-72b-instruct
```

### 4. 测试配置

```bash
# 安装依赖
npm install

# 运行主程序检查配置
npm start

# 测试元素发现
npm run test -- discover
```

## 💰 免费额度

OpenRouter 提供免费模型：

- **Llama 3.2 Vision**: 完全免费
- **其他模型**: 新用户有 $1-5 的试用额度

查看免费模型：https://openrouter.ai/models?order=pricing-low-to-high

## 🔧 故障排除

### 错误：401 Unauthorized
- 检查 API Key 是否正确
- 确认 API Key 以 `sk-or-v1-` 开头

### 错误：429 Rate Limit
- 降低请求频率
- 升级套餐或等待配额重置

### 错误：Model Not Found
- 检查模型名称拼写
- 确认模型支持视觉能力

## 📊 成本估算

使用 OpenRouter 进行元素发现：

| 操作 | 估算消耗 | 成本 |
|------|---------|------|
| 识别 1 个元素 | 2-5 次 API 调用 | $0.01-0.05 |
| 识别全部 6 个元素 | 12-30 次 API 调用 | $0.05-0.20 |
| 后续自动化 | 0 次调用 | $0 |

## 📝 注意事项

1. **HTTP Referer**: OpenRouter 要求设置 Referer，已自动配置
2. **Rate Limit**: 免费用户有速率限制，建议降低操作频率
3. **模型选择**: 优先选择支持视觉的模型（Vision/VL）
4. **余额监控**: 定期查看 https://openrouter.ai/credits 监控余额

## 🔗 相关链接

- OpenRouter 官网：https://openrouter.ai
- 模型列表：https://openrouter.ai/models
- API 文档：https://openrouter.ai/docs
- 价格页面：https://openrouter.ai/models?order=pricing-low-to-high
