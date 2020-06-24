import {socketServerUri as cSocketServerUri} from '../config';
import handleOffer from "./web-rtc/handleOffer";
import handleAnswer from "./web-rtc/handleAnswer";
import {createNanoEvents} from "nanoevents";

let isConnected = false;

class SignallingService {

    constructor(socketServerUri = cSocketServerUri) {
        this.isLoggedIn = false;
        this.socketServerUri = socketServerUri;

        // Subscribers
        this.rtcServices = {};

        // Events
        this.emitter = createNanoEvents();

        this.setupWebSocket();

        // Bind context
        this.login = this.login.bind(this);
    }

    setupWebSocket() {
        this.webSocket = new WebSocket(this.socketServerUri);

        this.webSocket.onopen = () => {
            isConnected = true;
            this.emitter.emit('open');
        };

        this.webSocket.onmessage = message => {
            this.handleMessage(JSON.parse(message.data));
        };

        this.webSocket.onclose = () => {
            this.webSocket.close();
        };
    }

    registerRtcService(name, service) {
        this.rtcServices[name] = service;
    }

    // Handlers
    handleMessage(message) {
        switch (message.type) {
            case "login":
                this.emitter.emit('login', message);
                break;
            case "offer":
                this.emitter.emit('offer', message);
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

    handleCandidate(message) {
        this.rtcServices[message.name].rtcConnection.addIceCandidate(message.candidate);
    }

    handleAnswer(message) {
        const rtcConnectionData = this.rtcServices[message.name];
        handleAnswer(rtcConnectionData, this, message);
    }

    // Senders
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

    login(name) {
        this.send({type: "login", name});
    }

    // Event facade
    on(event, callback) {
        return this.emitter.on(event, callback);
    }
}

export default {
    instance: new SignallingService(),
    isConnected
};