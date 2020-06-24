import {rtcPeerConnectionConfig} from '~/config';
import {RtcConnectionData} from "./RtcConnectionData";

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

    const rtcConnectionData = new RtcConnectionData()
    rtcConnectionData.rtcConnection = rtcConnection;
    rtcConnectionData.iceCandidates = iceCandidates;
    rtcConnectionData.remoteUsername = remoteUsername;

    rtcConnection.onicecandidate = event => {
        if(!event.candidate) return;

        if(!rtcConnection.remoteDescription) {
            iceCandidates.push(event.candidate);
            return;
        }

        signallingService.sendCandidate(remoteUsername, event.candidate);
    }

    signallingService.registerRtcService(remoteUsername, rtcConnectionData);

    return rtcConnectionData;
}
