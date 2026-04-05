/**
 * 元素发现模块
 * 使用 Midscene 识别游戏界面元素并记录坐标
 * 这是方案 B 的第一阶段：使用 Midscene 进行视觉识别
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// 加载环境变量
require('dotenv').config();

class ElementDiscoverer {
  constructor() {
    this.config = {
      gameUrl: process.env.GAME_URL || 'https://www.wanyiwan.top/game/xjjdcj',
      screenshotPath: process.env.SCREENSHOT_PATH || './screenshots'
    };
    
    this.elementsConfigPath = path.join(__dirname, '../config/elements.json');
    this.elements = null;
    this.discoveredElements = {};
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      step: chalk.cyan
    };
    console.log(colors[type](message));
  }

  async init() {
    console.log(chalk.blue('🔍 元素发现模式'));
    console.log(chalk.blue('=============='));
    console.log();
    
    await this.loadElementsConfig();
    
    this.log('⚠️  此模式将消耗 AI Token 用于视觉识别', 'warning');
    this.log('💡 识别完成后，坐标将被缓存供后续使用', 'info');
    console.log();
  }

  async loadElementsConfig() {
    try {
      this.elements = await fs.readJson(this.elementsConfigPath);
      this.log(`✅ 已加载 ${Object.keys(this.elements.elements).length} 个待识别元素`, 'success');
    } catch (error) {
      this.log(`❌ 加载配置失败: ${error.message}`, 'error');
      process.exit(1);
    }
    console.log();
  }

  async saveElementsConfig() {
    try {
      this.elements.lastUpdated = new Date().toISOString();
      await fs.writeJson(this.elementsConfigPath, this.elements, { spaces: 2 });
      this.log('✅ 元素配置已保存', 'success');
    } catch (error) {
      this.log(`❌ 保存配置失败: ${error.message}`, 'error');
    }
  }

  executeMidsceneCommand(command) {
    try {
      this.log(`执行: ${command}`, 'step');
      const result = execSync(command, { 
        encoding: 'utf-8',
        timeout: 120000, // 2分钟超时
        stdio: 'pipe'
      });
      return result;
    } catch (error) {
      this.log(`❌ 命令执行失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async connectToGame() {
    this.log('🌐 连接到游戏页面...', 'step');
    
    try {
      this.executeMidsceneCommand(
        `npx @midscene/web@1 connect --url ${this.config.gameUrl}`
      );
      this.log('✅ 已连接到游戏页面', 'success');
      
      // 等待游戏加载
      this.log('⏳ 等待游戏加载完成（约 10 秒）...', 'step');
      await this.sleep(10000);
      
    } catch (error) {
      this.log('❌ 连接失败', 'error');
      throw error;
    }
  }

  async takeScreenshot(name) {
    this.log(`📸 截图: ${name}`, 'step');
    
    try {
      const result = this.executeMidsceneCommand(
        'npx @midscene/web@1 take_screenshot'
      );
      
      // 从输出中提取截图路径
      const screenshotPath = this.extractScreenshotPath(result);
      if (screenshotPath) {
        this.log(`✅ 截图已保存: ${screenshotPath}`, 'success');
        return screenshotPath;
      }
      
      return null;
    } catch (error) {
      this.log(`❌ 截图失败: ${error.message}`, 'error');
      return null;
    }
  }

  extractScreenshotPath(output) {
    // 尝试从输出中提取截图路径
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('.png') || line.includes('.jpg')) {
        return line.trim();
      }
    }
    return null;
  }

  async discoverElement(elementKey, elementConfig) {
    this.log(`🔍 识别元素: ${elementConfig.name}`, 'step');
    this.log(`   描述: ${elementConfig.description}`, 'info');
    
    try {
      // 使用 Midscene 的 act 命令来识别元素位置
      const prompt = `找到"${elementConfig.name}"按钮的位置，并告诉我它的坐标（x, y）`;
      
      this.log(`   发送 AI 识别请求...`, 'info');
      
      const result = this.executeMidsceneCommand(
        `npx @midscene/web@1 act --prompt "${prompt}"`
      );
      
      // 解析结果，提取坐标
      const coordinates = this.parseCoordinates(result);
      
      if (coordinates) {
        this.discoveredElements[elementKey] = {
          ...elementConfig,
          coordinates: coordinates,
          confidence: 0.9,
          lastDetected: new Date().toISOString()
        };
        
        this.log(`   ✅ 识别成功: (${coordinates.x}, ${coordinates.y})`, 'success');
        return true;
      } else {
        this.log(`   ⚠️  未能识别坐标`, 'warning');
        return false;
      }
      
    } catch (error) {
      this.log(`   ❌ 识别失败: ${error.message}`, 'error');
      return false;
    }
  }

  parseCoordinates(output) {
    // 尝试从输出中解析坐标
    // 格式可能是: "坐标: (1200, 600)" 或 "x: 1200, y: 600"
    const patterns = [
      /\((\d+)[,\s]+(\d+)\)/,  // (1200, 600)
      /x[:\s]+(\d+)[,\s]+y[:\s]+(\d+)/i,  // x: 1200, y: 600
      /坐标[:\s]+(\d+)[,\s]+(\d+)/  // 坐标: 1200, 600
    ];
    
    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        return {
          x: parseInt(match[1]),
          y: parseInt(match[2])
        };
      }
    }
    
    return null;
  }

  async discoverAllElements() {
    this.log('🎯 开始识别所有元素...', 'step');
    console.log();
    
    const elements = this.elements.elements;
    const total = Object.keys(elements).length;
    let success = 0;
    let failed = 0;
    
    for (const [key, config] of Object.entries(elements)) {
      const discovered = await this.discoverElement(key, config);
      
      if (discovered) {
        success++;
      } else {
        failed++;
      }
      
      // 每次识别后等待一下
      await this.sleep(2000);
      console.log();
    }
    
    this.log(`📊 识别完成: ${success}/${total} 成功, ${failed}/${total} 失败`, 'info');
  }

  async verifyElements() {
    this.log('✅ 验证识别的元素...', 'step');
    
    for (const [key, element] of Object.entries(this.discoveredElements)) {
      if (element.coordinates) {
        this.log(`   ${element.name}: (${element.coordinates.x}, ${element.coordinates.y})`, 'info');
      }
    }
    
    console.log();
  }

  async closeBrowser() {
    this.log('🔒 关闭浏览器...', 'step');
    
    try {
      this.executeMidsceneCommand('npx @midscene/web@1 close');
      this.log('✅ 浏览器已关闭', 'success');
    } catch (error) {
      this.log(`⚠️  关闭浏览器时出错: ${error.message}`, 'warning');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    await this.init();
    
    try {
      // 连接到游戏
      await this.connectToGame();
      
      // 截图当前状态
      await this.takeScreenshot('initial');
      
      // 识别所有元素
      await this.discoverAllElements();
      
      // 验证结果
      await this.verifyElements();
      
      // 更新配置
      this.elements.elements = { ...this.elements.elements, ...this.discoveredElements };
      await this.saveElementsConfig();
      
      this.log('🎉 元素发现完成！', 'success');
      this.log('💡 现在可以使用 "npm run run" 执行自动化了', 'info');
      
    } catch (error) {
      this.log(`❌ 发现过程出错: ${error.message}`, 'error');
    } finally {
      await this.closeBrowser();
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const discoverer = new ElementDiscoverer();
  discoverer.run().catch(console.error);
}

module.exports = ElementDiscoverer;
