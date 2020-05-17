import {rtcPeerConnectionConfig} from '../config';

export default class RTCHostService {

    constructor(signallingService, name)
    {
        if(!signallingService) {
            throw new Error('RTCHostService: Missing required parameter \'signallingService\'');
        }

        if(name == null || name.trim() === '')
        {
            throw new Error('RTCHostService: Missing required parameter \'name\'');
        }

        this.signallingService = signallingService;
        this.signallingService.registerRtcService(this.localName, this);

        this.localName = name;
        this.channelState = "closed";

        this.iceCandidates = [];

        this.constructPeerConnection();
    }

    constructPeerConnection()
    {
        this.rtcPeerConnection = new RTCPeerConnection(rtcPeerConnectionConfig);

        this.rtcPeerConnection.onicecandidate = event => {
            if(!event.candidate) return;

            if(!this.rtcPeerConnection.remoteDescription) {
                this.iceCandidates.push(event.candidate);
                return;
            }

            this.signallingService.sendCandidate(this.inviteeName, event.candidate);

        }

        this.rtcChannel = this.rtcPeerConnection.createDataChannel('sendChannel');
        this.rtcChannel.onopen = e => this.channelState = e.readyState;
        this.rtcChannel.onclose = e => this.channelState = e.readyState;
    }

    beginConnect(inviteeName)
    {
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

    acceptAnswer(answer)
    {
        this.signallingService.setRemoteDescription(answer);
    }

    addCandidate(candidate) {
        console.log("Adding candidate.");
        this.rtcPeerConnection.addIceCandidate(candidate);
    };
}