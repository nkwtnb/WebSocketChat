"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const crypt = require("crypto");
exports.Util = (_a = class {
        constructor() { }
        /**
         * 対象文字のUnicodeのbitからUTF-8へ変換する
         * @param char
         * @returns string[] array of bit string
         * @see https://qiita.com/yasushi-jp/items/b006f7170ef3a86de09f#utf-8%E3%81%AE%E5%A4%89%E6%8F%9B%E4%BE%8Bu00ae%E3%81%AE%E5%A0%B4%E5%90%88 UnicodeからUTF-8への変換
         */
        static convertUnicodeToUtf8(char) {
            let codePointBit = this.convertCodePointToBit(char);
            const converted = [];
            if (this.isAscii(parseInt(codePointBit, 2))) {
                converted.push(codePointBit);
                return converted;
            }
            // 6bit毎に分解し、先頭に"10"を付与していく
            // Unicode ---> UTF-8の変換方法は @see 参照
            while (true) {
                if (codePointBit.length === 0)
                    break;
                let tail6 = codePointBit.slice(-6);
                converted.unshift("10" + tail6);
                codePointBit = codePointBit.slice(0, -6);
            }
            // 先頭bitは1埋めとなる
            converted[0] = (this.ONE_PADDING_8bit + converted[0]).slice(-8);
            return converted;
        }
    },
    // ビット演算用の上位ビット(High Order Bit)
    _a.HOB_1 = 128,
    _a.HOB_2 = 64,
    _a.HOB_3 = 32,
    _a.HOB_4 = 16,
    _a.ASCII_MAX = 127,
    _a.ZERO_PADDING_16bit = "0000000000000000",
    _a.ONE_PADDING_8bit = "11111111",
    _a.UTF8_CLASSES = {
        _1_: {
            BIT: 7,
            RANGE: {
                FROM: 0x000,
                TO: 0x07f
            }
        },
        _2_: {
            BIT: 11,
            RANGE: {
                FROM: 0x080,
                TO: 0x07ff
            }
        },
        _3_: {
            BIT: 16,
            RANGE: {
                FROM: 0x0800,
                TO: 0xffff
            }
        },
        _4_: {
            BIT: 21,
            RANGE: {
                FROM: 0x10000,
                TO: 0x10ffff
            }
        },
    },
    /**
     * 対象文字のUnicodeをbit変換する
     * @param char
     * @returns string bit string
     */
    _a.convertCodePointToBit = (char) => {
        const bitString = char.codePointAt(0).toString(2);
        const bit = parseInt(bitString, 2);
        let digit = 0;
        if (_a.UTF8_CLASSES._1_.RANGE.FROM <= bit && bit <= _a.UTF8_CLASSES._1_.RANGE.TO)
            digit = _a.UTF8_CLASSES._1_.BIT;
        if (_a.UTF8_CLASSES._2_.RANGE.FROM <= bit && bit <= _a.UTF8_CLASSES._2_.RANGE.TO)
            digit = _a.UTF8_CLASSES._2_.BIT;
        if (_a.UTF8_CLASSES._3_.RANGE.FROM <= bit && bit <= _a.UTF8_CLASSES._3_.RANGE.TO)
            digit = _a.UTF8_CLASSES._3_.BIT;
        if (_a.UTF8_CLASSES._4_.RANGE.FROM <= bit && bit <= _a.UTF8_CLASSES._4_.RANGE.TO)
            digit = _a.UTF8_CLASSES._4_.BIT;
        // 各範囲の指定桁数まで0埋め
        return ("0".repeat(digit) + bitString).slice(-1 * digit);
    },
    _a.countNeedBytes = (leadByte) => {
        if (_a.isAscii(leadByte))
            return 1;
        if (((leadByte & _a.HOB_2) > 0) && ((leadByte & _a.HOB_3) > 0) && ((leadByte & _a.HOB_4) > 0))
            return 4;
        if (((leadByte & _a.HOB_2) > 0) && ((leadByte & _a.HOB_3) > 0))
            return 3;
        if (((leadByte & _a.HOB_2) > 0))
            return 2;
        return 1;
    },
    _a.isAscii = (byte) => {
        return byte <= _a.ASCII_MAX;
    },
    _a.isLeadByte = (byte) => {
        if (_a.isAscii(byte))
            return true;
        // マルチバイト文字の先頭判定
        // 2ビット目が1であれば後続文字を持っている
        // @see https://www.tohoho-web.com/ex/charset.html#utf-8
        if (byte > _a.ASCII_MAX && ((byte & _a.HOB_2) > 0)) {
            return true;
        }
        return false;
    },
    // クライアントから受信したkeyを元に、AcceptKeyを生成する
    // @see https://triple-underscore.github.io/RFC6455-ja.html#generate-an-accept-nonce
    _a.makeAcceptKey = (key) => {
        const KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        const acceptKey = crypt.createHash("sha1").update(key + KEY).digest("base64");
        return acceptKey;
    },
    _a);
