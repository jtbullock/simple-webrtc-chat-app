export default function beginConnect(rtcConnectionData, signallingService) {
    const {rtcConnection, remoteUsername} = rtcConnectionData;

    const rtcChannel = rtcConnection.createDataChannel('sendChannel');

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

    rtcConnectionData.rtcChannel = rtcChannel;
}