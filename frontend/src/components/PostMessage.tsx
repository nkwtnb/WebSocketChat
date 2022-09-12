import { useEffect, useRef, useState } from "react";
import { Message } from "../App";

const formatHHMM = (date: Date) => {
  return ("00" + date.getHours()).slice(-2) +
        ":" +
        ("00" + date.getMinutes()).slice(-2);
}

export const PostMessage = ({setMessages}: {setMessages: ((param: Message) => void)}) => {
  const [isConnected, setConnected] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  let calledOnce = useRef(false);
  let ws = useRef<WebSocket>();

  useEffect(() => {
    if (!isConnected && !calledOnce.current) {
      connect();
      calledOnce.current = true;
    }
  }, []);

  const connect = () => {
    if (!isConnected) {
      ws.current = new WebSocket("ws://127.0.0.1:1337", ["test", "chat"]);
      ws.current.onopen = (ev: Event) => {
        setConnected(!isConnected);
      }
      ws.current.onmessage = (received) => {
        const message = received.data;
        const time = formatHHMM(new Date());
        setMessages({
          sender: "other",
          content: message,
          time: time,
        });
      }
      ws.current.onerror = (error) => {
        console.log(error);
      }
    } else {
      ws.current?.close();
      setConnected(!isConnected);
    }
  }

  const send = () => {
    const text = messageRef.current?.value;
    if (text?.length! > 127) {

    }
    if (messageRef.current?.value !== "") {
      ws.current?.send(messageRef.current?.value!);
      const time = formatHHMM(new Date());
      setMessages({
        sender: "me",
        content: messageRef.current?.value!,
        time: time
      });
      if (messageRef.current) {
        messageRef.current.value = "";
      }
    }
  }

  return (
    <div className="border flex">
      <textarea id="send-message" className="grow align-bottom resize-none h-12" ref={messageRef}></textarea>
      <button id="send" disabled={!isConnected} className=" px-8 py-3 text-white rounded disabled:bg-gray-300 bg-blue-600 rounded disabled:outline-none" onClick={send}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
      </button>
    </div>
  )
};
