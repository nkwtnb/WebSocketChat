import { useEffect, useRef } from "react";
import { Message } from "../App";
import { Bubbles } from "./Bubbles";

export const MessageArea = ({param}: {param: Message[]}) => {
  const messageUL = useRef<HTMLUListElement>(null);
  useEffect(() => {
    messageUL.current?.scrollIntoView(false);
  }, [param]);

  return (
    <>
    <div className="text-lg font-medium underline border">WebSocket Chat</div>
    <div className="grow border overflow-auto" >
      <ul id="received-message" ref={messageUL}>
      {
        param.map((messageParam, i) => {
          return (
            <Bubbles key={i} sender={messageParam.sender} content={messageParam.content} time={messageParam.time}/>
          )
        })
      }
      </ul>
    </div>
    </>
  );
}