export default function handleAnswer(rtcConnectionData, answer) {
    const {rtcConnection, rtcChannel, iceCandidates, remoteUsername, signallingService} = rtcConnectionData;
    const {isAccepted} = answer;

    rtcConnectionData.onAnswer(isAccepted);

    if (isAccepted) {
        rtcConnection.setRemoteDescription(answer.answer);

        rtcChannel.onmessage = (event) => {
            rtcConnectionData.onMessage(event.data);
        };

        while (iceCandidates.length) {
            signallingService.sendCandidate(remoteUsername, iceCandidates.pop());
        }
    }
}