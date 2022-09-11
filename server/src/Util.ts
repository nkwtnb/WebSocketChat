const crypt = require("crypto");

export const Util = class {
  // ビット演算用の上位ビット(High Order Bit)
  static HOB_1 = 128;
  static HOB_2 = 64;
  static HOB_3 = 32;
  static HOB_4 = 16;

  static ASCII_MAX = 127;

  static ZERO_PADDING_16bit = "0000000000000000";
  static ONE_PADDING_8bit = "11111111";

  static UTF8_CLASSES = {
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
  }

  private constructor() { }

  /**
   * 対象文字のUnicodeを取得し、そこからUTF-8へ変換する
   * @param char 
   * @returns 
   * @see https://qiita.com/yasushi-jp/items/b006f7170ef3a86de09f#utf-8%E3%81%AE%E5%A4%89%E6%8F%9B%E4%BE%8Bu00ae%E3%81%AE%E5%A0%B4%E5%90%88 UnicodeからUTF-8への変換
   */
  static convertCodePointToBit = (char: string) => {
    const bitString = char.codePointAt(0)!.toString(2);
    const bit = parseInt(bitString, 2);
    let digit = 0;
    if (this.UTF8_CLASSES._1_.RANGE.FROM <= bit && bit <= this.UTF8_CLASSES._1_.RANGE.TO) digit = this.UTF8_CLASSES._1_.BIT;
    if (this.UTF8_CLASSES._2_.RANGE.FROM <= bit && bit <= this.UTF8_CLASSES._2_.RANGE.TO) digit = this.UTF8_CLASSES._2_.BIT;
    if (this.UTF8_CLASSES._3_.RANGE.FROM <= bit && bit <= this.UTF8_CLASSES._3_.RANGE.TO) digit = this.UTF8_CLASSES._3_.BIT;
    if (this.UTF8_CLASSES._4_.RANGE.FROM <= bit && bit <= this.UTF8_CLASSES._4_.RANGE.TO) digit = this.UTF8_CLASSES._4_.BIT;      
    // 各範囲の指定桁数まで0埋め
    return ("0".repeat(digit) + bitString).slice(-1 * digit);
  }

  static convertUnicodeToUtf8(char: string) {
    let codePointBit = this.convertCodePointToBit(char);
    const converted = [];
    if (this.isAscii(parseInt(codePointBit, 2))) {
      converted.push(codePointBit);
      return converted;
    }
    while(true) {
      if (codePointBit.length === 0) break;
      let tail6 = codePointBit.slice(-6);
      converted.unshift("10" + tail6);
      codePointBit = codePointBit.slice(0, -6);
    }
    converted[0] = (this.ONE_PADDING_8bit + converted[0]).slice(-8);
    return converted;
  }

  static countNeedBytes = (leadByte: number): number => {
    if (this.isAscii(leadByte)) return 1;
    if (((leadByte & this.HOB_2) > 0) && ((leadByte & this.HOB_3) > 0) && ((leadByte & this.HOB_4) > 0)) return 4;
    if (((leadByte & this.HOB_2) > 0) && ((leadByte & this.HOB_3) > 0)) return 3;
    if (((leadByte & this.HOB_2) > 0)) return 2;
    return 1;
  }

  static isAscii = (byte: number): boolean => {
    return byte <= this.ASCII_MAX;
  }

  static isLeadByte = (byte: number): boolean => {
    if (this.isAscii(byte)) return true;
    // マルチバイト文字の先頭判定
    // 2ビット目が1であれば後続文字を持っている
    // @see https://www.tohoho-web.com/ex/charset.html#utf-8
    if (byte > this.ASCII_MAX && ((byte & this.HOB_2) > 0)) {
      return true;
    }
    return false;
  }

  // クライアントから受信したkeyを元に、AcceptKeyを生成する
  // @see https://triple-underscore.github.io/RFC6455-ja.html#generate-an-accept-nonce
  static makeAcceptKey = (key: string) => {
    const KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    const acceptKey = crypt.createHash("sha1").update(key + KEY).digest("base64");
    return acceptKey;
  }
}