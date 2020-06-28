import React, {useState, useRef, useEffect} from 'react';
import shortid from 'shortid';
import SignallingService from './services/SignallingService';
import Login from './components/Login';
import ChatSelector from './components/ChatSelector';
import handleOffer from "./services/web-rtc/handleOffer";
import beginConnect from "./services/web-rtc/beginConnect";
import Chat from "./components/Chat";

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
    const [chattingWithUsername, setChattingWithUsername] = useState('');

    const rtcOffer = useRef(null);
    const rtcConnectionData = useRef(null);

    useEffect(() => {
        SignallingService.instance.on('open', () => {
            setIsSocketConnected(true);
        });
    }, []);

    useEffect(() => {
        SignallingService.instance.on('offer', message => {
            if (chatState !== states.NO_ACTIVE_CHAT) {
                // TODO Wire up API to formally deny the request.
                return;
            }

            setChatState(states.OFFER_RECEIVED);
            rtcOffer.current = message;
            setChattingWithUsername(message.name);
        });

    }, [chatState]);

    // ****** EVENT HANDLERS ******
    function inviteToChat(inviteeName) {
        rtcConnectionData.current = beginConnect(inviteeName, SignallingService.instance);

        setChattingWithUsername(inviteeName);
        setChatState(states.SENDING_OFFER);

        rtcConnectionData.current.on('answer', isAccepted => {
            if (isAccepted) {
                setChatState(states.CHAT_ACTIVE);

                rtcConnectionData.current.on('message', data => {
                    setMessages(prevState => [...prevState, {name: inviteeName, text: data, id: shortid.generate()}]);
                });
            }
        });
    }

    function acceptChatOffer() {
        console.log('Accepting offer');
        const offer = rtcOffer.current;

        console.log('Creating RTC connection');
        rtcConnectionData.current = handleOffer(SignallingService.instance, offer);

        // TODO don't just throw away if we blow up.
        console.log('Getting rid of stored offer');
        rtcOffer.current = null;

        console.log('Wiring up event handlers');
        rtcConnectionData.current.on('channelOpen', () => {
            setChattingWithUsername(rtcConnectionData.current.remoteUsername);
            setChatState(states.CHAT_ACTIVE);
        });

        rtcConnectionData.current.on('message', data => {
            setMessages(prevState => [...prevState, {
                name: rtcConnectionData.current.remoteUsername,
                text: data,
                id: shortid.generate()
            }]);
        });
    }

    function handleMessageSend(message) {
        setMessages(prevState => [...prevState, {name: username, text: message, id: shortid.generate()}]);
        rtcConnectionData.current.rtcChannel.send(message);
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
        <div className="container mx-auto md:border rounded border-gray p-5 md:my-5 flex-grow flex flex-col overflow-hidden">

            <h1 className="text-center text-xl mb-2">Chat App</h1>

            {chatState === states.NOT_LOGGED_IN && <Login onLogin={handleLogin}/>}

            {chatState === states.NO_ACTIVE_CHAT && <ChatSelector username={username} onInviteToChat={inviteToChat}/>}

            {chatState === states.SENDING_OFFER && renderWaitingForResponse()}

            {chatState === states.OFFER_RECEIVED && renderOfferReceived()}

            {chatState === states.CHAT_ACTIVE &&
            <Chat messages={messages} chattingWithUsername={chattingWithUsername} onMessageSend={handleMessageSend}/>}
        </div>
    );

    function renderOfferReceived() {
        return (
            <div>
                <p className="mb-3"><span className="font-semibold">{chattingWithUsername}</span> has sent you a chat
                    request. Would you like to accept?</p>
                <button type="button" onClick={acceptChatOffer}
                        className="block w-full rounded bg-blue-500 text-white p-2 text-xl">Accept
                </button>
            </div>
        );
    }

    function renderWaitingForResponse() {
        return (
            <div>Waiting for <span className="font-semibold">{chattingWithUsername}</span> to accept your invite...
            </div>
        );
    }

}