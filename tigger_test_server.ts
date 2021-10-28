import {socket ,Socket} from "nanomsg";

let a: Socket = socket("pair");

a.bind("tcp://0.0.0.0:12345");

a.on("data", (data: Buffer) => {
    console.log(data);
});