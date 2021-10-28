import Server from "./transmission/server";
let count = 0;

let server = new Server("0.0.0.0", 12345, 1);


server.onDataRecived((arg: number, data: Buffer) => {
    console.log(count++, arg, data);
});