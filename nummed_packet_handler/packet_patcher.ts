import { randomInt } from "crypto";
import PacketPatcher from "../packet_handler/packet_patcher";
import Random from "../utils/random";

export default class NummedPacketPatcher extends PacketPatcher {
    private randomler: Random;
    private nextPacketNumber: number;
    private currentPacketNumber: number;

    constructor(tunnelN: number) {
        super(tunnelN);
        this.randomler = new Random(0, 256);
        this.nextPacketNumber = this.randomler.getANumber();
        this.currentPacketNumber = this.randomler.getANumber();
    }
    
    patch(data: Buffer, port: number):Buffer[] {
        let l:Buffer = Buffer.from([this.currentPacketNumber, this.nextPacketNumber]);

        console.log(">", "packet:", this.currentPacketNumber, this.nextPacketNumber);
        this.currentPacketNumber = this.nextPacketNumber;
        this.nextPacketNumber = this.randomler.getANumber();

        return super.patch(Buffer.concat([l, data]), port);
    }
}