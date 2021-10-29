import { createConnection } from "net";
import Tunnel from "./tunnel";

export default class RawSocketClient extends Tunnel {
    constructor(host: string, port: number) {
        super();
        console.log("connect out");
        let client = createConnection({host, port}, () => {
            console.log(host, port, "connected");
        });

        client.on("connect", () => {
            this.setSocket(client);
        }).on("close", () => {
            this.removeSocket();
            client.connect({host, port});
        }).on("error", () => {});
    }
}