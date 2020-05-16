import {rtcPeerConnectionConfig} from '../config';

export default class RTCHostService {

    constructor(signallingService, inviteeName)
    {
        if(!signallingService) {
            throw new Error('RTCHostService: Missing required parameter \'signallingService\'');
        }

        if(inviteeName == null || inviteeName.trim() === '')
        {
            throw new Error('RTCHostService: Missing required parameter \'inviteeName\'');
        }

        this.signallingService = signallingService;
        this.inviteeName = inviteeName;
        this.channelState = "closed";

        this.constructPeerConnection();
    }

    constructPeerConnection()
    {
        this.rtcPeerConnection = new RTCPeerConnection(rtcPeerConnectionConfig);

        this.rtcPeerConnection.onicecandidate = event => {
            if(event.candidate)
            {
                this.signallingService.sendCandidate(this.inviteeName, event.candidate);
            }
        }

        this.rtcChannel = this.rtcPeerConnection.createDataChannel('sendChannel');
        this.rtcChannel.onopen = e => this.channelState = e.readyState;
        this.rtcChannel.onclose = e => this.channelState = e.readyState;
    }

    beginConnect()
    {
        this.rtcPeerConnection.createOffer()
            .then(offer => this.rtcPeerConnection.setLocalDescription(offer))
            .then(() => {
                // TODO if fail, unregister?
                this.signallingService.registerRtcService(this.inviteeName, this);
                this.signallingService.sendOffer(this.inviteeName, this.rtcPeerConnection.localDescription);
            })
            .catch(e => { 
                console.log(e);
                throw new Error('Error sending offer to remote user.');
            });
    }



}