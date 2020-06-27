import React, {useState, useEffect} from 'react';

export default function ChatSelector({username, onInviteToChat}) {
    const [inviteeName, setInviteeName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onInviteToChat(inviteeName);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-lg mb-3">Hello <span className="font-semibold">{username}</span>! Who would you like to
                chat with?</h2>

            <input type="text" id="inviteeUsername" name="inviteeUsername" autoFocus
                   value={inviteeName} onChange={e => setInviteeName(e.target.value)}
                   placeholder="invitee name"
                   className="block w-full border rounded border-gray-600 text-xl p-1 mb-5"/>
            <button type="submit" className="block w-full rounded bg-blue-500 text-white p-2 text-xl">Send Chat Invite
            </button>
        </form>
    )
}