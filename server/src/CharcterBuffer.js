"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _bytes, _buffer, _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharcterBuffer = void 0;
exports.CharcterBuffer = (_a = class {
        constructor(bytes) {
            _bytes.set(this, void 0);
            _buffer.set(this, void 0);
            __classPrivateFieldSet(this, _bytes, bytes, "f");
            __classPrivateFieldSet(this, _buffer, [], "f");
        }
        isFull() {
            if (__classPrivateFieldGet(this, _buffer, "f").length === __classPrivateFieldGet(this, _bytes, "f")) {
                return true;
            }
            return false;
        }
        add(byte) {
            __classPrivateFieldGet(this, _buffer, "f").push(byte);
        }
        debug() {
            console.log(`buf: ${__classPrivateFieldGet(this, _buffer, "f")}, bytes: ${__classPrivateFieldGet(this, _bytes, "f")}`);
        }
        write() {
            // UTF-8の場合、最大1文字4バイト使用する
            const buffer = new Buffer(4);
            for (let i = 0; i < __classPrivateFieldGet(this, _buffer, "f").length; i++) {
                buffer.writeUInt8(__classPrivateFieldGet(this, _buffer, "f")[i], i);
            }
            return buffer.toString();
        }
    },
    _bytes = new WeakMap(),
    _buffer = new WeakMap(),
    _a);
