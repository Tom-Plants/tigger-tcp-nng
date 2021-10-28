type AnalyzeCallback = (arg: number, data: Buffer) => void;
export default class PacketMixer {
    private tunnelN: number;
    private tunnelData: Array<Array<Buffer>>;
    private lastePacketPort: number;
    
    private cb: AnalyzeCallback;
    
    constructor(tunnelN: number) {
        this.tunnelN = tunnelN;
        this.tunnelData = new Array<Array<Buffer>>();
        this.lastePacketPort = 0;
        for(let i:number=0;i<tunnelN;i++) { this.tunnelData.push(new Array<Buffer>()); }
        this.cb = () => {};
    }

    public input(data: Buffer) {
        let num = this.readPacketNumber(data);
        this.tunnelData[num].push(data);
        let packet = this.getLastePacket();
        if(packet == undefined) return;
        this.cb(this.lastePacketPort, packet);
    }

    public analyze(cb: (arg:number, data: Buffer) => void)
    {
        this.cb = cb;
    }

    private mixPacket(data: Buffer[]): Buffer {
        let rtn:Buffer = Buffer.alloc(0);
        for(let i in data)
        {
            rtn = Buffer.concat([rtn, data[i]]);
        }
        return rtn;
    }
    private readPacketNumber(data: Buffer): number {
        let num = data.readUInt8(2);
        return num;
    }
    private readPacketPort(data: Buffer): number {
        let port = data.readUInt16LE(0);
        return port;
    }
    private clearPacketStatus(data: Buffer): Buffer {
        let real_data:Buffer = data.slice(3, data.length);
        return real_data;
    }
    private getLastePacket(): Buffer | undefined {
        for(let i in this.tunnelData) {
            if(this.tunnelData[i].length == 0) return undefined;
        }
        let lasteSplitPacket:Array<Buffer> = new Array<Buffer>();
        this.tunnelData.map((value: Array<Buffer>) => {
            let item = value.shift();
            if(item == undefined) return;
            this.lastePacketPort = this.readPacketPort(item);
            item = this.clearPacketStatus(item);
            lasteSplitPacket.push(item);
        });
        return this.mixPacket(lasteSplitPacket);
    }
}