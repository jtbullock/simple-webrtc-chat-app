import React, { Fragment, useState, useEffect, useRef } from "react";
import { Header, Loader, Icon } from "semantic-ui-react";

export default function Chat({ connection, updateConnection, channel, updateChannel }) {
    const webSocket = useRef(null);
    const [socketOpen, setSocketOpen] = useState(false);
    const [socketMessage, setSocketMessages] = useState([]);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        webSocket.current = new WebSocket("ws://localhost:9000");
        webSocket.current.onmessage = message => {
            const data = JSON.parse(message.data);
            setSocketMessages(prev => [...prev, data]);
        };
        webSocket.current.onclose = () => {
            webSocket.current.close();
        };
        return () => webSocket.current.close();
    }, []);

    return (
        <div className="App">
            {alert}
            <Header as="h2" icon>
                <Icon name="users" />
                Simple WebRTC Chat App
            </Header>
            {(socketOpen && (
                <Fragment></Fragment>
            )) || (
                <Loader size="massive" active inline="centered">
                    Loading
                </Loader>
            )}
        </div>
    );
}