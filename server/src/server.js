"use strict";
//https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
Object.defineProperty(exports, "__esModule", { value: true });
const CharcterBuffer_1 = require("./CharcterBuffer");
const Util_1 = require("./Util");
const http = require("http");
const crypt = require("crypto");
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("okay");
});
const makeAcceptKey = (key) => {
    const KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    const acceptKey = crypt.createHash("sha1").update(key + KEY).digest("base64");
    return acceptKey;
};
// const isLeadByte = (byte: number): boolean => {
//   if (byte <= 127) {
//     return true;
//   }
//   // マルチバイト文字の先頭
//   if (byte > 127 && ((byte & HOB_2) > 0)) {
//     return true;
//   }
//   return false;
// }
// const countNeedBytes = (leadByte: number): number => {
//   if (leadByte <= 127) return 1;
//   if (((leadByte & HOB_2) > 0) && ((leadByte & HOB_3) > 0) && ((leadByte & HOB_4) > 0)) return 4;
//   if (((leadByte & HOB_2) > 0) && ((leadByte & HOB_3) > 0) ) return 3;
//   if (((leadByte & HOB_2) > 0)) return 2;
//   return 1;
// }
server.on("upgrade", (req, socket, head) => {
    const key = req.headers["sec-websocket-key"];
    const acceptKey = makeAcceptKey(key);
    socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: webSocket\r\n' +
        'Connection: upgrade\r\n' +
        `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
        `Sec-WebSocket-Protocol: chat\r\n` +
        '\r\n');
    socket.on("data", (received) => {
        const firstByte = received[0];
        // UInt8Arrayの8bitと0x80(1000 0000)のビット演算後、先頭ビットを取るため、右に7ビットシフト
        const fin = firstByte & 0x80;
        const opcode = firstByte & 0x0f;
        let payloadType;
        switch (opcode) {
            case 0x0:
                payloadType = 'continuation';
                break;
            case 0x1:
                payloadType = 'text';
                break;
            case 0x2:
                payloadType = 'binary';
                break;
            case 0x8:
                payloadType = 'connection close';
                console.log("close!");
                return;
            case 0x9:
                payloadType = 'ping';
                break;
            case 0xA:
                payloadType = 'pong';
                break;
            default:
                payloadType = 'reserved for non-control';
        }
        if (payloadType !== "text") {
            throw new Error("only text");
        }
        const secondByte = received[1];
        const mask = (secondByte & 0x80) >>> 7;
        if (mask === 0) {
            throw new Error("browser should always mask the payload data");
        }
        const payloadLength = (secondByte & 0x7f);
        if (payloadLength === 0x7e || payloadLength === 0x7f) {
            throw new Error("next 16bit or 64bit is not supported");
        }
        // フォーマットではペイロード長は7bit / 7bit + 16bit / 7bit + 64bitのどれかとなる。
        // 今回のケースではペイロード長は7bitに収まっており、後続の延長ペイロード長はなく、次はマスク用keyが格納されている想定
        // 固定で7bitの後ろに延長ペイロード長が存在するわけではないので注意。
        const message = [];
        let characterBuffer = null;
        for (let i = 0; i < payloadLength; i++) {
            const maskingKey = received.readUInt8(2 + (i % 4));
            const appData = received.readUInt8(6 + i);
            const unmasked = appData ^ maskingKey;
            if (Util_1.Util.isLeadByte(unmasked)) {
                const neededBytes = Util_1.Util.countNeedBytes(unmasked);
                characterBuffer = new CharcterBuffer_1.CharcterBuffer(neededBytes);
            }
            characterBuffer === null || characterBuffer === void 0 ? void 0 : characterBuffer.add(unmasked);
            if (characterBuffer === null || characterBuffer === void 0 ? void 0 : characterBuffer.isFull()) {
                const character = characterBuffer.write();
                message.push(character);
            }
        }
        console.log(message.join(""));
    });
});
server.on("connection", (ws) => {
    console.log("connected!");
});
server.on('error', function (e) {
    console.log(e);
});
server.listen(1337, "127.0.0.1");
