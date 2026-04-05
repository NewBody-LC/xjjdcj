/**
 * 小鸡舰队出击自动化 - 主入口
 * Midscene + Playwright 混合方案
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// 加载环境变量
require('dotenv').config();

class XjjdcjAutomation {
  constructor() {
    this.config = {
      gameUrl: process.env.GAME_URL || 'https://www.wanyiwan.top/game/xjjdcj',
      width: parseInt(process.env.GAME_WIDTH) || 1920,
      height: parseInt(process.env.GAME_HEIGHT) || 1080,
      actionDelay: parseInt(process.env.ACTION_DELAY) || 1000,
      loadTimeout: parseInt(process.env.LOAD_TIMEOUT) || 30000,
      screenshotPath: process.env.SCREENSHOT_PATH || './screenshots',
      logLevel: process.env.LOG_LEVEL || 'info'
    };
    
    this.elementsConfigPath = path.join(__dirname, '../config/elements.json');
    this.elements = null;
  }

  log(level, message) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] >= levels[this.config.logLevel]) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    }
  }

  async init() {
    console.log(chalk.blue('🎮 小鸡舰队出击自动化系统'));
    console.log(chalk.blue('========================'));
    console.log();
    
    // 检查环境配置
    this.checkEnvironment();
    
    // 加载元素配置
    await this.loadElementsConfig();
    
    console.log(chalk.green('✅ 初始化完成'));
    console.log();
  }

  checkEnvironment() {
    console.log(chalk.yellow('🔍 检查环境配置...'));
    
    const requiredEnvVars = [
      'MIDSCENE_MODEL_API_KEY',
      'MIDSCENE_MODEL_NAME',
      'MIDSCENE_MODEL_BASE_URL',
      'MIDSCENE_MODEL_FAMILY'
    ];
    
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.log(chalk.red('❌ 缺少必要的环境变量:'));
      missing.forEach(varName => console.log(chalk.red(`   - ${varName}`)));
      console.log();
      console.log(chalk.yellow('💡 请按照以下步骤配置:'));
      console.log(chalk.yellow('   1. 复制 .env.example 为 .env'));
      console.log(chalk.yellow('   2. 填入你的 AI 模型 API Key'));
      console.log(chalk.yellow('   3. 重新运行程序'));
      process.exit(1);
    }
    
    console.log(chalk.green('✅ 环境配置检查通过'));
    console.log();
  }

  async loadElementsConfig() {
    console.log(chalk.yellow('📂 加载元素配置...'));
    
    try {
      this.elements = await fs.readJson(this.elementsConfigPath);
      console.log(chalk.green(`✅ 已加载 ${Object.keys(this.elements.elements).length} 个元素配置`));
      
      // 统计已识别的元素
      const detectedElements = Object.values(this.elements.elements).filter(
        el => el.coordinates !== null
      );
      
      if (detectedElements.length > 0) {
        console.log(chalk.green(`✅ 其中 ${detectedElements.length} 个元素已识别坐标`));
      } else {
        console.log(chalk.yellow('⚠️  尚未识别任何元素坐标，请先运行元素发现'));
      }
    } catch (error) {
      console.log(chalk.red('❌ 加载元素配置失败:'), error.message);
      process.exit(1);
    }
    console.log();
  }

  showMenu() {
    console.log(chalk.cyan('📋 可用命令:'));
    console.log();
    console.log(chalk.white('  1. 元素发现 (discover)'));
    console.log(chalk.gray('     使用 Midscene 识别游戏界面元素并记录坐标'));
    console.log();
    console.log(chalk.white('  2. 运行自动化 (run)'));
    console.log(chalk.gray('     执行预设的自动化流程'));
    console.log();
    console.log(chalk.white('  3. 测试模式 (test)'));
    console.log(chalk.gray('     测试单个操作'));
    console.log();
    console.log(chalk.white('  4. 查看配置 (config)'));
    console.log(chalk.gray('     显示当前配置信息'));
    console.log();
    console.log(chalk.white('  0. 退出'));
    console.log();
  }

  showConfig() {
    console.log(chalk.cyan('⚙️  当前配置:'));
    console.log();
    console.log(chalk.white('游戏配置:'));
    console.log(chalk.gray(`  URL: ${this.config.gameUrl}`));
    console.log(chalk.gray(`  分辨率: ${this.config.width}x${this.config.height}`));
    console.log();
    console.log(chalk.white('AI 模型配置:'));
    console.log(chalk.gray(`  模型: ${process.env.MIDSCENE_MODEL_NAME}`));
    console.log(chalk.gray(`  提供商: ${process.env.MIDSCENE_MODEL_FAMILY}`));
    console.log();
    console.log(chalk.white('自动化配置:'));
    console.log(chalk.gray(`  操作间隔: ${this.config.actionDelay}ms`));
    console.log(chalk.gray(`  加载超时: ${this.config.loadTimeout}ms`));
    console.log();
  }

  async run() {
    await this.init();
    this.showMenu();
    this.showConfig();
    
    console.log(chalk.green('🚀 准备就绪！'));
    console.log();
    console.log(chalk.yellow('使用方式:'));
    console.log(chalk.white('  npm run discover  - 识别游戏元素'));
    console.log(chalk.white('  npm run run       - 执行自动化'));
    console.log(chalk.white('  npm run test      - 测试模式'));
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const automation = new XjjdcjAutomation();
  automation.run().catch(console.error);
}

module.exports = XjjdcjAutomation;
