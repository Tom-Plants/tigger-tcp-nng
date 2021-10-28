import { TDataReciveCallback } from "../public/types";
import ITransmission from "./itransmission";
import TServer from "../tunnel/server";
import PacketPatcher from "../nummed_packet_handler/packet_patcher";
import PacketMixer from "../nummed_packet_handler/packet_mixer";

export default class Server implements ITransmission {
    private servers: TServer[];
    private patcher: PacketPatcher;
    private mixer: PacketMixer;
    private dataReciveCallbacks: Array<TDataReciveCallback>;

    constructor(host: string, port: number, tunnelN: number) {
        this.servers = new Array<TServer>();
        this.patcher = new PacketPatcher(tunnelN);
        this.mixer = new PacketMixer(tunnelN);
        this.dataReciveCallbacks = new Array<TDataReciveCallback>();
        this.openServers(host, port, tunnelN);

        this.mixer.onNummedPacketRecived((arg: Number, data: Buffer) => {

            console.log("<", arg, data);
            this.dataReciveCallbacks.map((cb: TDataReciveCallback) => {
                cb(arg.valueOf(), data);
            });
        });
    }

    private openServers(host: string, port: number, n: number) {
        let targetPort = 0;
        for(let i:number = 0; i < n; i++) {
            targetPort = port + i;
            let tServer = new TServer(host, targetPort);
            this.servers.push(tServer);

            tServer.onDataRecived((data: Buffer) => {
                this.mixer.input(data);
            });
        }
    }

    sendData(data: Buffer, sourcePort: number): void {
        let splitBuffer = this.patcher.patch(data, sourcePort);

        console.log(">", sourcePort, data);
        this.servers.map((client: TServer, index: number) => {
            client.sendData(splitBuffer[index]);
        });
    }
    onDataRecived(callback: TDataReciveCallback): void {
        this.dataReciveCallbacks.push(callback);
    }

}