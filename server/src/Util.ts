const crypt = require("crypto");

export const Util = class {

  static HOB_1 = 128;
  static HOB_2 = 64;
  static HOB_3 = 32;
  static HOB_4 = 16;

  private constructor() { }

  static countNeedBytes = (leadByte: number): number => {
    if (leadByte <= 127) return 1;
    if (((leadByte & this.HOB_2) > 0) && ((leadByte & this.HOB_3) > 0) && ((leadByte & this.HOB_4) > 0)) return 4;
    if (((leadByte & this.HOB_2) > 0) && ((leadByte & this.HOB_3) > 0)) return 3;
    if (((leadByte & this.HOB_2) > 0)) return 2;
    return 1;
  }

  static isLeadByte = (byte: number): boolean => {
    if (byte <= 127) {
      return true;
    }
    // マルチバイト文字の先頭
    if (byte > 127 && ((byte & this.HOB_2) > 0)) {
      return true;
    }
    return false;
  }

  static makeAcceptKey = (key: string) => {
    const KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    const acceptKey = crypt.createHash("sha1").update(key + KEY).digest("base64");
    return acceptKey;
  }
}