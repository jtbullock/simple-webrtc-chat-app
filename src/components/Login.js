import React, {useState, useEffect} from 'react';
import SignallingService from '~/services/SignallingService';

export default function Login({onLogin}) {

    const [loginUsername, setLoginUsername] = useState('');
    const [isLoginFailed, setIsLoginFailed] = useState(false);
    const [loginFailureMessage, setLoginFailureMessage] = useState('');

    useEffect(() => {
        const unbind = SignallingService.instance.on('login', message => {
            if (message.success) {
                setIsLoginFailed(false);
                onLogin(loginUsername);
            } else {
                setIsLoginFailed(true);
                setLoginFailureMessage(message.message);
            }
        });

        return () => {
            unbind();
        }
    }, [loginUsername]);

    const handleLogin = (e) => {
        e.preventDefault();
        SignallingService.instance.login(loginUsername);
    };

    return (
        <form onSubmit={handleLogin}>

            <h2 className="text-lg mb-3">Welcome! What is your name?</h2>

            <input type="text" id="loginUsername" name="loginUsername" autoFocus
                   value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                   placeholder="username" className="block w-full border rounded border-gray-600 text-xl px-2 py-1 mb-5"/>

            <button type="submit" className="block w-full rounded bg-blue-500 text-white p-2 text-xl">Login</button>
            {isLoginFailed &&
            <div style={{color: 'red'}}>Failed to login: {loginFailureMessage}</div>
            }
        </form>
    );
}