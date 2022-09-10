const connect = document.getElementById("connect");
const send = document.getElementById("send");
const message = document.getElementById("message");
let ws;
connect.addEventListener("click", (e) => {
  ws = new WebSocket("ws://127.0.0.1:1337", ["test", "chat"]);
  ws.onopen = () => {
    console.log(ws);
  }
});
send.addEventListener("click", (e) => {
  ws.send(message.value);
});
ws.onmessage = (message) => {
  console.log(message);
}
