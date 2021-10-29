import { TDataReciveCallback, VoidCallBack } from "../public/types";

export default interface ITransmission {
    sendData(data: Buffer, sourcePort: number): boolean;
    onDataRecived(callback: TDataReciveCallback): void;
    onDrain(callback: VoidCallBack): void;
    stop(): void;
    continue(): void;
    openTunnels(host: string, port: number, n: number): void;
}