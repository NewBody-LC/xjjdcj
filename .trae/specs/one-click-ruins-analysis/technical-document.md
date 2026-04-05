# 一键遗迹功能技术文档

## 1. 功能整体架构与核心流程说明

### 1.1 功能概述
"一键遗迹"是小鸡舰队出击辅助工具的核心功能，通过图像识别和自动点击实现遗迹地图的智能探索。系统自动识别游戏界面状态，选择最佳节点进行挑战，直至达到目标难度或用户停止。

### 1.2 核心入口流程

```
用户点击"开始一键遗迹"按钮
    ↓
handleRuinsControl() 被调用
    ↓
设置 ruinsStopRequested = false
设置 isRuinsRunning = true
更新按钮状态为"停止一键遗迹"
    ↓
启动 smartExploreRuins() 核心探索流程
    ↓
循环执行以下步骤（最多50步）：
    ① 检查停止请求
    ② 检查是否达到目标难度
    ③ 分析当前游戏状态
    ④ 根据状态执行对应处理
    ↓
用户点击"停止一键遗迹"按钮时
    ↓
设置 ruinsStopRequested = true
停止时不清除 ruinsStopRequested（让日志检查生效）
```

### 1.3 核心函数列表

| 函数名 | 功能说明 |
|--------|----------|
| handleRuinsControl() | 一键遗迹控制入口，根据状态开始/停止 |
| smartExploreRuins() | 核心探索主循环，最多50步 |
| analyzeRuinsMap() | 分析当前地图，返回状态和可达节点 |
| checkTargetDifficulty() | 检查是否达到目标难度 |
| selectBestNode() | 选择最佳节点（优先级算法） |
| clickAtPosition() | 在指定坐标点击 |
| handleBattle() | 处理战斗状态轮询 |
| handleSelection() | 处理装备/英雄选择 |
| handleVictoryComplete() | 处理胜利完成界面 |
| clickChallengeButtonIfPresent() | 检测并点击挑战按钮 |
| detectChallengeButton() | 检测挑战按钮是否存在 |
| detectVictoryCompleteScreen() | 检测胜利完成界面 |
| checkStopRequested() | 检查是否请求停止 |

---

## 2. 各关键节点的逻辑判断条件及分支处理机制

### 2.1 smartExploreRuins() 主循环流程

```
while (steps < 50) {
    // ① 停止检查
    if (checkStopRequested()) return;

    steps++;
    log(`第 ${steps} 步探索...`);

    // ② 目标难度检查
    if (checkTargetDifficulty()) return;

    // ③ 状态分析
    const analysis = await analyzeRuinsMap();
    if (!analysis) break;

    // ④ 状态分支处理
    switch (analysis.currentState) {
        case '地图':
            if (有可达节点) {
                选择最佳节点 → 点击节点 → 等待2秒
                if (战斗类节点) {
                    检测并点击挑战按钮
                }
                等待3秒
            } else {
                连续无节点次数++
                if (连续 >= 3次) return;
                等待3秒
            }
            break;

        case '战斗':
            执行 handleBattle() → 轮询等待战斗结束
            break;

        case '选择':
            执行 handleSelection() → 自动选择
            break;

        case '胜利完成':
            执行 handleVictoryComplete() → 点击确定
            break;

        default:
            等待2秒
    }
}
```

### 2.2 节点选择逻辑

**selectBestNode()** 使用优先级算法：

| 节点类型 | 颜色 | 优先级 | 说明 |
|----------|------|--------|------|
| shop | 绿色 | 5（最高） | 商店，可购买道具 |
| event | 蓝色 | 4 | 随机事件 |
| normal | 黄色 | 3 | 普通战斗 |
| elite | 红色 | 2 | 精英战斗 |
| boss | 紫色 | 1（最低） | BOSS战 |

```javascript
// 排序逻辑：按优先级降序排列
return nodes.sort((a, b) => priority[b.type] - priority[a.type])[0];
```

### 2.3 节点点击后处理

```javascript
await clickAtPosition(targetNode.x, targetNode.y);
await sleep(2000);

// 战斗类节点需要额外处理
if (targetNode.type === 'normal' || targetNode.type === 'elite' || targetNode.type === 'boss') {
    await clickChallengeButtonIfPresent();  // 检测并点击挑战按钮
}
await sleep(3000);
```

---

## 3. 所有可能的状态定义、状态转换规则及判断标准

### 3.1 状态定义

| 状态名称 | 英文名 | 说明 |
|----------|--------|------|
| 地图 | Map | 可探索状态，显示可点击的节点 |
| 战斗 | Battle | 战斗进行中 |
| 选择 | Selection | 装备/角色选择界面 |
| 胜利完成 | VictoryComplete | 战斗胜利弹窗 |
| 节点挑战 | NodeChallenge | 节点点击后弹出的挑战确认界面 |
| 准备 | Ready | 显示开始挑战按钮 |
| 入口界面 | Entry | 显示前往遗迹按钮 |
| 未知 | Unknown | 无法识别的状态 |

### 3.2 状态转换规则

```
┌─────────────┐
│  入口界面    │ ←→ 准备、地图、节点挑战
└─────────────┘
      ↓
┌─────────────┐
│   准备      │ ←→ 地图、战斗、入口界面
└─────────────┘
      ↓
┌─────────────┐
│   地图      │ ←→ 节点挑战、战斗、选择、胜利完成
└─────────────┘
      ↓
┌─────────────┐
│  节点挑战    │ ←→ 战斗、地图
└─────────────┘
      ↓
┌─────────────┐
│   战斗      │ ←→ 选择、胜利完成、地图
└─────────────┘
      ↓
┌─────────────┐
│   选择      │ ←→ 地图、战斗
└─────────────┘
      ↓
┌─────────────┐
│ 胜利完成    │ ←→ 地图、入口界面
└─────────────┘
```

### 3.3 状态判断标准（基于图像识别）

**地图状态判断：**
- 检测到节点图案（hasNodes）→ +0.4 概率
- 黄色像素比例 > 0.05 → +0.3 概率

**战斗状态判断：**
- 检测到血条图案（healthBarPattern）→ +0.5 概率
- 红色像素比例 > 0.1 → +0.3 概率

**选择状态判断：**
- 检测到卡牌图案（cardPattern）→ +0.4 概率
- 检测到橙色标题（orangeTitle）→ +0.3 概率

**胜利完成判断：**
- 检测到粉色标题（pinkTitle）+ 黄色按钮（yellowButton）→ +0.6 概率

### 3.4 状态检测配置

```javascript
const STATE_DETECTION_CONFIG = {
    sampleCount: 800,      // 采样点数量
    minConfidence: 0.65,   // 最低置信度（65%）
    highConfidence: 0.85,   // 高置信度（85%）
    retry: {
        maxRetries: 3,     // 最大重试次数
        retryDelay: 500    // 重试延迟（毫秒）
    }
};
```

---

## 4. 当前已知的判断异常场景及具体表现

### 4.1 异常场景清单

| 序号 | 异常场景 | 具体表现 | 影响 |
|------|----------|----------|------|
| 1 | 节点颜色识别不准确 | 黄色和橙色相近导致误判 | 选择错误节点 |
| 2 | 黄线连接判断失败 | hasYellowLine() 检测失败 | 节点被标记为不可达 |
| 3 | 连续无节点误判 | 地图加载慢导致误判 | 提前结束探索 |
| 4 | 挑战按钮检测超时 | 按钮未出现即返回 | 无法进入战斗 |
| 5 | 胜利界面检测失败 | 粉色标题和黄色按钮未同时满足 | 无法点击确定 |
| 6 | 状态转换验证过严 | validStateTransition() 阻止合法转换 | 状态无法更新 |
| 7 | 难度DOM获取失败 | getDifficultyAndFloorFromDOM() 返回0 | 目标难度无法判断 |
| 8 | 选择类型误判 | hero/equipment 选择处理混淆 | 选择错误选项 |

### 4.2 异常处理机制

**地图分析失败：**
```javascript
if (!analysis) {
    log('地图分析失败，停止探索', 'error');
    break;
}
```

**连续无节点：**
```javascript
consecutiveNoNodes++;
if (consecutiveNoNodes >= 3) {
    log('连续多次没有可到达节点，遗迹探索完成', 'success');
    return;
}
```

**战斗超时：**
```javascript
const maxBattleTime = 600000; // 10分钟
if (battleTime >= maxBattleTime) {
    log('战斗时间超过最大限制，强制结束等待', 'warning');
    return false;
}
```

---

## 5. 逻辑判断与状态判断的关联关系分析

### 5.1 调用关系图

```
smartExploreRuins() [主循环]
    │
    ├── checkStopRequested() [停止检查]
    │
    ├── checkTargetDifficulty() [难度检查]
    │       └── getDifficultyAndFloorFromDOM()
    │
    ├── analyzeRuinsMap() [状态分析]
    │       ├── capturePage() [截图]
    │       ├── detectGameStateEnhanced() [增强检测]
    │       │       ├── analyzeAllFeatures() [特征分析]
    │       │       ├── calculateStateProbabilities() [概率计算]
    │       │       └── calculateConfidence() [置信度计算]
    │       │
    │       ├── detectMapNodes() [节点检测]
    │       │       ├── detectPlayerPosition() [玩家位置]
    │       │       └── findReachableNodes() [可达节点]
    │       │               └── hasYellowLine() [黄线检测]
    │       │
    │       └── detectDifficultyAndFloor() [难度检测]
    │
    ├── selectBestNode() [节点选择]
    │
    ├── clickAtPosition() [点击]
    │
    ├── clickChallengeButtonIfPresent() [挑战按钮]
    │       └── detectChallengeButton()
    │
    ├── handleBattle() [战斗处理]
    │
    ├── handleSelection() [选择处理]
    │       ├── detectSelectionType()
    │       ├── handleHeroSelection()
    │       └── handleEquipmentSelection()
    │
    └── handleVictoryComplete() [胜利处理]
            └── detectVictoryCompleteScreen()
```

### 5.2 停止机制关联

**停止请求传播链：**

```
用户点击"停止一键遗迹"
    ↓
ruinsStopRequested = true
    ↓
checkStopRequested() 返回 true
    ↓
阻止日志输出
    ↓
smartExploreRuins() 各处检查点中断执行
    ↓
handleRuinsControl() 恢复按钮状态
```

**日志屏蔽逻辑：**
```javascript
function log(message, type, skipStopCheck) {
    if (!skipStopCheck && ruinsStopRequested) {
        console.log(`[已停止-日志已屏蔽] ${message}`);
        return;
    }
    // 正常日志输出...
}
```

### 5.3 状态与处理函数映射

| 状态 | 处理函数 | 后续操作 |
|------|----------|----------|
| 地图 | 选择节点 → clickAtPosition() | clickChallengeButtonIfPresent() |
| 战斗 | handleBattle() | 轮询检测状态变化 |
| 选择 | handleSelection() | 自动选择第一项 |
| 胜利完成 | handleVictoryComplete() | 点击确定按钮 |
| 节点挑战 | clickChallengeButtonIfPresent() | 点击挑战按钮 |
| 未知 | sleep(2000) | 等待后重新检测 |

---

## 附录A：关键变量定义

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| isRuinsRunning | boolean | false | 是否正在运行一键遗迹 |
| ruinsStopRequested | boolean | false | 是否请求停止 |
| maxSteps | number | 50 | 最大探索步数 |
| maxConsecutiveNoNodes | number | 3 | 最大连续无节点次数 |
| consecutiveNoNodes | number | 0 | 当前连续无节点计数 |
| steps | number | 0 | 当前步数计数 |

## 附录B：超时配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 挑战按钮等待 | 1500ms | 节点点击后等待挑战按钮出现 |
| 战斗检测间隔 | 10000ms | 每10秒检测战斗状态 |
| 战斗最大时间 | 600000ms（10分钟） | 超时强制结束 |
| 装备选择检测间隔 | 30000ms | 每30秒检测装备选择 |
| 胜利界面等待 | 1500ms | 胜利后等待确定按钮出现 |
| 节点点击后等待 | 2000ms | 点击节点后等待 |
| 状态处理后等待 | 3000ms | 处理完成后等待 |

## 附录C：节点类型与颜色特征

| 节点类型 | 颜色名 | RGB范围 | type值 |
|----------|--------|---------|--------|
| 普通节点 | 黄色 | R>200, G>150, B<100 | normal |
| 精英节点 | 红色 | R>180, G<80, B<80 | elite |
| BOSS节点 | 紫色 | R>150, G<100, B>150 | boss |
| 事件节点 | 蓝色 | R<100, G<150, B>180 | event |
| 商店节点 | 绿色 | R<100, G>180, B<100 | shop |
