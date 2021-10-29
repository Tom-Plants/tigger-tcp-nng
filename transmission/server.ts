import TServer from "../tunnel/server_raw_socket";
import ITransmission from "./itransmission";
import Transmission from "./transmission";

export default class Server extends Transmission implements ITransmission {
    constructor(host:string, port: number, n: number) {
        super(host, port, n);
        this.setPeers(new Array<TServer>());
    }
    openTunnels(host: string, port: number, n: number) {
        let targetPort = 0;
        for(let i:number = 0; i < n; i++) {
            targetPort = port + i;
            let tClient = new TServer(host, targetPort);
            this.getPeers()?.push(tClient);
        }

        super.openTunnels(host, port, n);
    }
}