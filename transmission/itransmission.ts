import { TDataReciveCallback } from "../public/types";

export default interface ITransmission {
    sendData(data: Buffer, sourcePort: number): void;
    onDataRecived(callback: TDataReciveCallback): void;
}