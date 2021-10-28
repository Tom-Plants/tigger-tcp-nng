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
        let l:Buffer = Buffer.from([this.randomler.getANumber()]);
        return super.patch(Buffer.concat([l, data]), port);
    }
}