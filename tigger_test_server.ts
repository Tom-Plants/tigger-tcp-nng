import Server from "./transmission/server";

let server = new Server("0.0.0.0", 12345, 8);

server.onDataRecived((arg: number, data: Buffer) => {
    if(data.toString() == "testing....") {
        server.sendData(Buffer.from(""), 10000);
    }
});