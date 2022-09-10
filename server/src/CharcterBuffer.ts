
export const CharcterBuffer = class {
  #bytes: number;
  #buffer: number[];
  constructor(bytes: number) {
    this.#bytes = bytes;
    this.#buffer = [];
  }

  isFull(): boolean {
    if (this.#buffer.length === this.#bytes) {
      return true;
    }
    return false;
  }

  add(byte: number) {
    this.#buffer.push(byte);
  }

  debug() {
    console.log(`buf: ${this.#buffer}, bytes: ${this.#bytes}`);
  }

  write(): string {
    // UTF-8の場合、最大1文字4バイト使用する
    const buffer = new Buffer(4);
    for (let i=0; i<this.#buffer.length; i++) {
      buffer.writeUInt8(this.#buffer[i], i);
    }
    return buffer.toString();
  }
}