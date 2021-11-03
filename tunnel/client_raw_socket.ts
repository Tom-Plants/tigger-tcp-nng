import { createConnection, Socket } from "net";
import Tunnel from "./tunnel";

export default class RawSocketClient extends Tunnel {
    constructor(host: string, port: number) {
        super();

        let client = new Socket();
        client.connect({host, port})
        .on("connect", () => {
            this.setSocket(client);
            this.tunnelConnected();
        }).on("close", () => {
            this.removeSocket();
            this.tunnelDisconnected();
            client.connect({host, port});
        }).on("error", () => {});
    }
}