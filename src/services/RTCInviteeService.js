import config from '../config';

export default class RTCInviteeService
{
    constructor(signallingService)
    {
        this.rtcPeerConnection = new RTCPeerConnection(config.rtcPeerConnectionConfig);
        this.rtcPeerConnection.ondatachannel = 
    }
}