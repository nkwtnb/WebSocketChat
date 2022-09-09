"use strict";
//https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
Object.defineProperty(exports, "__esModule", { value: true });
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
        console.log(`fin ${fin}`);
        const opcode = firstByte & 0x0f;
        console.log(`opcode ${opcode}`);
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
                break;
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
        console.log(`payloadType : ${payloadType}`);
        const secondByte = received[1];
        const mask = (secondByte & 0x80) >>> 7;
        if (mask === 0) {
            throw new Error("browser should always mask the payload data");
        }
        const payloadLength = (secondByte & 0x7f);
        if (payloadLength === 0x7e || payloadLength === 0x7f) {
            throw new Error("next 16bit or 64bit is not supported");
        }
        console.log(`payloadLength : ${payloadLength}`);
        // 今回のケースではペイロード長は7bitに収まっており、後続8byteのペイロード長はなく、次はマスク用keyとなる。
        // 固定で7bit + 8byteがペイロード長に使われるわけではないので注意。
        // const maskingKey = received.readUInt32BE(2);
        const maskingKey = received.readUInt32BE(3);
        const extentionData = null;
        for (let i = 0; i < payloadLength; i++) {
            console.log(i);
            const maskingKey = received.readUInt8(2 + (i % 4));
            const appData = received.readUInt8(6 + i);
            const unmasked = appData ^ maskingKey;
            const unmaskedBuffer = new Buffer(4);
            unmaskedBuffer.writeInt8(unmasked, 0);
            const data = unmaskedBuffer.toString();
            console.log(data);
        }
        // const applicationData = received.readUInt32BE(6);
        const applicationData = received.readUInt32BE(7);
        const unmasked = applicationData ^ maskingKey;
        const unmaskedBuffer = new Buffer(60);
        // unmaskedBuffer.writeUInt32BE(unmasked, 0);
        // unmaskedBuffer.writeUint32BE(unmasked, 0);
        unmaskedBuffer.writeUint32BE(unmasked);
        const data = unmaskedBuffer.toString();
        console.log(data);
    });
    // socket.pipe(socket);
});
server.on("connection", (ws) => {
    console.log("connected!");
});
server.on('error', function (e) {
    // Handle your error here
    console.log(e);
});
server.listen(1337, "127.0.0.1");
