import {rtcPeerConnectionConfig} from '~/config';

export default function createRtcConnection(signallingService, remoteUsername)
{
    if (!signallingService) {
        throw new Error('RTCHostService: Missing required parameter \'signallingService\'');
    }

    if (remoteUsername == null || remoteUsername.trim() === '') {
        throw new Error('RTCHostService: Missing required parameter \'remoteUserName\'');
    }

    const rtcConnection = new RTCPeerConnection(rtcPeerConnectionConfig);

    const iceCandidates = [];

    rtcConnection.onicecandidate = event => {
        if(!event.candidate) return;

        if(!rtcConnection.remoteDescription) {
            iceCandidates.push(event.candidate);
            return;
        }

        signallingService.sendCandidate(remoteUsername, event.candidate);
    }

    const rtcChannel = rtcConnection.createDataChannel('sendChannel');

    const rtcConnectionData = {
        rtcConnection,
        iceCandidates,
        rtcChannel,
        remoteUsername
    };

    signallingService.registerRtcService(remoteUsername, rtcConnectionData);

    return rtcConnectionData;
}
