import { timeStamp } from "console";
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
            if(this.nextPacketNumber == -1)
            {
                this.nextPacketNumber = data.readUInt8(0);

                console.log("下一个包号是", this.nextPacketNumber);

                this.callDataReciveCallbacks(arg, data.slice(1, data.length));
                return;
            }
            let currentPacketNumber = data.readUInt8(0);

            if(currentPacketNumber != this.nextPacketNumber) {
                this.mapper.set(currentPacketNumber, data);
            }else {
                this.nextPacketNumber = data.readUInt8(0);

                console.log("下一个包号是", this.nextPacketNumber);

                this.callDataReciveCallbacks(arg, data.slice(1, data.length));
                return;
            }

            let packet = this.mapper.get(this.nextPacketNumber);
            if(packet == undefined) return;

            this.nextPacketNumber = data.readUInt8(0);

            console.log("下一个包号是", this.nextPacketNumber);

            this.callDataReciveCallbacks(arg, data.slice(1, data.length));
        });
    }

    private callDataReciveCallbacks(arg:Number, data: Buffer) {
        this.dataReciveCallbacks.map((value: RDataReciveCallback) => {
            value(arg, data);
        });
    }

    onNummedPacketRecived(callback: RDataReciveCallback): void {
        this.dataReciveCallbacks.push(callback);
    }
}