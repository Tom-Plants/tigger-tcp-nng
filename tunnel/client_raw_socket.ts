import { createConnection, Socket } from "net";
import Tunnel from "./tunnel";

export default class RawSocketClient extends Tunnel {
    private isClose: boolean;
    constructor(host: string, port: number) {
        super();

        this.isClose = false;

        let client = new Socket();
        client.connect({host, port})
        .on("connect", () => {
            this.setSocket(client);
            this.tunnelConnected();
        }).on("close", () => {
            this.removeSocket();
            this.tunnelDisconnected();
            if(!this.isClose) client.connect({host, port});
        }).on("error", () => {});
    }

    public destroy(): void {
        this.isClose = true;
        super.destroy();
    }
}