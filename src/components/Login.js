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
            <label htmlFor="loginUsername">Username:
                <input type="text" id="loginUsername" name="loginUsername" autoFocus
                       value={loginUsername} onChange={e => setLoginUsername(e.target.value)}/>
                <button type="submit">Login</button>
            </label>
            {isLoginFailed &&
            <div style={{color: 'red'}}>Failed to login: {loginFailureMessage}</div>
            }
        </form>
    );
}