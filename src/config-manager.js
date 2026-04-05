/**
 * 配置管理模块
 * 管理应用配置的加载、保存和访问
 */

const fs = require('fs');
const path = require('path');
const { app } = require('@electron/remote');
const { CONFIG_FILE_PATH, STORAGE_KEY } = require('./constants');
const logger = require('./logger');

class ConfigManager {
    constructor() {
        this.appConfig = null;
        this.ruinsConfig = null;
        this.configFilePath = CONFIG_FILE_PATH;
    }

    /**
     * 获取exe所在目录
     * @returns {string} exe目录路径
     */
    getExeDir() {
        return path.dirname(app.getPath('exe'));
    }

    /**
     * 获取外部配置文件路径
     * @returns {string} 外部配置文件路径
     */
    getExternalConfigPath() {
        return path.join(this.getExeDir(), this.configFilePath);
    }

    /**
     * 获取内部配置文件路径
     * @returns {string} 内部配置文件路径
     */
    getInternalConfigPath() {
        return path.join(__dirname, '..', this.configFilePath);
    }

    /**
     * 加载配置文件
     * 优先从exe同级目录读取，如果不存在则从app.asar内读取
     * @returns {Promise<boolean>} 是否成功加载
     */
    async loadConfig() {
        try {
            const externalConfigPath = this.getExternalConfigPath();
            const internalConfigPath = this.getInternalConfigPath();

            let configPath = null;
            let isExternal = false;

            // 优先检查exe同级目录是否有配置文件
            if (fs.existsSync(externalConfigPath)) {
                configPath = externalConfigPath;
                isExternal = true;
                logger.info('检测到外部配置文件: ' + externalConfigPath);
            } else if (fs.existsSync(internalConfigPath)) {
                // exe同级目录没有，使用app.asar内的默认配置
                configPath = internalConfigPath;
                logger.info('使用内置默认配置');
            }

            if (configPath) {
                // 读取配置文件
                const configData = fs.readFileSync(configPath, 'utf8');
                this.appConfig = JSON.parse(configData);

                // 提取遗迹配置
                if (this.appConfig && this.appConfig.ruins) {
                    this.ruinsConfig = this.appConfig.ruins;
                    if (isExternal) {
                        logger.success('成功从外部配置文件加载配置');
                    } else {
                        logger.success('成功从内置配置加载');
                    }
                    return true;
                } else {
                    // 配置文件中缺少遗迹配置
                    logger.error('配置文件格式不正确，缺少 ruins 配置');
                    this.showConfigErrorDialog('配置文件格式不正确，缺少 ruins 配置');
                    this.ruinsConfig = null;
                    return false;
                }
            } else {
                // 配置文件不存在，弹出提示
                this.showConfigMissingDialog(externalConfigPath);
                return false;
            }
        } catch (error) {
            logger.error('加载配置文件失败: ' + error.message);
            console.error('加载配置文件失败:', error);
            return false;
        }
    }

    /**
     * 保存配置文件
     * @param {Object} config - 配置对象
     * @param {string} targetPath - 目标路径（可选）
     * @returns {Promise<boolean>} 是否成功保存
     */
    async saveConfig(config, targetPath = null) {
        try {
            const configPath = targetPath || this.getExternalConfigPath();
            const configData = JSON.stringify(config, null, 4);
            fs.writeFileSync(configPath, configData, 'utf8');
            logger.success('配置文件已保存到: ' + configPath);
            return true;
        } catch (error) {
            logger.error('保存配置文件失败: ' + error.message);
            console.error('保存配置文件失败:', error);
            return false;
        }
    }

    /**
     * 创建默认配置文件
     * @param {string} targetPath - 目标路径（可选）
     * @returns {Promise<boolean>} 是否成功创建
     */
    async createDefaultConfig(targetPath = null) {
        try {
            const defaultConfig = {
                ruins: {
                    adventure: { xPercent: 70, yPercent: 70 },
                    ancientRuins: { xPercent: 75, yPercent: 50 },
                    goToRuins: { xPercent: 50, yPercent: 75 },
                    startChallenge: { xPercent: 75, yPercent: 75 },
                    nodeChallenge: { xPercent: 80, yPercent: 70 },
                    victoryConfirm: { xPercent: 50, yPercent: 75 },
                    heroArcher: { xPercent: 20, yPercent: 70 },
                    heroAssassin: { xPercent: 40, yPercent: 70 },
                    heroMage: { xPercent: 50, yPercent: 70 },
                    heroPriest: { xPercent: 60, yPercent: 70 },
                    heroWarrior: { xPercent: 80, yPercent: 70 },
                    weeklyGift: { xPercent: 85, yPercent: 15 },
                    benefitClaim: { xPercent: 85, yPercent: 35 }
                },
                timings: {
                    pageLoadDelay: 2000,
                    animationDelay: 1000,
                    battleTimeout: 300000,
                    selectionTimeout: 30000
                }
            };

            const configPath = targetPath || this.getExternalConfigPath();
            await this.saveConfig(defaultConfig, configPath);
            
            // 更新当前配置
            this.appConfig = defaultConfig;
            this.ruinsConfig = defaultConfig.ruins;
            
            logger.success('已创建默认配置文件');
            return true;
        } catch (error) {
            logger.error('创建默认配置文件失败: ' + error.message);
            console.error('创建默认配置文件失败:', error);
            return false;
        }
    }

    /**
     * 获取应用配置
     * @returns {Object|null} 应用配置
     */
    getAppConfig() {
        return this.appConfig;
    }

    /**
     * 获取遗迹配置
     * @returns {Object|null} 遗迹配置
     */
    getRuinsConfig() {
        return this.ruinsConfig;
    }

    /**
     * 更新遗迹配置
     * @param {Object} config - 新的遗迹配置
     */
    updateRuinsConfig(config) {
        this.ruinsConfig = { ...this.ruinsConfig, ...config };
        if (this.appConfig) {
            this.appConfig.ruins = this.ruinsConfig;
        }
    }

    /**
     * 从本地存储加载坐标配置
     */
    loadCoordinatesFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const coords = JSON.parse(stored);
                // 更新输入框的值
                Object.keys(coords).forEach(key => {
                    const input = document.getElementById(key);
                    if (input && coords[key] !== undefined) {
                        input.value = coords[key];
                    }
                });
                logger.info('已从本地存储加载坐标配置');
            }
        } catch (error) {
            console.error('从本地存储加载坐标配置失败:', error);
        }
    }

    /**
     * 保存坐标配置到本地存储
     */
    saveCoordinatesToStorage() {
        try {
            const coordIds = [
                'adventure-x', 'adventure-y',
                'ruins-x', 'ruins-y',
                'goto-x', 'goto-y',
                'start-challenge-x', 'start-challenge-y',
                'node-challenge-x', 'node-challenge-y',
                'victory-confirm-x', 'victory-confirm-y',
                'hero-archer-x', 'hero-archer-y',
                'hero-assassin-x', 'hero-assassin-y',
                'hero-mage-x', 'hero-mage-y',
                'hero-priest-x', 'hero-priest-y',
                'hero-warrior-x', 'hero-warrior-y',
                'weekly-gift-x', 'weekly-gift-y',
                'benefit-claim-x', 'benefit-claim-y'
            ];

            const coords = {};
            coordIds.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    coords[id] = parseInt(input.value) || 0;
                }
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
            logger.success('坐标配置已保存到本地存储');
            return true;
        } catch (error) {
            logger.error('保存坐标配置失败: ' + error.message);
            console.error('保存坐标配置失败:', error);
            return false;
        }
    }

    /**
     * 显示配置文件缺失对话框
     * @param {string} configPath - 配置文件路径
     */
    showConfigMissingDialog(configPath) {
        const { dialog } = require('@electron/remote');
        const result = dialog.showMessageBoxSync({
            type: 'warning',
            title: '配置文件缺失',
            message: '未找到配置文件',
            detail: `将在以下位置创建默认配置文件:\n${configPath}`,
            buttons: ['创建默认配置', '退出'],
            defaultId: 0
        });

        if (result === 0) {
            this.createDefaultConfig(configPath);
        }
    }

    /**
     * 显示配置文件错误对话框
     * @param {string} errorMessage - 错误消息
     */
    showConfigErrorDialog(errorMessage) {
        const { dialog } = require('@electron/remote');
        dialog.showMessageBoxSync({
            type: 'error',
            title: '配置文件错误',
            message: '配置文件格式不正确',
            detail: errorMessage,
            buttons: ['确定']
        });
    }
}

// 创建单例实例
const configManager = new ConfigManager();

module.exports = configManager;
