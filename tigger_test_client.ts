import Server from "./transmission/server";
import Client from "./transmission/client";
import {socket ,Socket} from "nanomsg";

let a: Socket = socket("pair", {
    rcvmaxsize: -1
});

a.connect("tcp://45.135.135.142:12345");
console.log(a.send(Buffer.alloc(1024*1024*1024)));
// console.log(a.send("hello world"));

// let client = new Client("ali1.0x7c00.site", 12345, 8);

// client.onDataRecived((arg:number, data: Buffer) => {
//     console.log("client recive: ", arg, data.toString());
// });

// setInterval(() => {
//     client.sendData(Buffer.from("testing...."), 1000);
//     console.log("sended");
// }, 1000);
