/**
 * 常量配置模块
 * 集中管理所有常量配置
 */

// 配置文件路径
const CONFIG_FILE_PATH = 'config.json';

// 本地存储键名
const STORAGE_KEY = 'game_coordinates_config';

// 状态检测配置
const STATE_DETECTION_CONFIG = {
    // 采样配置
    sampleCount: 800,
    minConfidence: 0.65,
    highConfidence: 0.85,

    // 颜色阈值配置（针对Canvas渲染优化）
    colors: {
        // 黄色（节点/黄线/按钮）
        yellow: {
            rMin: 190, rMax: 255,
            gMin: 160, gMax: 220,
            bMin: 0, bMax: 100
        },
        // 红色（血条/放弃按钮）
        red: {
            rMin: 180, rMax: 255,
            gMin: 0, gMax: 100,
            bMin: 0, bMax: 100
        },
        // 蓝色（事件节点/选择标题）
        blue: {
            rMin: 0, rMax: 100,
            gMin: 100, gMax: 180,
            bMin: 180, bMax: 255
        },
        // 绿色（开始按钮）
        green: {
            rMin: 0, rMax: 100,
            gMin: 150, gMax: 255,
            bMin: 0, bMax: 100
        },
        // 橙色（神器选择标题）
        orange: {
            rMin: 200, rMax: 255,
            gMin: 100, gMax: 180,
            bMin: 0, bMax: 80
        },
        // 粉色/紫色（胜利标题）
        pink: {
            rMin: 200, rMax: 255,
            gMin: 100, gMax: 180,
            bMin: 150, bMax: 220
        },
        // 深紫色（BOSS节点）
        purple: {
            rMin: 120, rMax: 200,
            gMin: 0, gMax: 100,
            bMin: 120, bMax: 200
        },
        // 白色（弹窗/文字）
        white: {
            rMin: 200, rMax: 255,
            gMin: 200, gMax: 255,
            bMin: 200, bMax: 255
        },
        // 深色（背景/阴影）
        dark: {
            rMin: 0, rMax: 60,
            gMin: 0, gMax: 60,
            bMin: 0, bMax: 60
        }
    },

    // 状态特征配置
    stateFeatures: {
        map: {
            name: '地图界面',
            keyIndicators: ['yellowNodes', 'playerPosition'],
            minYellowNodes: 2,
            expectedColors: ['yellow', 'purple', 'blue', 'green']
        },
        battle: {
            name: '战斗界面',
            keyIndicators: ['healthBar', 'redPixels'],
            minRedRatio: 0.05,
            expectedColors: ['red', 'yellow']
        },
        selection: {
            name: '选择界面',
            keyIndicators: ['selectionPattern', 'cardPattern'],
            minCardRatio: 0.15,
            expectedColors: ['white', 'dark', 'orange', 'pink']
        },
        victory: {
            name: '胜利界面',
            keyIndicators: ['victoryTitle', 'pinkColor'],
            minPinkRatio: 0.02,
            expectedColors: ['pink', 'yellow']
        },
        shop: {
            name: '商店界面',
            keyIndicators: ['shopPattern', 'whiteText'],
            minWhiteRatio: 0.20,
            expectedColors: ['white', 'dark']
        },
        event: {
            name: '事件界面',
            keyIndicators: ['eventPattern', 'blueTitle'],
            minBlueRatio: 0.03,
            expectedColors: ['blue', 'white']
        }
    },

    // 历史记录配置
    history: {
        maxSize: 5,
        minConsistency: 0.6
    }
};

// 游戏状态枚举
const GAME_STATES = {
    MAP: '地图界面',
    BATTLE: '战斗界面',
    SELECTION: '选择界面',
    VICTORY: '胜利界面',
    SHOP: '商店界面',
    EVENT: '事件界面',
    UNKNOWN: '未知'
};

// 节点选择优先级
const NODE_PRIORITY = {
    YELLOW: 3,
    BLUE: 2,
    GREEN: 1,
    PURPLE: 0
};

// 导出模块
module.exports = {
    CONFIG_FILE_PATH,
    STORAGE_KEY,
    STATE_DETECTION_CONFIG,
    GAME_STATES,
    NODE_PRIORITY
};
