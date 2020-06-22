import {rtcPeerConnectionConfig} from '../config';

export default class RTCHostService {

    constructor(signallingService, name) {
        if (!signallingService) {
            throw new Error('RTCHostService: Missing required parameter \'signallingService\'');
        }

        if (name == null || name.trim() === '') {
            throw new Error('RTCHostService: Missing required parameter \'name\'');
        }

        this.signallingService = signallingService;
        this.localName = name;

        this.iceCandidates = [];

        this.constructPeerConnection();
        this.signallingService.registerRtcService(this.localName, this);

        this.onChannelOpen = () => {
        };
        this.onMessage = () => {
        };
        this.onInviteAnswer = () => {
        };
    }

    constructPeerConnection() {
        this.rtcPeerConnection = new RTCPeerConnection(rtcPeerConnectionConfig);

        this.rtcPeerConnection.onicecandidate = event => {
            if (!event.candidate) return;

            if (!this.rtcPeerConnection.remoteDescription) {
                this.iceCandidates.push(event.candidate);
                return;
            }

            this.signallingService.sendCandidate(this.inviteeName, event.candidate);
        };

        this.rtcChannel = this.rtcPeerConnection.createDataChannel('sendChannel');
        // this.rtcChannel.onopen = () => this.onChannelOpen();
        this.rtcChannel.onopen = () => console.log('channel open');
        this.rtcChannel.onmessage = event => this.onMessage(event.data);
        // this.rtcChannel.onclose = e => this.channelState = e.readyState;
    }

    beginConnect(inviteeName) {
        this.inviteeName = inviteeName;

        this.rtcPeerConnection.createOffer()
            .then(offer => this.rtcPeerConnection.setLocalDescription(offer))
            .then(() => {
                // TODO if fail, unregister?
                this.signallingService.sendOffer(this.inviteeName, this.rtcPeerConnection.localDescription);
            })
            .catch(e => {
                console.log(e);
                throw new Error('Error sending offer to remote user.');
            });
    }

    handleAnswer(answer) {
        this.onInviteAnswer(answer.isAccepted);

        if (answer.isAccepted) {
            this.onInviteAnswer();
            this.rtcPeerConnection.setRemoteDescription(answer.answer);

            while (this.iceCandidates.length) {
                this.signallingService.sendCandidate(this.inviteeName, this.iceCandidates.pop());
            }
        }
    }

    addCandidate(candidate) {
        this.rtcPeerConnection.addIceCandidate(candidate);
    }

    sendMessage(messageText) {
        this.rtcChannel.send(messageText);
    }
}