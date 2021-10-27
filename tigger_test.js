"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./transmission/server"));
var client_1 = __importDefault(require("./transmission/client"));
var server = new server_1.default("0.0.0.0", 12345, 8);
var client = new client_1.default("localhost", 12345, 8);
client.onDataRecived(function (arg, data) {
    console.log("client recive: ", arg, data.toString());
    if (arg == 0) {
        client.sendData(Buffer.from("hello world"), 1);
    }
});
// server.onDataRecived((arg: number, data: Buffer) => {
//     console.log("server recive: ", arg, data.toString());
//     if(arg == 1) {
//         server.sendData(Buffer.from("hello client"), 0);
//     }
// });
(function (a) {
    setInterval(function () {
        a.sendData(Buffer.from("233"), 10000);
    }, 1000);
})(server);
