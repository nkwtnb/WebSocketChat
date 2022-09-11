"use strict";
//https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
Object.defineProperty(exports, "__esModule", { value: true });
const CharcterBuffer_1 = require("./CharcterBuffer");
const Util_1 = require("./Util");
const http = require("http");
const makeSendData = (messages) => {
    /**
     * Sending data to client
     * data must not mask
     */
    // payload data
    const utf8 = [];
    messages.forEach(char => {
        const converted = Util_1.Util.convertUnicodeToUtf8(char);
        Array.prototype.push.apply(utf8, converted);
    });
    const sendData = Buffer.alloc(utf8.length + 2);
    utf8.forEach((byte, i) => {
        sendData[2 + i] = parseInt(byte, 2);
    });
    // const point = "🍎".codePointAt(0).toString(2)
    // https://qiita.com/yasushi-jp/items/b006f7170ef3a86de09f#utf-8%E3%81%AE%E5%A4%89%E6%8F%9B%E4%BE%8B%F0%A9%B9%BDu29e7d%E3%81%AE%E5%A0%B4%E5%90%88
    // に沿ってビット列を分解
    // FIN:1, opcode:1
    // 0x81 = 10000001
    sendData[0] = 0x81;
    // MASK:0, len:4　
    // 0x4 = 100
    // sendData[1] = 0x3;
    sendData[1] = utf8.length;
    console.log('\n======== Sending Frame ===============');
    return sendData;
};
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("");
});
let sockets = [];
server.on("upgrade", (req, socket, head) => {
    const key = req.headers["sec-websocket-key"];
    const acceptKey = Util_1.Util.makeAcceptKey(key);
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
        const messages = [];
        let characterBuffer = null;
        for (let i = 0; i < payloadLength; i++) {
            const maskingKey = received.readUInt8(2 + (i % 4));
            const appData = received.readUInt8(6 + i);
            const unmasked = appData ^ maskingKey;
            console.log(unmasked);
            if (Util_1.Util.isLeadByte(unmasked)) {
                const neededBytes = Util_1.Util.countNeedBytes(unmasked);
                characterBuffer = new CharcterBuffer_1.CharcterBuffer(neededBytes);
            }
            characterBuffer === null || characterBuffer === void 0 ? void 0 : characterBuffer.add(unmasked);
            if (characterBuffer === null || characterBuffer === void 0 ? void 0 : characterBuffer.isFull()) {
                const character = characterBuffer.write();
                messages.push(character);
            }
        }
        const message = messages.join("");
        console.log(message);
        // send to client
        const sendData = makeSendData(messages);
        for (let i = 0; i < sockets.length; i++) {
            const socket = sockets[i];
            socket.write(sendData);
        }
    });
});
server.on("connection", (socket) => {
    sockets.push(socket);
    console.log("connected!");
});
server.on('error', function (e) {
    console.log(e);
});
server.listen(1337, "127.0.0.1");
