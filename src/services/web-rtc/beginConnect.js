export default function beginConnect(rtcConnectionData, signallingService) {
    const {rtcConnection, remoteUsername} = rtcConnectionData;

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
}