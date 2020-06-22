import * as config from '../config';

export default class RTCInviteeService {
    constructor(signallingService, name) {
        if (!signallingService) {
            throw new Error('RTCHostService: Missing required parameter \'signallingService\'');
        }

        if (name == null || name.trim() === '') {
            throw new Error('RTCHostService: Missing required parameter \'name\'');
        }

        this.signallingService = signallingService;
        this.localName = name;

        this.rtcPeerConnection = new RTCPeerConnection(config.rtcPeerConnectionConfig);
        this.signallingService.registerRtcService(this.localName, this);

        this.rtcPeerConnection.ondatachannel = event => {
            this.rtcChannel = event.channel;
            this.rtcChannel.onopen = () => console.log('Channel open');
            this.rtcChannel.onmessage = event => this.onMessage(event.data);
            // onOpen
            // onClose
        };

        this.rtcPeerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.signallingService.sendCandidate(this.hostName, event.candidate);
            }
        };

        this.onChannelOpen = () => {};
        this.onMessage = () => {};
    }

    acceptOffer(data) {
        this.rtcPeerConnection.setRemoteDescription(data.offer)
            .then(() => this.rtcPeerConnection.createAnswer())
            .then(answer => this.rtcPeerConnection.setLocalDescription(answer))
            .then(() => this.signallingService.sendAnswer(data.name, true, this.rtcPeerConnection.localDescription))
            .then(() => {
                this.hostName = data.name;
            })
            .catch(e => {
                console.log("Error sending answer: ");
                console.log(e);
            });
    }

    declineOffer(data) {
        this.signallingService.sendAnswer(data.name, false);
    }

    addCandidate(candidate) {
        this.rtcPeerConnection.addIceCandidate(candidate);
    }

    sendMessage(messageText) {
        this.rtcChannel.send(messageText);
    }
}