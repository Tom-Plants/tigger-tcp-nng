import { createConnection, Socket } from "net";
import Tunnel from "./tunnel";

export default class RawSocketClient extends Tunnel {
    constructor(host: string, port: number) {
        super();

        let client = new Socket();
        client.connect({host, port});

        client.on("connect", () => {
            this.setSocket(client);
            this._connected = true;
            for(let i of this.readyCallbacks) {
                i();
            }
        }).on("close", () => {
            this.removeSocket();
            client.connect({host, port});
            this._connected = false;
            for(let i of this.reconnectingCallbacks)  {
                i();
            }
        }).on("error", () => {});
    }
}