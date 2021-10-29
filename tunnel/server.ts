import ITunnel from "./itunnel";
import {socket, Socket} from "nanomsg";
import { DataReciveCallback, VoidCallBack } from "../public/types";

export default class Server implements ITunnel {
    private pair: Socket;
    private dataReciveCallbacks: DataReciveCallback[];

    constructor(host: string, port: number) {
        this.pair = socket("pair", {
            rcvmaxsize: -1,
            reconn: 100,
            maxreconn: 0,
            sndbuf: 1024*1024*100,
            rcvbuf: 1024*1024*100,
            sndtimeo: 1000*5
        });
        this.dataReciveCallbacks = new Array<DataReciveCallback>();
        this.init(host, port);
    }
    onDrain(callback: VoidCallBack): void {
    }
    isDrained(): boolean {
        return false;
    }
    stop(): void {
    }
    continue(): void {
    }

    private init(host: string, port: number) {
        this.pair.bind("tcp://" + host + ":" + port.toString());
        this.pair.on("data", (data: Buffer) => {
            this.dataReciveCallbacks.map((item: DataReciveCallback) => {
                item(data);
            });
        });
    }

    sendData(data: Buffer): boolean{
        this.pair.send(data);
        return true;
    }
    onDataRecived(callback: DataReciveCallback): void {
        this.dataReciveCallbacks.push(callback);
    }

}