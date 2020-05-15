import React, {useState, useRef, useEffect} from 'react';
import './App.css';
import ChatService from './services/ChatService';

const states = {
  NOT_LOGGED_IN: 'NOT_LOGGED_IN',
  NO_ACTIVE_CHAT: 'NO_ACTIVE_CHAT',
  SENDING_OFFER: 'SENDING_OFFER',
  NEGOTIATING: 'NEGOTIATING',
  CHAT_ACTIVE: 'CHAT_ACTIVE',
  OFFER_REJECTED: 'OFFER_REJECTED'
};

const messages = {
  OFFER_REJECTED: 'OFFER_REJECTED',
}

export default function App() {

  const [chatState, setChatState] = useState(states.NOT_LOGGED_IN);
  const [loginUsername, setLoginUsername] = useState('');
  const [username, setUsername] = useState('');
  const chatServiceContainer = useRef(new ChatService());
  
  useEffect(() => {
    chatServiceContainer.current.onLogin = message => {
      if (message.success) {
        setUsername(loginUsername);
        setChatState(states.NO_ACTIVE_CHAT);
      }
      else {
        console.log("Unable to login: " + message.message);
      }
    };
  }, []);

  return (
    <div>
      <h1>Chat App</h1>

      {chatState === states.NOT_LOGGED_IN && renderLogin()}

      {chatState === states.NO_ACTIVE_CHAT && renderChatSelector()}
    </div>
  );
  

  function renderLogin()
  {
    return (
      <div>
        <label htmlFor="loginUsername">Username: 
          <input type="text" id="loginUsername" name="loginUsername"
            value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
          <button type="button" onClick={() => chatServiceContainer.current.login(loginUsername)}>Login</button>
        </label>
      </div>
    );
  }

  function renderChatSelector()
  {
    return (
      <div>
        <p>Logged in as: {username}</p>
        <label htmlFor="inviteeUsername">Invitee Username: 
          <input type="text" id="inviteeUsername" name="inviteeUsername" />
          <button type="button">Start Chat</button>
        </label>
      </div>
    )
  }
}