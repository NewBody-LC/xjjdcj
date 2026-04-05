/**
 * 测试模块
 * 用于测试单个操作或工作流
 */

const AutomationRunner = require('./automation');
const ElementDiscoverer = require('./discover');
const chalk = require('chalk');

class TestRunner {
  constructor() {
    this.runner = new AutomationRunner();
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };
    console.log(colors[type](message));
  }

  async testClick(elementName) {
    console.log(chalk.blue('🧪 测试点击操作'));
    console.log(chalk.blue('=============='));
    console.log();
    
    try {
      await this.runner.init();
      await this.runner.launchBrowser();
      await this.runner.navigateToGame();
      
      // 截图点击前
      await this.runner.takeScreenshot('before-click');
      
      // 执行点击
      const result = await this.runner.clickElement(elementName);
      
      // 截图点击后
      await this.sleep(2000);
      await this.runner.takeScreenshot('after-click');
      
      if (result) {
        this.log(`✅ 测试通过: 成功点击 ${elementName}`, 'success');
      } else {
        this.log(`❌ 测试失败: 无法点击 ${elementName}`, 'error');
      }
      
    } catch (error) {
      this.log(`❌ 测试出错: ${error.message}`, 'error');
    } finally {
      await this.runner.closeBrowser();
    }
  }

  async testWorkflow(workflowName) {
    console.log(chalk.blue('🧪 测试工作流'));
    console.log(chalk.blue('============'));
    console.log();
    
    try {
      await this.runner.init();
      await this.runner.launchBrowser();
      await this.runner.navigateToGame();
      
      const result = await this.runner.executeWorkflow(workflowName);
      
      if (result) {
        this.log(`✅ 工作流测试通过: ${workflowName}`, 'success');
      } else {
        this.log(`❌ 工作流测试失败: ${workflowName}`, 'error');
      }
      
    } catch (error) {
      this.log(`❌ 测试出错: ${error.message}`, 'error');
    } finally {
      await this.runner.closeBrowser();
    }
  }

  async testDiscover() {
    console.log(chalk.blue('🧪 测试元素发现'));
    console.log(chalk.blue('==============='));
    console.log();
    
    const discoverer = new ElementDiscoverer();
    
    try {
      await discoverer.init();
      await discoverer.connectToGame();
      await discoverer.takeScreenshot('test-screenshot');
      
      this.log('✅ 元素发现测试通过', 'success');
      
    } catch (error) {
      this.log(`❌ 测试出错: ${error.message}`, 'error');
    } finally {
      await discoverer.closeBrowser();
    }
  }

  showHelp() {
    console.log(chalk.blue('🧪 测试工具'));
    console.log(chalk.blue('=========='));
    console.log();
    console.log('使用方式:');
    console.log();
    console.log(chalk.white('  npm run test -- click <元素名称>'));
    console.log(chalk.gray('    测试点击指定元素'));
    console.log(chalk.gray('    示例: npm run test -- click 冒险活动'));
    console.log();
    console.log(chalk.white('  npm run test -- workflow <工作流名称>'));
    console.log(chalk.gray('    测试指定工作流'));
    console.log(chalk.gray('    示例: npm run test -- workflow 每日任务'));
    console.log();
    console.log(chalk.white('  npm run test -- discover'));
    console.log(chalk.gray('    测试元素发现功能'));
    console.log();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      this.showHelp();
      return;
    }
    
    const command = args[0];
    
    switch (command) {
      case 'click':
        if (args[1]) {
          await this.testClick(args[1]);
        } else {
          this.log('❌ 请指定元素名称', 'error');
          this.showHelp();
        }
        break;
        
      case 'workflow':
        if (args[1]) {
          await this.testWorkflow(args[1]);
        } else {
          this.log('❌ 请指定工作流名称', 'error');
          this.showHelp();
        }
        break;
        
      case 'discover':
        await this.testDiscover();
        break;
        
      case 'help':
      default:
        this.showHelp();
        break;
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const testRunner = new TestRunner();
  testRunner.run().catch(console.error);
}

module.exports = TestRunner;
