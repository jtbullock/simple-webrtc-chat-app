export default function handleAnswer(rtcConnectionData, answer) {
    const {rtcConnection, iceCandidates, remoteUsername, signallingService, rtcChannel} = rtcConnectionData;
    const {isAccepted} = answer;

    rtcConnectionData.onAnswer(isAccepted);

    if (isAccepted) {
        rtcConnection.setRemoteDescription(answer.answer)
            .catch(e => {
                console.log("Failed to set remote description.");
                console.log(e);
            });

        while (iceCandidates.length) {
            signallingService.sendCandidate(remoteUsername, iceCandidates.pop());
        }

        rtcChannel.onmessage = (event) => {
            rtcConnectionData.onMessage(event.data);
        };
    }
}