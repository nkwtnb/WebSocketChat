"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
exports.Util = (_a = class {
        constructor() { }
    },
    _a.HOB_1 = 128,
    _a.HOB_2 = 64,
    _a.HOB_3 = 32,
    _a.HOB_4 = 16,
    _a.countNeedBytes = (leadByte) => {
        if (leadByte <= 127)
            return 1;
        if (((leadByte & _a.HOB_2) > 0) && ((leadByte & _a.HOB_3) > 0) && ((leadByte & _a.HOB_4) > 0))
            return 4;
        if (((leadByte & _a.HOB_2) > 0) && ((leadByte & _a.HOB_3) > 0))
            return 3;
        if (((leadByte & _a.HOB_2) > 0))
            return 2;
        return 1;
    },
    _a.isLeadByte = (byte) => {
        if (byte <= 127) {
            return true;
        }
        // マルチバイト文字の先頭
        if (byte > 127 && ((byte & _a.HOB_2) > 0)) {
            return true;
        }
        return false;
    },
    _a);
