import React, { useState } from 'react';
import './App.css';
import { MessageArea } from './components/MessageArea';
import { PostMessage } from './components/PostMessage';

export type Message = {
  sender: "me" | "other"
  content: string
  time: string
}

function App() {

  const [messages, setMessages] = useState<Message[]>([]);

  const handleClick = (param: Message) =>{
    setMessages(prev => [
      ...prev,
      {
        sender: param.sender,
        content: param.content,
        time: param.time
      }
    ]);
  }
  return (
    <div className='container mx-auto max-w-md bg-white'>
      <div className="App flex flex-col h-screen">
        <MessageArea param={messages} />
        <PostMessage setMessages={handleClick}/> 
      </div>
    </div>
  );
}

export default App;
