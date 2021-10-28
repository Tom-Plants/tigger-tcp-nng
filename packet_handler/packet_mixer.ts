import ClientController from "../Mapper";

type AnalyzeCallback = (arg: number, data: Buffer) => void;

interface packet {
    port: number,
    data: Buffer[],
    setup: boolean[], //传过来的数据有可能存在空包,使用布尔值验证
}
interface analyzedPacket {
    port: number,
    num: number,
    data: Buffer
}
export default class PacketMixer {
    private tunnelN: number;
    private packetController: ClientController<packet>;
    
    private cb: AnalyzeCallback;
    
    constructor(tunnelN: number) {
        this.tunnelN = tunnelN;
        this.packetController = new ClientController<packet>();
        this.cb = () => {};
    }

    public input(data: Buffer) {
        let packet: analyzedPacket = this.analyzePacket(data);

        let found_obj:packet | undefined = undefined;
        //found_obj = this.packetController.getClient(packet.port.toString());
        found_obj = this.packetController.getItem(packet.port.toString());

        if(found_obj != undefined)
        {
            found_obj.data[packet.num] = packet.data;
            found_obj.setup[packet.num] = true;
            this.analyzePackets(found_obj);
        }else {
            let p:packet = this.newPacket(packet.port);
            p.data[packet.num] = packet.data;
            p.setup[packet.num] = true;
            //this.packetController.addClientWithId(packet.port.toString(), p);
            this.packetController.setItem(packet.port.toString(), p);
            this.analyzePackets(p);
        }
    }
    protected analyze(cb: (arg:number, data: Buffer) => void)
    {
        this.cb = cb;
    }

    private newPacket(port: number):packet {
        let buffers: Buffer[] = new Array<Buffer>();
        let setups: boolean[] = new Array<boolean>();
        for(let i:number=0; i < this.tunnelN; i++)
        {
            buffers.push(Buffer.alloc(0));
            setups.push(false);
        }

        return {
            port: port,
            data: buffers,
            setup: setups,
        };
    }
    private analyzePacket(data: Buffer): analyzedPacket {
        let port = data.readUInt16LE(0);
        let num = data.readUInt8(2);
        let real_data:Buffer = data.slice(3, data.length);
        return {port: port, num: num, data: real_data};
    }
    private analyzePackets(found_obj: packet){
        if(this.isPacketSuccess(found_obj))
        {
            this.cb(found_obj.port, this.mixPacket(found_obj.data));
            this.clearPacket(found_obj);
        }
    }
    private clearPacket(obj_g: packet) {
        //this.packetController.removeClient(obj_g.port.toString());
        this.packetController.removeItem(obj_g.port.toString(), (obj: packet) => {});
    }
    private isPacketSuccess(obj: packet):boolean {
        let success = true;
        for(let i in obj.setup)
        {
            if(obj.setup[i] == false)
            {
                success = false;
                break;
            }
        }
        return success;
    }
    private mixPacket(data: Buffer[]): Buffer {
        let rtn:Buffer = Buffer.alloc(0);
        for(let i in data)
        {
            rtn = Buffer.concat([rtn, data[i]]);
        }
        return rtn;
    }
}