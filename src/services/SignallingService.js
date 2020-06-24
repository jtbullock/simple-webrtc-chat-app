import {socketServerUri as cSocketServerUri} from '../config';
import handleOffer from "./web-rtc/handleOffer";
import handleAnswer from "./web-rtc/handleAnswer";

let isConnected = false;

class SignallingService {

    constructor(socketServerUri = cSocketServerUri) {
        this.isLoggedIn = false;
        this.socketServerUri = socketServerUri;

        // Subscribers
        this.rtcServices = {};

        // Events
        this.onLogin = () => {
        };
        this.onOpen = () => {
        };
        this.onOffer = () => {
        };

        this.setupWebSocket();

        // Bind context
        this.login = this.login.bind(this);
    }

    setupWebSocket() {
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

    registerRtcService(name, service) {
        this.rtcServices[name] = service;
    }

    onMessage(message) {
        switch (message.type) {
            case "login":
                this.onLogin(message);
                break;
            case "offer":
                // const rtcConnectionData = this.rtcServices[message.name];
                // handleOffer(rtcConnectionData, this, message);
                this.onOffer(message);
                break;
            case "answer":
                const rtcConnectionData2 = this.rtcServices[message.name];
                handleAnswer(rtcConnectionData2, this, message);
                // this.handleAnswer(message);
                break;
            case "candidate":
                const rtcConnectionData3 = this.rtcServices[message.name];
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

    sendAnswer(name, isAccepted, answer) {
        this.send({type: 'answer', isAccepted, answer, name});
    }

    handleCandidate(message) {
        this.rtcServices[message.name].rtcConnection.addIceCandidate(message.candidate);
    }

    login(name) {
        this.send({type: "login", name});
    }
}

export default {
    instance: new SignallingService(),
    isConnected
};