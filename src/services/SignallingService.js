import {socketServerUri as cSocketServerUri} from '../config';

let isConnected = false;

class SignallingService {

    constructor(socketServerUri = cSocketServerUri)
    {
        this.isLoggedIn = false;
        this.socketServerUri = socketServerUri;
        
        // Subscribers
        this.rtcServices = {};

        // Events
        this.onLogin = () => {};
        this.onOpen = () => {};
        this.onOffer = () => {};

        this.setupWebSocket();
    }

    setupWebSocket()
    {
        this.webSocket = new WebSocket(this.socketServerUri);

        this.webSocket.onopen = () => {
            isConnected = true;
            this.onOpen();
        };

        this.webSocket.onmessage = message => {
            this.onMessage(JSON.parse(message.data));
        };

        this.webSocket.onclose = () => {
            this.webSocket.close();
        };
    }

    registerRtcService(name, service)
    {
        this.rtcServices[name] = service;
    }

    onMessage(message)
    {
        switch(message.type) {
            case "login":
                this.isLoggedIn = true;
                this.onLogin(message);
                break;
            case "offer":
                this.onOffer(message);
                break;
            case "answer":
                this.handleAnswer(message);
                break;
            case "candidate":
                this.handleCandidate(message);
                break;
            default:
                break;
        }
    }

    send(data) {
        this.webSocket.send(JSON.stringify(data));
    }

    sendOffer(name, offer) {
        this.send({type: "offer", offer, name});
    }

    sendCandidate(name, candidate) {
        this.send({type: "candidate", name, candidate});
    }

    sendAnswer(name, answer) {
        this.send({type: 'answer', answer, name});
    }

    handleAnswer(message) {
        this.rtcServices[message.name].acceptAnswer(message.answer);
    }

    handleCandidate(message) {
        this.rtcServices[message.name].addCandidate(message.candidate);
    }

    login(name) {
        if(this.isLoggedIn)
        {
            throw new Error("User is already logged in.");
        }

        this.send({type: "login", name});
    }
}

export default {
    instance: new SignallingService(),
    isConnected
};