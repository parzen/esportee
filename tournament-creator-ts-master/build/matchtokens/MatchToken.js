"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UIDUtils_1 = require("../utils/UIDUtils");
class MatchToken {
    constructor() {
        this.token = "" + UIDUtils_1.UIDUtils.getUid();
        this.id = UIDUtils_1.UIDUtils.getUid();
    }
}
exports.MatchToken = MatchToken;
//# sourceMappingURL=MatchToken.js.map