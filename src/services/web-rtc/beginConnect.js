import createRtcConnection from "./createRtcConnection";

export default function beginConnect(remoteUsername, signallingService) {
    const rtcConnectionData = createRtcConnection(signallingService, remoteUsername);

    const {rtcConnection} = rtcConnectionData;

    rtcConnectionData.rtcChannel = rtcConnection.createDataChannel('sendChannel');

    rtcConnection.createOffer()
        .then(offer => rtcConnection.setLocalDescription(offer))
        .then(() => {
            // TODO if fail, unregister?
            signallingService.sendOffer(remoteUsername, rtcConnection.localDescription);
        })
        .catch(e => {
            console.log(e);
            throw new Error('Error sending offer to remote user.');
        });

    return rtcConnectionData;
}