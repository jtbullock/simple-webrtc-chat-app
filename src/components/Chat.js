import React from 'react';

export default function Chat({chattingWithUsername, messages, onMessageSend}) {
    const [message, setMessage] = React.useState('');
    const messagesEndRef = React.createRef();

    function sendMessage(e) {
        e.preventDefault();
        onMessageSend(message);
        setMessage('');
    }

    React.useEffect(() => {
        messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    return (
        <div className="flex flex-col h-full flex-grow">
            <div className="bg-gray-400 p-3 rounded mb-3">
                Chatting with <span className="font-bold">{chattingWithUsername}</span>
            </div>

            <div className="flex-grow overflow-y-auto">
                {messages.map(message =>
                    <div key={message.id}><strong>{message.name}</strong> {message.text}</div>)
                }
                <div ref={messagesEndRef}/>
            </div>

            <form onSubmit={sendMessage} className="flex">
                <input type="text" id="message-text" name="message-text"
                       value={message} onChange={e => setMessage(e.target.value)}
                       placeholder="message"
                       className="flex-grow full border rounded border-gray px-2 py-1 mr-3"/>
                <button type="submit" className="rounded bg-blue-500 text-white py-2 px-8">Send</button>
            </form>

        </div>
    )
}