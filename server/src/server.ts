//https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers

import { CharcterBuffer } from "./CharcterBuffer";
import { Util } from "./Util";

const http = require("http");

const server = http.createServer((req: any, res: any) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("okay");
});

server.on("upgrade", (req: any, socket: any, head: any) => {
  const key = req.headers["sec-websocket-key"];
  const acceptKey = Util.makeAcceptKey(key);
  socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
  'Upgrade: webSocket\r\n' +
  'Connection: upgrade\r\n' +
  `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
  `Sec-WebSocket-Protocol: chat\r\n` +
  '\r\n');
  socket.on("data", (received: Buffer) => {
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
      for (let i=0; i<payloadLength; i++) {
        const maskingKey = received.readUInt8(2 + (i % 4));
        const appData = received.readUInt8(6 + i);
        const unmasked = appData ^ maskingKey;
        if (Util.isLeadByte(unmasked)) {
          const neededBytes = Util.countNeedBytes(unmasked);
          characterBuffer = new CharcterBuffer(neededBytes);
        }
        characterBuffer?.add(unmasked);
        if (characterBuffer?.isFull()) {
          const character = characterBuffer.write();
          message.push(character);
        }
      }
      console.log(message.join(""));
  });
})

server.on("connection", (ws: any) => {
  console.log("connected!");
});

server.on('error', function (e: any) {
  console.log(e);
});
server.listen(1337, "127.0.0.1");