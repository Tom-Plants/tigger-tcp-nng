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
    protected dataReciveCallbacks: Array<TDataReciveCallback>;

    private reconnectingCallbacks: Array<VoidCallBack>;
    private readyCallbacks: Array<VoidCallBack>;

    private host: string;
    private port: number;
    private tunnelN: number;

    /**
     * status == 0: init;
     * status == 1: connecting;
     * status == 2: ready;
     */
    private status: number;

    constructor(host: string, port: number, tunnelN: number)
    {
        this.patcher = new PacketPatcher(tunnelN);
        this.mixer = new PacketMixer(tunnelN);
        this.dataReciveCallbacks = new Array<TDataReciveCallback>();
        this.drainCallbacks = new Array<VoidCallBack>();
        this.reconnectingCallbacks = new Array<VoidCallBack>();
        this.readyCallbacks = new Array<VoidCallBack>();

        this.host = host;
        this.port = port;
        this.tunnelN = tunnelN;
        this.status = 0;

        this.mixer.analyze((arg: Number, data: Buffer) => {
            for(let i of this.dataReciveCallbacks) {
                i(arg.valueOf(), data);
            }
        });
    }

    onReconnecting(callback: VoidCallBack): void {
        this.reconnectingCallbacks.push(callback);
    }
    onReady(callback: VoidCallBack): void {
        this.readyCallbacks.push(callback);
    }

    protected setPeers(peers: Array<ITunnel>) {
        this.peers = peers;
        this.openTunnels(this.host, this.port, this.tunnelN);
    }

    protected getPeers(): Array<ITunnel> | undefined {
        return this.peers;
    }

    openTunnels(host: string, port: number, tunnelN: number) {
        if(this.peers == undefined) return;
        for(let value of this.peers) {
            value.onDataRecived((data: Buffer) => {
                this.mixer.input(data);
            });
            value.onDrain(() => {
                let stoped:boolean = false;
                if(this.peers == undefined) return;
                for(let i of this.peers)
                {
                    if(!i.isDrained()) {
                        stoped = true;
                    }

                }
                if(stoped) return;
                for(let i of this.drainCallbacks) {
                    i();
                }
            });
            value.onReady(() => {
                let allReady = true;
                if(this.peers == undefined) return;
                for(let i of this.peers) {
                    if(!i.connected()) {
                        allReady = false;
                        break;
                    }
                }
                if(allReady) {
                    this.status = 2;
                    for(let j of this.readyCallbacks) {
                        j();
                    }
                }
            });
            value.onReconnecting(() => {
                if(this.status == 2) {
                    this.status = 1;
                    for(let i of this.reconnectingCallbacks) {
                        i();
                    }
                }
            });
        }
        
    }


    sendData(data: Buffer, sourcePort: number): boolean {
        let splitBuffer = this.patcher.patch(data, sourcePort);
        let sendBlocked = false;
        //console.log(">", sourcePort, data);
        if(this.peers == undefined) throw "the peers is not set";
        for(let i in this.peers) {
            if(!this.peers[i].sendData(splitBuffer[parseInt(i)])) {
                sendBlocked = true;
            }
        }
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
        if(this.peers == undefined) throw "the peers is not set";
        for(let value of this.peers) {
            if(!value.isDrained()) paused = true;
        }
        return paused;
    }
}