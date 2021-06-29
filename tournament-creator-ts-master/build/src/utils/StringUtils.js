"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringUtils {
    static isEmpty(str) {
        return (!str || 0 === str.length);
    }
    static isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }
}
exports.StringUtils = StringUtils;
//# sourceMappingURL=StringUtils.js.map