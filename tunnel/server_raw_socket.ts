import { Socket } from "net";
import getServer from "./socketcreator";
import Tunnel from "./tunnel";

export default class RawSocketServer extends Tunnel {
    constructor(host: string, port: number) {
        super();
        let server = getServer();
        server.listen(port, host, () => {
            console.log("tunnel listening", host, ":", port);
        }).on("connection", (socket: Socket) => {
            if(this.hasSocket()) {
                socket.destroy();
                return;
            }

            this.setSocket(socket);
            socket.on("close", () => {
                this.removeSocket();
            })
            .on("error", () => {});
        });
    }
}