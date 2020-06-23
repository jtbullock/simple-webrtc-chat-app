export default function handleAnswer(rtcConnectionData, signallingService, answer) {
    const {rtcConnection, iceCandidates, remoteUsername} = rtcConnectionData;

    if (answer.isAccepted) {
        rtcConnection.setRemoteDescription(answer.answer);

        while (iceCandidates.length) {
            signallingService.sendCandidate(remoteUsername, iceCandidates.pop());
        }
    }
}