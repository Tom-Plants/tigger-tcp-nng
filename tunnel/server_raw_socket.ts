import { createServer, Socket } from "net";
import Tunnel from "./tunnel";

export default class RawSocketServer extends Tunnel {
    constructor(host: string, port: number) {
        super();
        let server = createServer();
        server.listen(port, host, () => {
            console.log("tunnel listening", host, ":", port);
        }).on("connection", (socket: Socket) => {
            if(this.hasSocket()) {
                socket.destroy();
                return;
            }

            this.setSocket(socket);
            this._connected = true;
            for(let i of this.readyCallbacks) {
                i();
            }
            console.log(port, "connected");
            socket.on("close", () => {
                this.removeSocket();
                this._connected = false;
                for(let i of this.reconnectingCallbacks) {
                    i();
                }
                console.log(port, "disconnected");
            }).on("error", () => {});
        });
    }
}