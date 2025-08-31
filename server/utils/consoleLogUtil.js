const { BrowserWindow } = require('electron');
const winston = require("winston"); //打印日志到文件
const path = require("path");


// 1. 创建日志器（logger）
const logger = winston.createLogger({
    // 日志级别：低于该级别的日志不会输出（如选 'info'，则 'debug' 不输出）
    level: "debug",
    // 日志格式（时间戳 + 级别 + 内容）
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), // 时间戳
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),

    transports: [
        // 文件输出
        new winston.transports.File({
            filename: path.join(__dirname, "logs/app.log"), // 普通日志文件
            level: "debug", // 该文件只存 debug 及以上级别（debug/info/warn/error）
            maxsize: 1024 * 1024, // 可选：单文件最大大小（1MB，超了会切割，需配合 maxFiles）
            maxFiles: 5 // 可选：最多保留 5 个切割文件（避免日志文件过多）
        }),
    ],
});

function log_to_render_console(...msg) {
    try {
        const windows = BrowserWindow.getAllWindows();
        if (!windows) {
            return;
        }
        let currentWindow;
        for (let i = 0; i < windows.length; i++) {
            const win = windows[i];
            if (win && win.title == "京东夺宝岛助手") {
                currentWindow = win;
                break;
            }
        }
        if (currentWindow) {
            // 获取参数
            const params = msg.map((arg) => {
                if (typeof arg === "string") {
                    return arg;
                } else {
                    return JSON.stringify(arg);
                }
            });

            const str = params.join(" ");
            currentWindow.webContents && currentWindow.webContents.send("fromMain", { event: "console", data: str });
        }
    } catch (error) {
        // arm中主进程打印日志可能抛异常，先注释
        // console.error("consoleLogUtil log error:", error);
    }
}

function error(...msg) {
    logger.error(msg)
    log_to_render_console(msg);
}

function log(...msg) {
    logger.info(msg)
    log_to_render_console(msg);
}

function debug(...msg) {
    logger.debug(msg)
}

function warn(...msg) {
    logger.warn(msg)
    log_to_render_console(msg);
}

module.exports = { log, error, debug, warn };
