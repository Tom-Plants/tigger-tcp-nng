import { createConnection } from "net";
import Tunnel from "./tunnel";

export default class RawSocketClient extends Tunnel {
    constructor(host: string, port: number) {
        super();

        let client = createConnection({host, port});

        client.on("connect", () => {
            this.setSocket(client);
        }).on("close", () => {
            this.removeSocket();
            client.connect({host, port});
        }).on("error", () => {});
    }
}