import PacketMixer from "../packet_handler/packet_mixer";


type RDataReciveCallback = (arg: Number, data: Buffer) => void;
export default class NummedPacketMixer extends PacketMixer {
    private nextPacketNumber: number;
    private dataReciveCallbacks: RDataReciveCallback[];
    private mapper: Map<number, Buffer>;
    constructor(tunnelN: number) {
        super(tunnelN);
        this.nextPacketNumber = -1;

        this.dataReciveCallbacks = new Array<RDataReciveCallback>();
        this.mapper = new Map<number, Buffer>();

        this.analyze((arg: Number, data: Buffer) => {
            let currentPacketNumber = data.readUInt8(0);
            let nextPacketNumber = data.readUInt8(1);

            if(this.nextPacketNumber == -1)
            {
                //init
                this.nextPacketNumber = nextPacketNumber;
                this.callDataReciveCallbacks(arg, data.slice(2, data.length));
                return;
            }

            if(currentPacketNumber != this.nextPacketNumber) {
                this.mapper.set(currentPacketNumber, data);
            }else {
                this.nextPacketNumber = nextPacketNumber;


                this.callDataReciveCallbacks(arg, data.slice(2, data.length));
                return;
            }

            while(true) {
                let packet = this.mapper.get(this.nextPacketNumber);
                if(packet == undefined) break;

                this.mapper.delete(this.nextPacketNumber);
                this.nextPacketNumber = nextPacketNumber;


                this.callDataReciveCallbacks(arg, data.slice(2, data.length));
            }

        });
    }

    private callDataReciveCallbacks(arg:Number, data: Buffer) {
        for(let i of this.dataReciveCallbacks) {
            i(arg, data);
        }
    }

    onNummedPacketRecived(callback: RDataReciveCallback): void {
        this.dataReciveCallbacks.push(callback);
    }
}