export default function handleOffer(rtcConnectionData, signallingService, data) {
    const {rtcConnection} = rtcConnectionData;

    rtcConnection.setRemoteDescription(data.offer)
        .then(() => rtcConnection.createAnswer())
        .then(answer => rtcConnection.setLocalDescription(answer))
        .then(() => signallingService.sendAnswer(data.name, true, rtcConnection.localDescription))
        .then(() => {
            rtcConnectionData.remoteUsername = data.name;
        })
        .catch(e => {
            console.log("Error sending answer: ");
            console.log(e);
        });
}