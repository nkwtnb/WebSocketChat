const connect = document.getElementById("connect");
const send = document.getElementById("send");
const message = document.getElementById("send-message");
let ws;
connect.addEventListener("click", (e) => {
  // 第2引数はサブプロトコル
  // サーバー側で使用に同意したプロトコルを返す
  ws = new WebSocket("ws://127.0.0.1:1337", ["test", "chat"]);
  ws.onopen = () => {
    console.log(ws);
  }
  ws.onmessage = (message) => {
    const receivedMessage = document.createElement("li");
    receivedMessage.appendChild(document.createTextNode(message.data));
    const area = document.getElementById("received-message");
    area.appendChild(receivedMessage);
  }
});
send.addEventListener("click", (e) => {
  ws.send(message.value);
});
