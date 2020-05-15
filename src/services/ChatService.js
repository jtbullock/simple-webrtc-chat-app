import SignallingService from './SignallingService';
import { socketServerUri } from '../config/index';

export default class ChatService
{
    constructor()
    {
        this.signallingService = new SignallingService(socketServerUri);

        this.onLogin = () => {};
        this.handleLogin = message => {
            this.onLogin(message);
        };

        this.signallingService.onLogin = this.handleLogin;
    }

    login(username)
    {
        this.signallingService.login(username);
    }
}



