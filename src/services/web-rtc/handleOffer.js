import createRtcConnection from "./createRtcConnection";
import {logInfo} from "~/services/logging";

export default function handleOffer(signallingService, offer) {

    const rtcConnectionData = createRtcConnection(signallingService, offer.name);

    const {rtcConnection} = rtcConnectionData;

    logInfo('Wiring up rtcConnection event ondatachannel listener');
    rtcConnection.ondatachannel = event => {
        logInfo('On datachannel fired; setting rtcChannel and adding listeners');
        rtcConnectionData.rtcChannel = event.channel;
        rtcConnectionData.rtcChannel.onopen = () => {
            logInfo('rtcChannel onopen fired');
            rtcConnectionData.onChannelOpen();
        };
        rtcConnectionData.rtcChannel.onmessage = (event) => {
            logInfo('RtcChannel onmessage fired');
            rtcConnectionData.onMessage(event.data);
        };
        // onClose
    };

    logInfo('Handling offer and sending answer');
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