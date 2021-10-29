import { createConnection, Socket } from "net";
import Tunnel from "./tunnel";

export default class RawSocketClient extends Tunnel {
    constructor(host: string, port: number) {
        super();

        console.log("Tunnel被构造了");
        let client = new Socket();
        client.connect({host, port}, () => {
            console.log("Tunnel链接成功");
            this.setSocket(client);
        });

        client.on("close", () => {
            this.removeSocket();
            client.connect({host, port});
        }).on("error", () => { });
    }
}