# 一键遗迹功能技术文档

## Why
当前"一键遗迹"功能的实现缺乏系统性的技术文档，导致逻辑判断条件分散、状态定义不清晰、异常场景处理机制不明确。需要通过全面的代码分析，形成结构清晰、内容详实的技术文档，为后续功能优化和问题排查提供明确的技术参考依据。

## What Changes
本文档是对现有"一键遗迹"功能的全面梳理和分析，包括：
- 功能整体架构与核心流程说明
- 各关键节点的逻辑判断条件及分支处理机制
- 所有可能的状态定义、状态转换规则及判断标准
- 当前已知的判断异常场景及具体表现
- 逻辑判断与状态判断的关联关系分析

## Impact
- Affected specs: 状态检测系统优化、功能区域折叠优化、遗迹操作停止功能修复
- Affected code: index_with_webview.html（主要实现）、main.js（IPC通信）

## ADDED Requirements

### Requirement: 功能架构说明
系统 SHALL 提供一键遗迹功能的完整架构说明，包括入口函数、控制流程、核心算法模块。

#### Scenario: 整体架构
- **WHEN** 用户点击"开始一键遗迹"按钮
- **THEN** 系统执行handleRuinsControl()函数，启动smartExploreRuins()核心探索流程

### Requirement: 状态定义
系统 SHALL 定义以下状态：
- 地图状态(Map): 可探索状态，显示可点击的节点
- 战斗状态(Battle): 战斗进行中
- 选择状态(Selection): 装备/角色选择界面
- 胜利完成状态(VictoryComplete): 战斗胜利弹窗

#### Scenario: 状态检测
- **WHEN** analyzeRuinsMap()函数执行
- **THEN** 返回当前状态currentState及可达节点数组reachableNodes

### Requirement: 分支处理机制
系统 SHALL 根据当前状态执行对应的处理逻辑。

#### Scenario: 地图状态处理
- **WHEN** currentState === '地图' 且reachableNodes.length > 0
- **THEN** selectBestNode()选择最佳节点并clickAtPosition()

#### Scenario: 战斗状态处理
- **WHEN** currentState === '战斗'
- **THEN** handleBattle()执行战斗轮询检测

### Requirement: 停止机制
系统 SHALL 提供用户请求停止的检测机制。

#### Scenario: 停止检测
- **WHEN** 用户点击"停止一键遗迹"按钮
- **THEN** ruinsStopRequested标志置为true，checkStopRequested()返回true

## MODIFIED Requirements

### Requirement: 节点选择优先级
节点选择优先级从高到低：
1. shop (绿色商店) - 优先级5
2. event (蓝色随机事件) - 优先级4
3. normal (黄色普通战斗) - 优先级3
4. elite (红色精英战斗) - 优先级2
5. boss (紫色BOSS战) - 优先级1

### Requirement: 最大步数限制
- 最大探索步数: 50步
- 连续无节点检测次数上限: 3次

## REMOVED Requirements
无

## 附录：关键变量定义

| 变量名 | 类型 | 说明 |
|--------|------|------|
| isRuinsRunning | boolean | 是否正在运行一键遗迹 |
| ruinsStopRequested | boolean | 是否请求停止 |
| maxSteps | number | 最大探索步数(50) |
| maxConsecutiveNoNodes | number | 最大连续无节点次数(3) |
| consecutiveNoNodes | number | 当前连续无节点计数 |
