const crypt = require("crypto");

export const Util = class {
  // ビット演算用の上位ビット(High Order Bit)
  static HOB_1 = 128;
  static HOB_2 = 64;
  static HOB_3 = 32;
  static HOB_4 = 16;

  static ASCII_MAX = 127;

  private constructor() { }

  static countNeedBytes = (leadByte: number): number => {
    if (leadByte <= 127) return 1;
    if (((leadByte & this.HOB_2) > 0) && ((leadByte & this.HOB_3) > 0) && ((leadByte & this.HOB_4) > 0)) return 4;
    if (((leadByte & this.HOB_2) > 0) && ((leadByte & this.HOB_3) > 0)) return 3;
    if (((leadByte & this.HOB_2) > 0)) return 2;
    return 1;
  }

  static isLeadByte = (byte: number): boolean => {
    if (byte <= this.ASCII_MAX) {
      return true;
    }
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