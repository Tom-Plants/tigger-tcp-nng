import { randomInt } from "crypto";
import PacketPatcher from "../packet_handler/packet_patcher";
import Random from "../utils/random";

export default class NummedPacketPatcher extends PacketPatcher {
    private randomler: Random;

    constructor(tunnelN: number) {
        super(tunnelN);
        this.randomler = new Random(0, 256);
    }
    
    patch(data: Buffer, port: number):Buffer[] {
        let r = this.randomler.getANumber();
        console.log("current packet number is", r);
        let l:Buffer = Buffer.from([r]);
        return super.patch(Buffer.concat([l, data]), port);
    }
}