import Server from "./transmission/server";
import Client from "./transmission/client";
import { socket } from "nanomsg";

let server = new Server("0.0.0.0", 12345, 8);
let client = new Client("localhost", 12345, 8);

client.onDataRecived((arg:number, data: Buffer) => {
    console.log("client recive: ", arg, data.toString());
    if(arg == 0) {
        client.sendData(Buffer.from("hello world"), 1);
    }
});

// server.onDataRecived((arg: number, data: Buffer) => {
//     console.log("server recive: ", arg, data.toString());
//     if(arg == 1) {
//         server.sendData(Buffer.from("hello client"), 0);
//     }
// });

(function(a: Server) {
    setInterval(() => {
        a.sendData(Buffer.from("233"), 10000);
    }, 1000);
})(server);