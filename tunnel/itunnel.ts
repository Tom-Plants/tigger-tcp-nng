import { DataReciveCallback, VoidCallBack } from "../public/types";

export default interface ITunnel{
    sendData(data: Buffer): boolean;
    onDataRecived(callback: DataReciveCallback): void;
    onDrain(callback: VoidCallBack):void;
    isDrained(): boolean;

}