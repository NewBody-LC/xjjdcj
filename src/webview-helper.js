/**
 * Webview辅助模块
 * 提供与webview交互的辅助功能
 */

const logger = require('./logger');

class WebviewHelper {
    constructor() {
        this.gameWebview = null;
    }

    /**
     * 初始化webview辅助模块
     * @param {HTMLElement} webviewElement - webview元素
     */
    init(webviewElement) {
        this.gameWebview = webviewElement;
    }

    /**
     * 获取webview元素
     * @returns {HTMLElement} webview元素
     */
    getWebview() {
        return this.gameWebview;
    }

    /**
     * 检查webview是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isReady() {
        return !!this.gameWebview;
    }

    /**
     * 在webview中执行JavaScript代码
     * @param {string} code - JavaScript代码
     * @returns {Promise<any>} 执行结果
     */
    async executeJavaScript(code) {
        if (!this.gameWebview) {
            throw new Error('Webview未初始化');
        }
        return await this.gameWebview.executeJavaScript(code);
    }

    /**
     * 获取游戏Canvas元素
     * @returns {Promise<HTMLCanvasElement|null>} Canvas元素
     */
    async getGameCanvas() {
        try {
            const canvas = await this.executeJavaScript(`
                (function() {
                    const canvas = document.querySelector('canvas');
                    return canvas ? { width: canvas.width, height: canvas.height } : null;
                })()
            `);
            return canvas;
        } catch (error) {
            logger.error('获取游戏Canvas失败: ' + error.message);
            return null;
        }
    }

    /**
     * 获取Canvas图像数据
     * @returns {Promise<ImageData|null>} 图像数据
     */
    async captureCanvas() {
        try {
            const imageData = await this.executeJavaScript(`
                (function() {
                    const canvas = document.querySelector('canvas');
                    if (!canvas) return null;
                    const ctx = canvas.getContext('2d');
                    return ctx.getImageData(0, 0, canvas.width, canvas.height);
                })()
            `);
            return imageData;
        } catch (error) {
            logger.error('捕获Canvas失败: ' + error.message);
            return null;
        }
    }

    /**
     * 模拟点击指定坐标
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Promise<boolean>} 是否成功
     */
    async simulateClick(x, y) {
        try {
            await this.executeJavaScript(`
                (function() {
                    const canvas = document.querySelector('canvas');
                    if (!canvas) return false;
                    
                    const rect = canvas.getBoundingClientRect();
                    const clickX = rect.left + ${x};
                    const clickY = rect.top + ${y};
                    
                    const downEvent = new MouseEvent('mousedown', {
                        bubbles: true,
                        cancelable: true,
                        clientX: clickX,
                        clientY: clickY
                    });
                    const upEvent = new MouseEvent('mouseup', {
                        bubbles: true,
                        cancelable: true,
                        clientX: clickX,
                        clientY: clickY
                    });
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        clientX: clickX,
                        clientY: clickY
                    });
                    
                    canvas.dispatchEvent(downEvent);
                    canvas.dispatchEvent(upEvent);
                    canvas.dispatchEvent(clickEvent);
                    return true;
                })()
            `);
            return true;
        } catch (error) {
            logger.error('模拟点击失败: ' + error.message);
            return false;
        }
    }

    /**
     * 执行滑动操作
     * @param {number} startX - 起始X坐标
     * @param {number} startY - 起始Y坐标
     * @param {number} endX - 结束X坐标
     * @param {number} endY - 结束Y坐标
     * @param {number} duration - 滑动持续时间(毫秒)
     * @returns {Promise<boolean>} 是否成功
     */
    async swipe(startX, startY, endX, endY, duration = 500) {
        try {
            await this.executeJavaScript(`
                (function() {
                    const canvas = document.querySelector('canvas');
                    if (!canvas) return false;
                    
                    const rect = canvas.getBoundingClientRect();
                    const sx = rect.left + ${startX};
                    const sy = rect.top + ${startY};
                    const ex = rect.left + ${endX};
                    const ey = rect.top + ${endY};
                    
                    // 触发touchstart
                    const touchStart = new TouchEvent('touchstart', {
                        bubbles: true,
                        cancelable: true,
                        touches: [new Touch({
                            identifier: Date.now(),
                            target: canvas,
                            clientX: sx,
                            clientY: sy
                        })]
                    });
                    canvas.dispatchEvent(touchStart);
                    
                    // 延迟后触发touchend
                    setTimeout(() => {
                        const touchEnd = new TouchEvent('touchend', {
                            bubbles: true,
                            cancelable: true,
                            changedTouches: [new Touch({
                                identifier: Date.now(),
                                target: canvas,
                                clientX: ex,
                                clientY: ey
                            })]
                        });
                        canvas.dispatchEvent(touchEnd);
                    }, ${duration});
                    
                    return true;
                })()
            `);
            return true;
        } catch (error) {
            logger.error('滑动操作失败: ' + error.message);
            return false;
        }
    }

    /**
     * 点击游戏内全屏按钮
     * @returns {Promise<boolean>} 是否成功
     */
    async clickFullscreenButton() {
        try {
            const result = await this.executeJavaScript(`
                (function() {
                    const fullscreenBtn = document.querySelector('.fullScreenBtn-Ft-goHEv');
                    if (fullscreenBtn) {
                        fullscreenBtn.click();
                        return { success: true };
                    }
                    return { success: false, error: '未找到全屏按钮' };
                })()
            `);
            return result.success;
        } catch (error) {
            logger.error('点击全屏按钮失败: ' + error.message);
            return false;
        }
    }

    /**
     * 检查游戏是否已全屏
     * @returns {Promise<boolean>} 是否全屏
     */
    async isFullscreen() {
        try {
            const result = await this.executeJavaScript(`
                (function() {
                    const fullscreenBtn = document.querySelector('.fullScreenBtn-Ft-goHEv');
                    if (fullscreenBtn) {
                        const spanElement = fullscreenBtn.querySelector('span');
                        if (spanElement && spanElement.textContent.includes('退出全屏')) {
                            return true;
                        }
                    }
                    return false;
                })()
            `);
            return result;
        } catch (error) {
            logger.error('检查全屏状态失败: ' + error.message);
            return false;
        }
    }

    /**
     * 获取游戏窗口尺寸
     * @returns {Promise<{width: number, height: number}|null>} 窗口尺寸
     */
    async getWindowSize() {
        try {
            const size = await this.executeJavaScript(`
                (function() {
                    return {
                        width: window.innerWidth,
                        height: window.innerHeight
                    };
                })()
            `);
            return size;
        } catch (error) {
            logger.error('获取窗口尺寸失败: ' + error.message);
            return null;
        }
    }

    /**
     * 等待元素出现
     * @param {string} selector - CSS选择器
     * @param {number} timeout - 超时时间(毫秒)
     * @returns {Promise<boolean>} 是否找到元素
     */
    async waitForElement(selector, timeout = 5000) {
        try {
            const result = await this.executeJavaScript(`
                (function() {
                    return new Promise((resolve) => {
                        const element = document.querySelector('${selector}');
                        if (element) {
                            resolve(true);
                            return;
                        }
                        
                        const observer = new MutationObserver(() => {
                            const element = document.querySelector('${selector}');
                            if (element) {
                                observer.disconnect();
                                resolve(true);
                            }
                        });
                        
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true
                        });
                        
                        setTimeout(() => {
                            observer.disconnect();
                            resolve(false);
                        }, ${timeout});
                    });
                })()
            `);
            return result;
        } catch (error) {
            logger.error('等待元素失败: ' + error.message);
            return false;
        }
    }

    /**
     * 刷新页面
     * @returns {Promise<void>}
     */
    async reload() {
        if (this.gameWebview) {
            this.gameWebview.reload();
        }
    }

    /**
     * 导航到指定URL
     * @param {string} url - URL地址
     */
    navigate(url) {
        if (this.gameWebview) {
            this.gameWebview.src = url;
        }
    }
}

// 创建单例实例
const webviewHelper = new WebviewHelper();

module.exports = webviewHelper;
