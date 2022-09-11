import React from 'react';
import './App.css';
import { Messages } from './components/Messages';
import { PostMessage } from './components/PostMessage';

function App() {
  return (
    <div className="App">
      <PostMessage /> 
      <Messages />
    </div>
  );
}

export default App;
