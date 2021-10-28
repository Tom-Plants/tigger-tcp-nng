import {socket ,Socket} from "nanomsg";

let count = 0;
let a: Socket = socket("pair", {
    rcvmaxsize: -1,
    reconn: 100,
    maxreconn: 200,
    sndbuf: 1024*1024,
    rcvbuf: 1024*1024
});

a.bind("tcp://0.0.0.0:12345");

a.on("data", (data: Buffer) => {
    console.log(count++, data);
});