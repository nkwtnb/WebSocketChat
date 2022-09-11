"use strict";
//https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
Object.defineProperty(exports, "__esModule", { value: true });
const CharcterBuffer_1 = require("./CharcterBuffer");
const Util_1 = require("./Util");
const http = require("http");
const makeSendData = (messages) => {
    const utf8 = [];
    messages.forEach(char => {
        const converted = Util_1.Util.convertUnicodeToUtf8(char);
        Array.prototype.push.apply(utf8, converted);
    });
    // utf-8に変換したバイト文字列を詰めていく
    // [0],[1]は固定の為、後ほど詰める為、length +2
    const sendData = Buffer.alloc(utf8.length + 2);
    utf8.forEach((byte, i) => {
        sendData[2 + i] = parseInt(byte, 2);
    });
    // FIN(1) 〜 opcode(0x1)
    sendData[0] = 0x81;
    // MASK(0) 〜 payload length(utf8.len)
    sendData[1] = utf8.length;
    // 延長ペイロード長 〜 マスク用Keyは使用しない
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
        // 取得したメッセージ
        const message = messages.join("");
        // console.log(message);
        // クライアントへ返信
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
