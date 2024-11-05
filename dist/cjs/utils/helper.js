"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isEqual;
const node_util_1 = require("node:util");
function isEqual(a, b) {
    const keys = Object.keys(a);
    for (const key of keys) {
        if (typeof a[key] !== 'object' && a[key] !== b[key])
            return false;
        if (!(0, node_util_1.isDeepStrictEqual)(a[key], b[key]))
            return false;
    }
    return true;
}
