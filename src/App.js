import React, {useState, useRef, useEffect} from 'react';
import './App.css';
import SignallingService from './services/SignallingService';
import RTCHostService from './services/RTCHostService';

const states = {
  NOT_LOGGED_IN: 'NOT_LOGGED_IN',
  NO_ACTIVE_CHAT: 'NO_ACTIVE_CHAT',
  SENDING_OFFER: 'SENDING_OFFER',
  NEGOTIATING: 'NEGOTIATING',
  CHAT_ACTIVE: 'CHAT_ACTIVE',
  OFFER_REJECTED: 'OFFER_REJECTED',
  OFFER_RECEIVED: 'OFFER_RECEIVED'
};

// const messages = {
//   OFFER_REJECTED: 'OFFER_REJECTED',
// }

export default function App() {

  const [chatState, setChatState] = useState(states.NOT_LOGGED_IN);
  const [loginUsername, setLoginUsername] = useState('');
  const [username, setUsername] = useState('');
  const [inviteeName, setInviteeName] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const rtcOffer = useRef(null);
  const rtcServiceContainer = useRef(null);
  
  useEffect(() => {
    SignallingService.instance.onOpen = () => {
      setIsSocketConnected(true);
    };
  }, []);

  useEffect(() => {
    SignallingService.instance.onLogin = message => {
      if (message.success) {
        setUsername(loginUsername);
        setChatState(states.NO_ACTIVE_CHAT);
      }
      else {
        console.log("Unable to login: " + message.message);
      }
    };
  }, [loginUsername]);

  useEffect(() => {
    SignallingService.instance.onOffer = message => {
      if(chatState !== states.NO_ACTIVE_CHAT)
      {
        // TODO Wire up API to formally deny the request.
        return;
      }

      setChatState(states.OFFER_RECEIVED);
      rtcOffer.instance = message.offer;
    };

  }, [chatState]);

  // ****** EVENT HANDLERS ******
  function inviteToChat()
  {
    rtcServiceContainer.current = new RTCHostService(SignallingService.instance, inviteeName);
    rtcServiceContainer.current.beginConnect();
  }

  // ****** RENDER ******

  if(!isSocketConnected)
  {
    return <h2>Connecting...</h2>;
  }

  return (
    <div>
      <h1>Chat App</h1>

      {chatState === states.NOT_LOGGED_IN && renderLogin()}

      {chatState === states.NO_ACTIVE_CHAT && renderChatSelector()}

      {chatState === states.OFFER_RECEIVED && renderOfferReceived()}
    </div>
  );
  

  function renderLogin()
  {
    return (
      <div>
        <label htmlFor="loginUsername">Username: 
          <input type="text" id="loginUsername" name="loginUsername"
            value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
          <button type="button" onClick={() => SignallingService.instance.login(loginUsername)}>Login</button>
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
          <input type="text" id="inviteeUsername" name="inviteeUsername"
            value={inviteeName} onChange={e => setInviteeName(e.target.value)} />
          <button type="button" onClick={inviteToChat}>Start Chat</button>
        </label>
      </div>
    )
  }

  function renderOfferReceived()
  {
    return (
      <div>
        <p>You have a received an offer to chat.  Would you like to accept?</p>
        <button type="button">Accept</button>
      </div>
    );
  }
}