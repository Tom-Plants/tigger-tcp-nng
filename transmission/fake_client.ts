import { TDataReciveCallback, VoidCallBack } from "../public/types";
import Transmission from "./transmission";

export type IdleData = {d: Buffer, p: number};
export default class FakeClient extends Transmission{
    private idleBuffer: Array<IdleData>;
    constructor(host: string, port: number, n: number) {
        super(host, port, n);
        this.idleBuffer = new Array<IdleData>();
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
            }
            return false;
        }

        this.idleBuffer.push({d: data, p: sourcePort})

        return false;
    }

    getIdleData(): Array<IdleData> {
        return this.idleBuffer;
    }

    isPaused(): boolean {
        return true;
    }
    
}