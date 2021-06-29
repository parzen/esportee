"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UIDUtils {
    static getUid() {
        return (Math.random() * 1e9 >>> 0) + (UIDUtils.counter++);
    }
}
UIDUtils.counter = Date.now() % 1e9;
exports.UIDUtils = UIDUtils;
//# sourceMappingURL=UIDUtils.js.map