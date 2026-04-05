/**
 * 日志模块
 * 管理应用日志的显示和输出
 */

class Logger {
    constructor() {
        this.logContent = null;
        this.ruinsStopRequested = false;
    }

    /**
     * 初始化日志模块
     * @param {HTMLElement} logContentElement - 日志容器元素
     */
    init(logContentElement) {
        this.logContent = logContentElement;
    }

    /**
     * 设置停止请求状态
     * @param {boolean} stopped - 是否已请求停止
     */
    setStopRequested(stopped) {
        this.ruinsStopRequested = stopped;
    }

    /**
     * 获取停止请求状态
     * @returns {boolean} 是否已请求停止
     */
    isStopRequested() {
        return this.ruinsStopRequested;
    }

    /**
     * 添加日志
     * @param {string} message - 日志消息
     * @param {string} type - 日志类型 (info, success, warning, error)
     * @param {boolean} skipStopCheck - 是否跳过停止检查
     */
    log(message, type = 'info', skipStopCheck = false) {
        try {
            // 如果是遗迹操作相关的日志且已请求停止，则不输出到界面
            if (!skipStopCheck && this.ruinsStopRequested) {
                console.log(`[已停止-日志已屏蔽] ${message}`);
                return;
            }

            // 获取当前时间
            const now = new Date();
            const timeStr = now.toLocaleTimeString();

            // 创建日志条目
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry log-${type}`;

            // 构建日志内容
            logEntry.innerHTML = `<span class="log-time">${timeStr}</span>${message}`;

            // 添加到日志容器
            if (this.logContent) {
                this.logContent.appendChild(logEntry);

                // 滚动到底部
                this.logContent.scrollTop = this.logContent.scrollHeight;

                // 限制日志条目数量（最多保留100条）
                while (this.logContent.children.length > 100) {
                    this.logContent.removeChild(this.logContent.firstChild);
                }
            }

            // 同时输出到控制台
            console.log(`[${type.toUpperCase()}] ${message}`);
        } catch (error) {
            console.error('添加日志时出错:', error);
        }
    }

    /**
     * 记录信息日志
     * @param {string} message - 日志消息
     */
    info(message) {
        this.log(message, 'info');
    }

    /**
     * 记录成功日志
     * @param {string} message - 日志消息
     */
    success(message) {
        this.log(message, 'success');
    }

    /**
     * 记录警告日志
     * @param {string} message - 日志消息
     */
    warning(message) {
        this.log(message, 'warning');
    }

    /**
     * 记录错误日志
     * @param {string} message - 日志消息
     */
    error(message) {
        this.log(message, 'error');
    }

    /**
     * 清空日志
     */
    clear() {
        if (this.logContent) {
            this.logContent.innerHTML = '';
        }
    }

    /**
     * 获取所有日志内容
     * @returns {string} 日志文本
     */
    getAllLogs() {
        if (!this.logContent) return '';
        
        let logs = [];
        const entries = this.logContent.querySelectorAll('.log-entry');
        entries.forEach(entry => {
            logs.push(entry.textContent);
        });
        return logs.join('\n');
    }
}

// 创建单例实例
const logger = new Logger();

module.exports = logger;
