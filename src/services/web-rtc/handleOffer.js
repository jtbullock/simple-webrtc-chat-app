import createRtcConnection from "./createRtcConnection";

export default function handleOffer(signallingService, offer) {

    const rtcConnectionData = createRtcConnection(signallingService, offer.name);

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

    rtcConnection.setRemoteDescription(offer.offer)
        .then(() => rtcConnection.createAnswer())
        .then(answer => rtcConnection.setLocalDescription(answer))
        .then(() => signallingService.sendAnswer(offer.name, true, rtcConnection.localDescription))
        .then(() => {
            rtcConnectionData.remoteUsername = offer.name;
        })
        .catch(e => {
            console.log("Error sending answer: ");
            console.log(e);
        });

    return rtcConnectionData;
}