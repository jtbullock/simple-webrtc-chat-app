import React from "react";
import Chat from "./Chat";

import { ConnectionConsumer, ChannelConsumer } from './App';

export default function Container() {
    return (
        <ConnectionConsumer>
            {({ connection, updateConnection }) => (
                <ChannelConsumer>
                    {({ channel, updateChannel }) => (
                        <Chat
                            connection={connection}
                            updateConnection={updateConnection}
                            channel={channel}
                            updateChannel={updateChannel}
                        />
                    )}
                </ChannelConsumer>
            )}
        </ConnectionConsumer>
    )
}