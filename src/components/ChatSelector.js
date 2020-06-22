import React, {useState, useEffect} from 'react';

export default function ChatSelector({onInviteToChat}) {
    const [inviteeName, setInviteeName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onInviteToChat(inviteeName);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="inviteeUsername">Invitee Username:
                <input type="text" id="inviteeUsername" name="inviteeUsername" autoFocus
                       value={inviteeName} onChange={e => setInviteeName(e.target.value)}/>
                <button type="submit">Start Chat</button>
            </label>
        </form>
    )
}