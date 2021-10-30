import { createConnection, Socket } from "net";
import Tunnel from "./tunnel";

export default class RawSocketClient extends Tunnel {
    constructor(host: string, port: number) {
        super();

        let client = new Socket();
        client.connect({host, port}, () => {
            this.setSocket(client);
        });

        client.on("close", () => {
            this.removeSocket();
            client.connect({host, port});
        }).on("error", () => {});
    }
}