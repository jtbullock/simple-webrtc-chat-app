import * as config from '../config';

export default class RTCInviteeService
{
    constructor(signallingService, name)
    {
        this.rtcPeerConnection = new RTCPeerConnection(config.rtcPeerConnectionConfig);

        if(!signallingService) {
            throw new Error('RTCHostService: Missing required parameter \'signallingService\'');
        }

        this.signallingService = signallingService;
        this.localName = name;

        this.signallingService.registerRtcService(this.localName, this);

        this.rtcPeerConnection.ondatachannel = event => {
            this.rtcChannel = event.channel;
            // onMessage
            // onOpen
            // onClose
        };

        this.rtcPeerConnection.onicecandidate = event => {
            if(event.candidate)
            {
                this.signallingService.sendCandidate(this.hostName, event.candidate);
            }
        };
    }

    acceptOffer(data) {
        this.rtcPeerConnection.setRemoteDescription(data.offer)
            .then(() => this.rtcPeerConnection.createAnswer())
            .then(answer => this.rtcPeerConnection.setLocalDescription(answer))
            .then(() => this.signallingService.sendAnswer(this.rtcPeerConnection.localDescription, data.name))
            .then(() => {
                this.hostName = data.name;
            })
            .catch(e => {
                console.log("Error sending answer: ");
                console.log(e);
            });
    }

    addCandidate(candidate) {
        console.log("Adding candidate.");
        this.rtcPeerConnection.addIceCandidate(candidate);
    };
}