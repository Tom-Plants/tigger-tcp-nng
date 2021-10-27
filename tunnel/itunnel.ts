import { DataReciveCallback } from "../public/types";

export default interface ITunnel{
    sendData(data: Buffer): void;
    onDataRecived(callback: DataReciveCallback): void;
}