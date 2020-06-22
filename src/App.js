import React, {useState, useRef, useEffect} from 'react';
import shortid from 'shortid';
// import './App.css';
import SignallingService from './services/SignallingService';
import RTCHostService from './services/RTCHostService';
import RTCInviteeService from './services/RTCInviteeService';
import Login from './components/Login';
import ChatSelector from './components/ChatSelector';

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
    const [username, setUsername] = useState('');
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [chattingWithUsername, setChattingWithUsername] = useState('');

    const rtcOffer = useRef(null);
    const rtcServiceContainer = useRef(null);

    useEffect(() => {
        SignallingService.instance.onOpen = () => {
            setIsSocketConnected(true);
        };
    }, []);

    useEffect(() => {
        SignallingService.instance.onOffer = message => {
            if (chatState !== states.NO_ACTIVE_CHAT) {
                // TODO Wire up API to formally deny the request.
                return;
            }

            setChatState(states.OFFER_RECEIVED);
            rtcOffer.current = message;
        };

    }, [chatState]);

    // ****** EVENT HANDLERS ******
    function inviteToChat(inviteeName) {
        rtcServiceContainer.current = new RTCHostService(SignallingService.instance, username);
        rtcServiceContainer.current.beginConnect(inviteeName);

        setChattingWithUsername(inviteeName);
        setChatState(states.SENDING_OFFER);

        rtcServiceContainer.current.onInviteAnswer = isAccepted => {
            if (isAccepted) {
                setChatState(states.CHAT_ACTIVE);

                rtcServiceContainer.current.onMessage = data => {
                    setMessages(prevState => [...prevState, {name: inviteeName, text: data, id: shortid.generate()}]);
                };
            }
        };
    }

    function acceptChatOffer() {
        rtcServiceContainer.current = new RTCInviteeService(SignallingService.instance, username);
        rtcServiceContainer.current.acceptOffer(rtcOffer.current);
        // TODO don't just throw away if we blow up.
        rtcOffer.current = null;

        rtcServiceContainer.current.onChannelOpen = setChatState(states.CHAT_ACTIVE);
        rtcServiceContainer.current.onMessage = data => {
            setMessages(prevState => [...prevState, {name: chattingWithUsername, text: data, id: shortid.generate()}]);
        };
    }

    function sendMessage(e) {
        e.preventDefault();
        setMessages(prevState => [...prevState, {name: username, text: message, id: shortid.generate()}]);
        rtcServiceContainer.current.sendMessage(message);
        setMessage('');
    }

    function handleLogin(loginUsername) {
        setUsername(loginUsername);
        setChatState(states.NO_ACTIVE_CHAT);
    }

    // ****** RENDER ******

    if (!isSocketConnected) {
        return <h2>Connecting...</h2>;
    }

    return (
        <div>
            <h1>Chat App</h1>

            {chatState !== states.NOT_LOGGED_IN &&
            <div>
                Logged in as: {username}
            </div>}

            {chatState === states.NOT_LOGGED_IN && <Login onLogin={handleLogin}/>}

            {chatState === states.NO_ACTIVE_CHAT && <ChatSelector onInviteToChat={inviteToChat}/>}

            {chatState === states.SENDING_OFFER && <div>Waiting for acceptance...</div>}

            {chatState === states.OFFER_RECEIVED && renderOfferReceived()}

            {chatState === states.CHAT_ACTIVE && renderChat()}
        </div>
    );

    function renderOfferReceived() {
        return (
            <div>
                <p>You have a received an offer to chat. Would you like to accept?</p>
                <button type="button" onClick={acceptChatOffer}>Accept</button>
            </div>
        );
    }

    function renderChat() {
        return (
            <div>
                <h3>Chat with {chattingWithUsername}</h3>

                <form onSubmit={sendMessage}>
                    <label htmlFor="message-text">
                        Message:
                        <input type="text" id="message-text" name="message-text"
                               value={message} onChange={e => setMessage(e.target.value)}/>
                        <button type="submit">Send</button>
                    </label>
                </form>

                {messages.map(message => <div key={message.id}><strong>{message.name}</strong> {message.text}</div>)}
            </div>
        )
    }
}