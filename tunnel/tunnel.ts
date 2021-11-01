import { Socket } from "net";
import { DataReciveCallback, VoidCallBack } from "../public/types";
import ITunnel from "./itunnel";

export default class Tunnel implements ITunnel {

    private socket: Socket | undefined;
    private idleBuffer: Array<Buffer>;
    private reciveBuffer: Buffer | null | undefined;
    private reciveCallbacks: Array<DataReciveCallback>;
    private drainCallbacks: Array<VoidCallBack>;
    protected readyCallbacks: Array<VoidCallBack>;
    protected reconnectingCallbacks: Array<VoidCallBack>;
    protected _connected: boolean;


    constructor() {
        this.idleBuffer = new Array<Buffer>();
        this.reciveCallbacks = new Array<DataReciveCallback>();
        this.drainCallbacks = new Array<VoidCallBack>();
        this.readyCallbacks = new Array<VoidCallBack>();
        this.reconnectingCallbacks = new Array<VoidCallBack>();
        this._connected = false;
    }
    connected(): boolean {
        return this._connected;
    }
    onReady(callback: VoidCallBack): void {
        this.readyCallbacks.push(callback);
    }
    onReconnecting(callback: VoidCallBack): void {
        this.reconnectingCallbacks.push(callback);
    }
    public onDrain(callback: VoidCallBack): void {
        this.drainCallbacks.push(callback);
    }

    public sendData(data: Buffer): boolean {
        let bufferlength = data.length;
        let length_buffer = Buffer.from([0, 0, 0, 0]);
        length_buffer.writeUInt32LE(bufferlength);
        let buffer_send = Buffer.concat([length_buffer, data]);

        this.idleBuffer.push(buffer_send);
        return this.pushData();
    }
    public onDataRecived(callback: DataReciveCallback): void {
        this.reciveCallbacks.push(callback);
    }

    protected setSocket(socket: Socket) {
        this.socket = socket;
        socket.on("drain", () => {
            if(this.pushData()) {
                for(let callback of this.drainCallbacks) {
                    callback();
                }
            }
        }).on("data", (data: Buffer) => {
            this.handleData(data);
        });

        socket.setKeepAlive(true, 1000);
    }
    protected removeSocket() {
        this.socket?.destroy();
        this.socket = undefined;
    }
    protected hasSocket(): boolean {
        if(this.socket == undefined) return false;
        return true;
    }

    private pushData(): boolean {
        if(this.socket == undefined) return false;
        while(true) {
            let data:Buffer | undefined = this.idleBuffer.shift();
            if(data == undefined) return true;
            if(this.socket.write(data) == false) return false;
            continue;
        }
    }

    public isDrained():boolean {
        return (this.idleBuffer.length == 0);
    }

    
    /**
     * 处理粘包分包
     * @param data 处理粘包分包
     */
    private handleData(data: Buffer) {
        let d1:Buffer = data;

        if(this.reciveBuffer != null)
        {
            d1 = Buffer.concat([this.reciveBuffer, d1]);
        }

        let packet_length: number;

        //根据当前包头定义的包长度，截取剩余部分，或者等待剩余部分，然后调用recivecb
        while(true)
        {
            if(d1.length <= 4)
            {
                this.reciveBuffer = d1;
                break;
            }
            packet_length = d1.readUInt32LE(0);

            if(packet_length == d1.length - 4)
            {
                this.reciveBuffer = null;
                for(let value of this.reciveCallbacks) {
                    value(d1.slice(4, d1.length));
                }
                break;
            }else {
                if(packet_length > d1.length - 4) //没接收完
                {
                    this.reciveBuffer = d1;
                    break;
                }
                else if(packet_length < d1.length - 4) //接过头了
                {
                    //有可能多次接过头，则循环处理
                    let left = d1.slice(4, packet_length + 4);
                    let right = d1.slice(packet_length + 4, d1.length);

                    for(let value of this.reciveCallbacks) {
                        value(left);
                    }
                    this.reciveBuffer = right;
                    d1 = right;
                }
            }
        }
    }
}