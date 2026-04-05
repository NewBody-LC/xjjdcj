/**
 * 自动化执行模块
 * 使用缓存的坐标执行自动化操作
 * 这是方案 B 的第二阶段：使用 Playwright 直接点击（无 Token 消耗）
 */

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// 加载环境变量
require('dotenv').config();

class AutomationRunner {
  constructor() {
    this.config = {
      gameUrl: process.env.GAME_URL || 'https://www.wanyiwan.top/game/xjjdcj',
      width: parseInt(process.env.GAME_WIDTH) || 1920,
      height: parseInt(process.env.GAME_HEIGHT) || 1080,
      actionDelay: parseInt(process.env.ACTION_DELAY) || 1000,
      loadTimeout: parseInt(process.env.LOAD_TIMEOUT) || 30000,
      screenshotPath: process.env.SCREENSHOT_PATH || './screenshots'
    };
    
    this.elementsConfigPath = path.join(__dirname, '../config/elements.json');
    this.elements = null;
    this.browser = null;
    this.page = null;
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      step: chalk.cyan,
      action: chalk.magenta
    };
    console.log(colors[type](message));
  }

  async init() {
    console.log(chalk.blue('🤖 自动化执行模式'));
    console.log(chalk.blue('================'));
    console.log();
    
    await this.loadElementsConfig();
    
    // 检查是否有已识别的元素
    const detectedElements = Object.values(this.elements.elements).filter(
      el => el.coordinates !== null
    );
    
    if (detectedElements.length === 0) {
      this.log('❌ 尚未识别任何元素坐标', 'error');
      this.log('💡 请先运行: npm run discover', 'info');
      process.exit(1);
    }
    
    this.log(`✅ 已加载 ${detectedElements.length} 个已识别元素`, 'success');
    this.log('💡 此模式不消耗 AI Token，使用缓存的坐标直接操作', 'info');
    console.log();
  }

  async loadElementsConfig() {
    try {
      this.elements = await fs.readJson(this.elementsConfigPath);
    } catch (error) {
      this.log(`❌ 加载配置失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async launchBrowser() {
    this.log('🌐 启动浏览器...', 'step');
    
    try {
      this.browser = await puppeteer.launch({
        headless: false, // 显示浏览器窗口，便于观察
        defaultViewport: {
          width: this.config.width,
          height: this.config.height
        },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({
        width: this.config.width,
        height: this.config.height
      });
      
      this.log('✅ 浏览器已启动', 'success');
    } catch (error) {
      this.log(`❌ 启动浏览器失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async navigateToGame() {
    this.log(`🎮 导航到游戏页面...`, 'step');
    
    try {
      await this.page.goto(this.config.gameUrl, {
        waitUntil: 'networkidle2',
        timeout: this.config.loadTimeout
      });
      
      this.log('✅ 已加载游戏页面', 'success');
      
      // 等待游戏加载
      this.log('⏳ 等待游戏初始化...', 'step');
      await this.sleep(15000); // 等待 15 秒让游戏完全加载
      
    } catch (error) {
      this.log(`❌ 导航失败: ${error.message}`, 'error');
      throw error;
    }
  }

  async clickElement(elementName) {
    const element = this.elements.elements[elementName];
    
    if (!element) {
      this.log(`❌ 未找到元素配置: ${elementName}`, 'error');
      return false;
    }
    
    if (!element.coordinates) {
      this.log(`❌ 元素尚未识别坐标: ${elementName}`, 'error');
      return false;
    }
    
    const { x, y } = element.coordinates;
    
    this.log(`🖱️  点击: ${elementName} (${x}, ${y})`, 'action');
    
    try {
      // 移动鼠标到指定位置
      await this.page.mouse.move(x, y);
      await this.sleep(200);
      
      // 点击
      await this.page.mouse.click(x, y);
      
      this.log(`✅ 点击成功`, 'success');
      
      // 等待操作间隔
      await this.sleep(this.config.actionDelay);
      
      return true;
    } catch (error) {
      this.log(`❌ 点击失败: ${error.message}`, 'error');
      return false;
    }
  }

  async executeWorkflow(workflowName) {
    const workflow = this.elements.workflows[workflowName];
    
    if (!workflow) {
      this.log(`❌ 未找到工作流: ${workflowName}`, 'error');
      return false;
    }
    
    this.log(`🎯 执行工作流: ${workflow.name}`, 'step');
    this.log(`   ${workflow.description}`, 'info');
    console.log();
    
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      this.log(`步骤 ${i + 1}/${workflow.steps.length}: ${step.description}`, 'step');
      
      try {
        switch (step.action) {
          case 'click':
            await this.clickElement(step.target);
            break;
          case 'wait':
            this.log(`⏳ 等待 ${step.duration}ms`, 'info');
            await this.sleep(step.duration);
            break;
          case 'screenshot':
            await this.takeScreenshot(step.name || `step-${i + 1}`);
            break;
          default:
            this.log(`⚠️  未知操作: ${step.action}`, 'warning');
        }
      } catch (error) {
        this.log(`❌ 步骤执行失败: ${error.message}`, 'error');
        
        // 询问是否继续
        if (step.continueOnError) {
          this.log('⏭️  继续执行下一步', 'warning');
          continue;
        } else {
          return false;
        }
      }
      
      console.log();
    }
    
    this.log(`✅ 工作流完成: ${workflow.name}`, 'success');
    return true;
  }

  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(this.config.screenshotPath, filename);
    
    this.log(`📸 截图: ${filename}`, 'step');
    
    try {
      await this.page.screenshot({
        path: filepath,
        fullPage: false
      });
      
      this.log(`✅ 截图已保存: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      this.log(`❌ 截图失败: ${error.message}`, 'error');
      return null;
    }
  }

  async runAllWorkflows() {
    this.log('🚀 开始执行所有工作流...', 'step');
    console.log();
    
    const workflows = Object.keys(this.elements.workflows);
    
    for (const workflowName of workflows) {
      await this.executeWorkflow(workflowName);
      console.log();
      
      // 工作流之间等待
      await this.sleep(3000);
    }
    
    this.log('🎉 所有工作流执行完成！', 'success');
  }

  async closeBrowser() {
    this.log('🔒 关闭浏览器...', 'step');
    
    try {
      if (this.browser) {
        await this.browser.close();
        this.log('✅ 浏览器已关闭', 'success');
      }
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
      // 启动浏览器
      await this.launchBrowser();
      
      // 导航到游戏
      await this.navigateToGame();
      
      // 截图初始状态
      await this.takeScreenshot('initial');
      
      // 执行所有工作流
      await this.runAllWorkflows();
      
      // 截图最终状态
      await this.takeScreenshot('final');
      
      this.log('✨ 自动化执行完成！', 'success');
      
    } catch (error) {
      this.log(`❌ 执行出错: ${error.message}`, 'error');
      
      // 出错时截图
      await this.takeScreenshot('error');
    } finally {
      await this.closeBrowser();
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const runner = new AutomationRunner();
  runner.run().catch(console.error);
}

module.exports = AutomationRunner;
