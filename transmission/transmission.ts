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

    /**
     * 关闭所有连接
     */
    public destory(): void {
        this.drainCallbacks.length = 0;
        this.readyCallbacks.length = 0;
        this.dataReciveCallbacks.length = 0;
        this.reconnectingCallbacks.length = 0;

        if(this.peers != undefined) {
            for(let i of this.peers)
            {
                i.destroy();
            }
        }
    }

    /**
     * 注册重连事件
     * @param callback 正在重连回调
     */
    public onReconnecting(callback: VoidCallBack): void {
        this.reconnectingCallbacks.push(callback);
    }

    /**
     * 注册连接成功事件
     * @param callback 连接成功
     */
    public onReady(callback: VoidCallBack): void {
        this.readyCallbacks.push(callback);
    }

    /**
     * 设置Tunnel实例集
     * @param peers Tunnel实例集
     * @description 使用前必须设置实例集，否则无法工作
     */
    protected setPeers(peers: Array<ITunnel>) {
        this.peers = peers;
        this.openTunnels(this.host, this.port, this.tunnelN);
    }

    /**
     * 获取Tunnel实例集
     * @returns 获取的实例集
     */
    protected getPeers(): Array<ITunnel> | undefined {
        return this.peers;
    }

    /**
     * 设置Tunnel实例集
     * @param host 主机名
     * @param port 端口
     * @param tunnelN 通道数
     */
    protected openTunnels(host: string, port: number, tunnelN: number): void {
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
                    if(!i.isBlocked()) {
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


    /**
     * 在Tunnel集中，发送数据
     * @param data 数据
     * @param sourcePort 源端口
     * @returns 如果出现拥塞，则返回true
     */
    public sendData(data: Buffer, sourcePort: number): boolean {
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

    /**
     * 注册数据接收事件
     * @param callback 数据输出回调
     */
    public onDataRecived(callback: TDataReciveCallback): void {
        this.dataReciveCallbacks.push(callback);
    }

    /**
     * 注册拥塞结束事件
     * @param callback 拥塞结束回调
     */
    public onDrain(callback: VoidCallBack): void {
        this.drainCallbacks.push(callback);
    }

    /**
     * Tunnel集是否阻塞
     * @returns 如果Tunnel集的阻塞标志都为false，则返回false，否则返回true
     */
    public isPaused(): boolean {
        let paused = false;
        if(this.peers == undefined) throw "the peers is not set";
        for(let value of this.peers) {
            if(value.isBlocked()){
                paused = true;
                break;
            }
        }
        return paused;
    }
}