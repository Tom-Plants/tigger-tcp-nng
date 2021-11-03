import { DataReciveCallback, VoidCallBack } from "../public/types";

export default interface ITunnel{
    onDataRecived(callback: DataReciveCallback): void;
    onDrain(callback: VoidCallBack):void;
    onReady(callback: VoidCallBack): void;
    onReconnecting(callback: VoidCallBack): void;

    isBlocked(): boolean;
    connected(): boolean;

    sendData(data: Buffer): boolean;
    destroy(): void;
}