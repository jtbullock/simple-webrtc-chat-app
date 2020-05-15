export default class SignallingService {

    constructor(socketUri)
    {
        this.socketUri = socketUri;
        this.webSocket = new WebSocket(this.socketUri);

        this.webSocket.onmessage = message => {
            this.onMessage(JSON.parse(message.data));
        };

        this.webSocket.onclose = () => {
            this.webSocket.close();
        };

        this.rtcServices = {};

        this.onLogin = () => {};
    }

    registerRtcService(name, service)
    {
        this.rtcServices.push({[name]: service});
    }

    onMessage(message)
    {
        switch(message.type) {
            case "login":
                this.onLogin(message);
                break;
            // case "offer":
            //     onOffer(message);
            //     break;
            // case "answer":
            //     onAnswer(message);
            //     break;
            // case "candidate":
            //     onCandidate(message);
            //     break;
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

    login(name) {
        this.send({type: "login", name});
    }
}