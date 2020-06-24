export default function handleOffer(rtcConnectionData, signallingService, data) {
    const {rtcConnection} = rtcConnectionData;

    rtcConnection.ondatachannel = event => {
        rtcConnectionData.rtcChannel = event.channel;
        rtcConnectionData.rtcChannel.onopen = () => {
            rtcConnectionData.onChannelOpen();
        };
        rtcConnectionData.rtcChannel.onmessage = (event) => {
            rtcConnectionData.onMessage(event.data);
        };
        // onClose
    };

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