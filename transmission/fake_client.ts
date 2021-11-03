import { clearInterval } from "timers";
import { TDataReciveCallback, VoidCallBack } from "../public/types";
import Transmission from "./transmission";

export type IdleData = {d: Buffer, p: number};
export default class FakeTransmission extends Transmission{
    private lifeCheckCallbacks: Array<VoidCallBack>;
    private timer: NodeJS.Timer | undefined;
    constructor(host: string, port: number, n: number) {
        super(host, port, n);
        this.lifeCheckCallbacks = new Array<VoidCallBack>();

        this.startLifeCheck();
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

        return false;
    }

    isPaused(): boolean {
        return true;
    }

    regLifeCheck(callback: VoidCallBack): void {
        this.lifeCheckCallbacks.push(callback);
    }

    stopLifeCheck(): void {
        if(this.timer == undefined) return;
        clearInterval(this.timer);
        this.timer = undefined;
    }

    startLifeCheck(): void {
        if(this.timer != undefined) return;
        this.timer = setInterval(() => {
            for(let i of this.lifeCheckCallbacks) {
                i();
            }
        }, 200);
    }
    
}