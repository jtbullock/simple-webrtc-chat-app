import createRtcConnection from "./createRtcConnection";
import {logInfo} from "~/services/logging";

export default function beginConnect(remoteUsername, signallingService) {
    const rtcConnectionData = createRtcConnection(signallingService, remoteUsername);

    const {rtcConnection} = rtcConnectionData;

    logInfo('Creating data channel');
    rtcConnectionData.rtcChannel = rtcConnection.createDataChannel('sendChannel');

    rtcConnection.createOffer()
        .then(offer => rtcConnection.setLocalDescription(offer))
        .then(() => {
            // TODO if fail, unregister?
            logInfo('Sending offer to peer');
            signallingService.sendOffer(remoteUsername, rtcConnection.localDescription);
        })
        .catch(e => {
            console.log(e);
            throw new Error('Error sending offer to remote user.');
        });

    return rtcConnectionData;
}