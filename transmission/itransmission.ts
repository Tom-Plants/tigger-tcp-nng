import { TDataReciveCallback, VoidCallBack } from "../public/types";

export default interface ITransmission {
    sendData(data: Buffer, sourcePort: number): boolean;
    destory(): void;

    onDataRecived(callback: TDataReciveCallback): void;
    onDrain(callback: VoidCallBack): void;
    onReady(callback: VoidCallBack): void;
    onReconnecting(callback: VoidCallBack): void;

    isPaused(): boolean;
}