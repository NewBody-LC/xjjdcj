const { app, BrowserWindow, session, Menu, ipcMain } = require('electron');
const path = require('path');

// 初始化 @electron/remote
require('@electron/remote/main').initialize();

// 禁用证书验证
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-insecure-localhost');
app.commandLine.appendSwitch('disable-web-security');

/**
 * 创建中文菜单
 */
function createMenu() {
  // 中文菜单模板
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建窗口',
          accelerator: 'CmdOrCtrl+N',
          click() {
            createWindow();
          }
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '重做',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: '删除',
          accelerator: 'Delete',
          role: 'delete'
        },
        {
          type: 'separator'
        },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload();
          }
        },
        {
          type: 'separator'
        },
        {
          label: '开发者工具',
          accelerator: 'CmdOrCtrl+Shift+I',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          }
        },
        {
          type: 'separator'
        },
        {
          label: '全屏',
          accelerator: 'F11',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        {
          type: 'separator'
        },
        {
          label: '前置所有窗口',
          role: 'front'
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click() {
            console.log('关于应用');
          }
        }
      ]
    }
  ];

  // 构建菜单
  const menu = Menu.buildFromTemplate(template);
  // 设置为应用菜单
  Menu.setApplicationMenu(menu);
}




/**
 * 创建浏览器窗口
 * 配置窗口大小、webPreferences等参数
 */
function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      enableRemoteModule: true,
      webviewTag: true,
      // 设置Chrome浏览器的用户代理字符串，避免兼容性提示
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  
  // 启用 @electron/remote 模块
  require('@electron/remote/main').enable(mainWindow.webContents);

  // 加载包含webview标签和右侧功能区的HTML文件
  mainWindow.loadFile('index_with_webview.html');
  
  // 或者使用简单的webview测试文件
  // mainWindow.loadFile('test_webview.html');
  
  // 或者使用简单的iframe
  // mainWindow.loadFile('test.html');
  
  // 或者直接加载目标网页
  // mainWindow.loadURL('https://www.wanyiwan.top/game/xjjdcj');
  
  // 或者使用包含iframe的右侧功能区HTML文件
  // mainWindow.loadFile('index.html');

  // 打开开发者工具（可选，开发时可取消注释）
  // mainWindow.webContents.openDevTools();
}

// 应用就绪时创建窗口
app.whenReady().then(() => {
  // 拦截和修改响应头，移除阻止iframe加载的安全头
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // 移除X-Frame-Options和Content-Security-Policy头
    const headers = { ...details.responseHeaders };
    delete headers['x-frame-options'];
    delete headers['content-security-policy'];
    delete headers['X-Frame-Options'];
    delete headers['Content-Security-Policy'];
    
    callback({ responseHeaders: headers });
  });

  createWindow();
  
  // 创建中文菜单
  createMenu();
  
  // 注册IPC处理程序：模拟鼠标点击
  ipcMain.handle('simulate-mouse-click', async (event, webviewId, x, y) => {
    try {
      // 获取所有窗口
      const windows = BrowserWindow.getAllWindows();
      if (windows.length === 0) {
        return { success: false, error: 'No available window' };
      }
      
      const mainWindow = windows[0];
      
      // 获取所有 webview 的 webContents
      const webContents = require('electron').webContents;
      const allWebContents = webContents.getAllWebContents();
      
      // 查找 webview 的 webContents（通常是最后一个，或者是 hostWebContents 为 mainWindow 的）
      let webviewWebContents = null;
      for (const wc of allWebContents) {
        // 检查是否是 webview（通过 hostWebContents 判断）
        if (wc.hostWebContents && wc.hostWebContents.id === mainWindow.webContents.id) {
          webviewWebContents = wc;
          break;
        }
      }
      
      if (!webviewWebContents) {
        return { success: false, error: 'Webview not found' };
      }
      
      console.log('Simulating mouse click at:', x, y);
      
      // 发送鼠标事件到 webview
      webviewWebContents.sendInputEvent({
        type: 'mouseDown',
        x: x,
        y: y,
        button: 'left',
        clickCount: 1
      });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      webviewWebContents.sendInputEvent({
        type: 'mouseUp',
        x: x,
        y: y,
        button: 'left',
        clickCount: 1
      });
      
      return { success: true };
    } catch (error) {
      console.error('Mouse click simulation failed:', error);
      return { success: false, error: error.message };
    }
  });

  // 注册IPC处理程序：模拟鼠标拖拽（用于滑动操作）
  ipcMain.handle('simulate-mouse-drag', async (event, webviewId, startX, startY, endX, endY) => {
    try {
      // 获取所有窗口
      const windows = BrowserWindow.getAllWindows();
      if (windows.length === 0) {
        return { success: false, error: 'No available window' };
      }
      
      const mainWindow = windows[0];
      
      // 获取所有 webview 的 webContents
      const webContents = require('electron').webContents;
      const allWebContents = webContents.getAllWebContents();
      
      // 查找 webview 的 webContents
      let webviewWebContents = null;
      for (const wc of allWebContents) {
        if (wc.hostWebContents && wc.hostWebContents.id === mainWindow.webContents.id) {
          webviewWebContents = wc;
          break;
        }
      }
      
      if (!webviewWebContents) {
        return { success: false, error: 'Webview not found' };
      }
      
      console.log('Simulating mouse drag from:', startX, startY, 'to:', endX, endY);
      
      // 步骤1: 鼠标移动到起始位置
      webviewWebContents.sendInputEvent({
        type: 'mouseMove',
        x: startX,
        y: startY
      });
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // 步骤2: 鼠标按下
      webviewWebContents.sendInputEvent({
        type: 'mouseDown',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
      });
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // 步骤3: 模拟拖拽过程（分多步移动，更真实）
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        const currentX = Math.round(startX + (endX - startX) * progress);
        const currentY = Math.round(startY + (endY - startY) * progress);
        
        webviewWebContents.sendInputEvent({
          type: 'mouseMove',
          x: currentX,
          y: currentY
        });
        
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      // 步骤4: 鼠标释放
      webviewWebContents.sendInputEvent({
        type: 'mouseUp',
        x: endX,
        y: endY,
        button: 'left',
        clickCount: 1
      });
      
      console.log('Mouse drag simulation completed');
      return { success: true };
    } catch (error) {
      console.error('Mouse drag simulation failed:', error);
      return { success: false, error: error.message };
    }
  });

  // macOS特殊处理：点击dock图标时重新创建窗口
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ==================== 周礼包功能 ====================

// 存储周礼包窗口引用
let weeklyGiftWindow = null;

/**
 * 创建周礼包领取窗口
 * @param {string} url - 礼包领取页面URL
 * @param {BrowserWindow} parentWindow - 父窗口
 */
function createWeeklyGiftWindow(url, parentWindow) {
  // 如果已存在窗口，先关闭
  if (weeklyGiftWindow && !weeklyGiftWindow.isDestroyed()) {
    weeklyGiftWindow.close();
  }

  // 创建周礼包窗口
  weeklyGiftWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: parentWindow,
    modal: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    show: false,
    title: '周礼包领取'
  });

  // 加载礼包页面
  weeklyGiftWindow.loadURL(url);

  // 页面加载完成后显示
  weeklyGiftWindow.once('ready-to-show', () => {
    weeklyGiftWindow.show();
    weeklyGiftWindow.focus();
  });

  // 窗口关闭时清理引用
  weeklyGiftWindow.on('closed', () => {
    weeklyGiftWindow = null;
    // 通知父窗口
    if (parentWindow && !parentWindow.isDestroyed()) {
      parentWindow.webContents.send('weekly-gift-window-closed');
    }
  });

  return weeklyGiftWindow.id;
}

// 注册IPC处理程序：创建周礼包窗口
ipcMain.handle('create-weekly-gift-window', async (event, url) => {
  try {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    if (!parentWindow) {
      return { success: false, error: 'Parent window not found' };
    }

    const windowId = createWeeklyGiftWindow(url, parentWindow);
    console.log('Created weekly gift window:', windowId);
    return { success: true, windowId };
  } catch (error) {
    console.error('Failed to create weekly gift window:', error);
    return { success: false, error: error.message };
  }
});

// 注册IPC处理程序：关闭周礼包窗口
ipcMain.handle('close-weekly-gift-window', async () => {
  try {
    if (weeklyGiftWindow && !weeklyGiftWindow.isDestroyed()) {
      weeklyGiftWindow.close();
      weeklyGiftWindow = null;
      console.log('Weekly gift window closed');
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to close weekly gift window:', error);
    return { success: false, error: error.message };
  }
});

// 注册IPC处理程序：在周礼包窗口中执行脚本
ipcMain.handle('execute-in-weekly-gift-window', async (event, script) => {
  try {
    if (!weeklyGiftWindow || weeklyGiftWindow.isDestroyed()) {
      return { success: false, error: 'Weekly gift window not available' };
    }

    const result = await weeklyGiftWindow.webContents.executeJavaScript(script);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to execute script in weekly gift window:', error);
    return { success: false, error: error.message };
  }
});

// ==================== 调试模式窗口 ====================

// 存储调试窗口引用
let debugWindow = null;

/**
 * 创建调试窗口（直接加载游戏页面，便于使用开发者工具）
 * @param {string} url - 游戏页面URL
 */
function createDebugWindow(url) {
  // 如果已存在窗口，先关闭
  if (debugWindow && !debugWindow.isDestroyed()) {
    debugWindow.close();
  }

  // 创建调试窗口
  debugWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      enableRemoteModule: true,
      // 设置Chrome浏览器的用户代理字符串
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    show: false,
    title: '调试模式 - 小鸡舰队出击',
    // 不置顶，允许被其他窗口覆盖
    alwaysOnTop: false,
    // 作为普通窗口，不参与焦点 steal
    skipTaskbar: false
  });

  // 加载游戏页面
  debugWindow.loadURL(url);

  // 页面加载完成后显示并打开开发者工具
  debugWindow.once('ready-to-show', () => {
    debugWindow.show();
    // 移除 focus() 调用，避免窗口抢夺焦点遮挡右键菜单
    // debugWindow.focus();
    // 自动打开开发者工具
    debugWindow.webContents.openDevTools();
  });

  // 窗口关闭时清理引用
  debugWindow.on('closed', () => {
    debugWindow = null;
    console.log('调试窗口已关闭');
  });

  return debugWindow.id;
}

// 注册IPC处理程序：创建调试窗口
ipcMain.handle('create-debug-window', async (event, url) => {
  try {
    const gameUrl = url || 'https://www.wanyiwan.top/game/xjjdcj';
    const windowId = createDebugWindow(gameUrl);
    console.log('Created debug window:', windowId);
    return { success: true, windowId };
  } catch (error) {
    console.error('Failed to create debug window:', error);
    return { success: false, error: error.message };
  }
});

// 注册IPC处理程序：关闭调试窗口
ipcMain.handle('close-debug-window', async () => {
  try {
    if (debugWindow && !debugWindow.isDestroyed()) {
      debugWindow.close();
      debugWindow = null;
      console.log('Debug window closed');
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to close debug window:', error);
    return { success: false, error: error.message };
  }
});

// 关闭所有窗口时退出应用（Windows和Linux）
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
