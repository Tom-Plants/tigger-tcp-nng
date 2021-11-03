import { Server } from "net";
import { createServer, Socket } from "net";
import Tunnel from "./tunnel";

export default class RawSocketServer extends Tunnel {
    private server: Server;
    constructor(host: string, port: number) {
        super();
        this.server = createServer();
        this.server.listen(port, host, () => {
            console.log("tunnel listening", host, ":", port);
        }).on("connection", (socket: Socket) => {
            if(this.connected()) {
                socket.destroy();
                return;
            }

            this.setSocket(socket)
            .on("close", () => {
                this.removeSocket();
                this.tunnelDisconnected();
            }).on("error", () => {});

            this.tunnelConnected();
        });
    }

    public destroy(): void {
        this.server.close();
        super.destroy();
    }
}