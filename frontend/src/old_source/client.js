const toggleConnect = document.getElementById("toggle-connect");
const send = document.getElementById("send");
const message = document.getElementById("send-message");
let ws;
let connectStatus = false;

toggleConnect.addEventListener("click", (e) => {
  if (!connectStatus) {
    ws = new WebSocket("ws://127.0.0.1:1337", ["test", "chat"]);
    ws.onopen = () => {
      toggleConnect.textContent = "切断";
      send.removeAttribute("disabled");
      connectStatus = !connectStatus;
    }
    ws.onmessage = (message) => {
      const receivedMessage = document.createElement("li");
      receivedMessage.appendChild(document.createTextNode(message.data));
      const area = document.getElementById("received-message");
      area.appendChild(receivedMessage);
    }
  } else {
    ws.close();
    toggleConnect.textContent = "接続";
    send.setAttribute("disabled", false);
    connectStatus = !connectStatus;
  }
});
send.addEventListener("click", (e) => {
  ws.send(message.value);
});
