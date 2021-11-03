import { Socket } from "net";
import { DataReciveCallback, VoidCallBack } from "../public/types";
import ITunnel from "./itunnel";

export default class Tunnel implements ITunnel {

    private socket: Socket | undefined;
    private idleBuffer: Array<Buffer>;
    private reciveBuffer: Buffer | null | undefined;
    private reciveCallbacks: Array<DataReciveCallback>;
    private drainCallbacks: Array<VoidCallBack>;
    private readyCallbacks: Array<VoidCallBack>;
    private reconnectingCallbacks: Array<VoidCallBack>;
    private _connected: boolean;


    constructor() {
        this.idleBuffer = new Array<Buffer>();
        this.reciveCallbacks = new Array<DataReciveCallback>();
        this.drainCallbacks = new Array<VoidCallBack>();
        this.readyCallbacks = new Array<VoidCallBack>();
        this.reconnectingCallbacks = new Array<VoidCallBack>();
        this._connected = false;
    }

    /**
     * 释放Tunnel占用的一些资源，并且断开连接
     */
    public destroy(): void {
        this.removeSocket();
        this.idleBuffer.length = 0;
        this.reciveBuffer = null;
        this.reciveCallbacks.length = 0;
        this.drainCallbacks.length = 0;
        this.readyCallbacks.length = 0;
        this.reconnectingCallbacks.length = 0;
    }

    /**
     * true表示已连接，false表示未连接
     * @returns true表示已连接，false表示未连接
     */
    public connected(): boolean {
        return this._connected;
    }

    /**
     * 注册连接成功事件
     * @param callback 连接成功回调
     */
    public onReady(callback: VoidCallBack): void {
        this.readyCallbacks.push(callback);
    }

    /**
     * 注册“连接断开，并尝试重连”的事件
     * @param callback 连接断开回调
     */
    public onReconnecting(callback: VoidCallBack): void {
        this.reconnectingCallbacks.push(callback);
    }

    /**
     * 向Tunnel指示已经成功连接
     */
    protected tunnelConnected(): void {
        this._connected = true;
        for(let i of this.readyCallbacks)
        {
            i();
        }
    }
    /**
     * 向Tunnel指示连接已断开
     */
    protected tunnelDisconnected(): void {
        this._connected = false;
        for(let i of this.reconnectingCallbacks)
        {
            i();
        }
    }

    /**
     * Tunnel内的数据已经无拥塞
     * @param callback Tunnel Drian callback
     */
    public onDrain(callback: VoidCallBack): void {
        this.drainCallbacks.push(callback);
    }

    /**
     * 将数据发送到已连接到的对端
     * @param data 将要发送的数据
     * @returns 当返回false时，表示发送成功但缓冲区已满，需要限流，反之亦然。
     */
    public sendData(data: Buffer): boolean {
        let bufferlength = data.length;
        let length_buffer = Buffer.from([0, 0, 0, 0]);
        length_buffer.writeUInt32LE(bufferlength);
        let buffer_send = Buffer.concat([length_buffer, data]);

        this.idleBuffer.push(buffer_send);
        return this.pushData();
    }

    /**
     * 注册数据已接收到事件
     * @param callback 接收到的数据
     */
    public onDataRecived(callback: DataReciveCallback): void {
        this.reciveCallbacks.push(callback);
    }

    /**
     * 设置Tunnel对象的socket属性
     * @param socket 向Tunnel告知Socket实例
     * @description 必须调用此函数，否则任何功能将无法正常使用
     */
    protected setSocket(socket: Socket): Socket {
        this.socket =   socket.on("drain", () => {
                            if(this.pushData()) {
                                for(let callback of this.drainCallbacks) {
                                    callback();
                                }
                            }
                        }).on("data", (data: Buffer) => {
                            this.handleData(data);
                        }).setKeepAlive(true, 500);
        return socket;
    }

    /**
     * 移除Tunnel对象的socket属性实例
     */
    protected removeSocket() {
        this.socket?.destroy();
        this.socket = undefined;
    }

    /**
     * 传输数据
     * @returns 如果在一轮数据传输之后，缓冲区内还有数据，则返回false，否则返回true
     */
    private pushData(): boolean {
        if(this.socket == undefined) return false;
        while(true) {
            let data:Buffer | undefined = this.idleBuffer.shift();
            if(data == undefined) return true;
            if(this.socket.write(data) == false) return false;
            continue;
        }
    }

    /**
     * 此连接是否需要节流
     * @returns 如果缓冲区内还有数据则返回false，否则返回true
     */
    public isBlocked():boolean {
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