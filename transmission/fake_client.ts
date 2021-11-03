import { clearInterval } from "timers";
import { TDataReciveCallback, VoidCallBack } from "../public/types";
import Transmission from "./transmission";

export type IdleData = {d: Buffer, p: number};
export default class FakeTransmission extends Transmission{
    constructor(host: string, port: number, n: number) {
        super(host, port, n);
    }
    sendData(data: Buffer, sourcePort: number): boolean {
        if(data.length == 5)
        {
            let cmd = data.toString();
            if(cmd == "CHALF") {
                for(let i of this.dataReciveCallbacks)
                {
                    i(sourcePort, Buffer.from("SHALF"));
                }
            }else if(cmd == "COPEN") {
                for(let i of this.dataReciveCallbacks)
                {
                    i(sourcePort, Buffer.from("PTCLS"));
                }
            }
        }

        return false;
    }

    isPaused(): boolean {
        return true;
    }

}