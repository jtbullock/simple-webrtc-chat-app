import {rtcPeerConnectionConfig} from '~/config';
import {RtcConnectionData} from "./RtcConnectionData";
import {logInfo} from "~/services/logging";

export default function createRtcConnection(signallingService, remoteUsername) {

    logInfo('Creating WebRTC Connection...');

    if (!signallingService) {
        throw new Error('RTCHostService: Missing required parameter \'signallingService\'');
    }

    if (remoteUsername == null || remoteUsername.trim() === '') {
        throw new Error('RTCHostService: Missing required parameter \'remoteUserName\'');
    }

    const rtcConnection = new RTCPeerConnection(rtcPeerConnectionConfig);

    const iceCandidates = [];

    const rtcConnectionData = new RtcConnectionData();
    rtcConnectionData.rtcConnection = rtcConnection;
    rtcConnectionData.iceCandidates = iceCandidates;
    rtcConnectionData.remoteUsername = remoteUsername;
    rtcConnectionData.signallingService = signallingService;

    rtcConnection.onicecandidate = event => {

        logInfo('ICE Candidate proposed');

        if (!event.candidate) return;

        if (!rtcConnection.remoteDescription) {
            logInfo('Remote description not yet set; adding to queue.');
            iceCandidates.push(event.candidate);
            return;
        }

        logInfo('Sending ICE Candidate to peer');
        signallingService.sendCandidate(remoteUsername, event.candidate);
    };

    signallingService.registerRtcService(remoteUsername, rtcConnectionData);

    return rtcConnectionData;
}
