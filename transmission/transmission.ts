import PacketMixer from "../packet_handler/packet_mixer";
import PacketPatcher from "../packet_handler/packet_patcher";
import { TDataReciveCallback, VoidCallBack } from "../public/types";
import ITunnel from "../tunnel/itunnel";
import ITransmission from "./itransmission";

export default class Transmission implements ITransmission {
    private peers: Array<ITunnel> | undefined;
    private patcher: PacketPatcher;
    private mixer: PacketMixer;
    private drainCallbacks: Array<VoidCallBack>;
    private dataReciveCallbacks: Array<TDataReciveCallback>;

    private host: string;
    private port: number;
    private tunnelN: number;

    constructor(host: string, port: number, tunnelN: number)
    {
        this.patcher = new PacketPatcher(tunnelN);
        this.mixer = new PacketMixer(tunnelN);
        this.dataReciveCallbacks = new Array<TDataReciveCallback>();
        this.drainCallbacks = new Array<VoidCallBack>();

        this.host = host;
        this.port = port;
        this.tunnelN = tunnelN;

        this.mixer.analyze((arg: Number, data: Buffer) => {
            this.dataReciveCallbacks.map((cb: TDataReciveCallback) => {
                cb(arg.valueOf(), data);
            });
        });
    }

    protected setPeers(peers: Array<ITunnel>) {
        this.peers = peers;
        this.openTunnels(this.host, this.port, this.tunnelN);
    }

    protected getPeers(): Array<ITunnel> | undefined {
        return this.peers;
    }

    openTunnels(host: string, port: number, tunnelN: number) {
        this.peers?.map((value: ITunnel) => {
            value.onDataRecived((data: Buffer) => {
                this.mixer.input(data);
            });
            value.onDrain(() => {
                let stoped:boolean = false;
                this.peers?.map((value: ITunnel ) => {
                    if(!value.isDrained()) {
                        stoped = true;
                    }
                });
                if(stoped) return;
                this.drainCallbacks.map((value: VoidCallBack) => {
                    value();
                });
            });
        });
    }


    sendData(data: Buffer, sourcePort: number): boolean {
        let splitBuffer = this.patcher.patch(data, sourcePort);
        let sendBlocked = false;
        //console.log(">", sourcePort, data);
        this.peers?.map((client: ITunnel, index: number) => {
            if(!client.sendData(splitBuffer[index])) {
                sendBlocked = true;
            }
        });
        return !sendBlocked;
    }
    onDataRecived(callback: TDataReciveCallback): void {
        this.dataReciveCallbacks.push(callback);
    }
    onDrain(callback: VoidCallBack): void {
        this.drainCallbacks.push(callback);
    }

    isPaused(): boolean {
        let paused = false;
        this.peers?.map((value: ITunnel) => {
            if(!value.isDrained()) paused = true;
        });
        return paused;
    }
}