"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
function write(level, message, context) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(context === undefined ? {} : { context }),
    };
    const output = JSON.stringify(entry);
    if (level === "error") {
        console.error(output);
    }
    else if (level === "warn") {
        console.warn(output);
    }
    else {
        console.log(output);
    }
}
exports.logger = {
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context),
};
//# sourceMappingURL=logger.js.map