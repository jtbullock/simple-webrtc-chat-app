import { createNanoEvents} from "nanoevents";

export class RtcConnectionData
{
    constructor() {
        this.emitter = createNanoEvents();
    }

    onChannelOpen() {
        this.emitter.emit('channelOpen');
    }

    onAnswer(isAccepted) {
        this.emitter.emit('answer', isAccepted);
    }

    onMessage(data) {
        this.emitter.emit('message', data);
    }

    on(event, callback) {
        return this.emitter.on(event, callback);
    }
}