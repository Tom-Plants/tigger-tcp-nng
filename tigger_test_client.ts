import Server from "./transmission/server";
import Client from "./transmission/client";
import { socket } from "nanomsg";

let client = new Client("ali1.0x7c00.site", 12345, 8);

client.onDataRecived((arg:number, data: Buffer) => {
    console.log("client recive: ", arg, data.toString());
});

setInterval(() => {
    client.sendData(Buffer.from("testing...."), 1000);
    console.log("sended");
}, 1000);