import PacketPatcher from "../packet_handler/packer_patcher";
import PacketMixer from "../packet_handler/packet_mixer";
import { TDataReciveCallback } from "../public/types";
import TClient from "../tunnel/client";
import ITransmission from "./itransmission";

export default class Client implements ITransmission {
    private clients: TClient[];
    private patcher: PacketPatcher;
    private mixer: PacketMixer;
    private dataReciveCallbacks: Array<TDataReciveCallback>;

    constructor(host: string, port: number, tunnelN: number) {
        this.clients = new Array<TClient>();
        this.patcher = new PacketPatcher(tunnelN)
        this.mixer = new PacketMixer(tunnelN);
        this.dataReciveCallbacks = new Array<TDataReciveCallback>();
        this.openTunnels(host, port, tunnelN);

        this.mixer.analyze((arg: number, data: Buffer) => {
            console.log("<", arg, data);
            this.dataReciveCallbacks.map((cb: TDataReciveCallback) => {
                cb(arg, data);
            });
        });
    }

    private openTunnels(host: string, port: number, n: number) {
        let targetPort = 0;
        for(let i:number = 0; i < n; i++) {
            targetPort = port + i;
            let tClient = new TClient(host, targetPort);
            this.clients.push(tClient);

            tClient.onDataRecived((data: Buffer) => {
                this.mixer.input(data);
            });
        }
    }

    sendData(data: Buffer, sourcePort: number): void {
        let splitBuffer = this.patcher.patch(data, sourcePort);

        console.log(">", sourcePort, data);
        this.clients.map((client: TClient, index: number) => {
            client.sendData(splitBuffer[index]);
        });
    }
    onDataRecived(callback: TDataReciveCallback): void {
        this.dataReciveCallbacks.push(callback);
    }
}