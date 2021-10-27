"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var arg_1 = __importDefault(require("arg"));
try {
    var args = (0, arg_1.default)({
        '--type': String
    });
    //条件通过
    if (args["--type"] != undefined) {
        if (args["--type"] == "server") {
            //以服务器方式运作
            // let server:TiggerTcpServer = Server(options);
            // server.sendData()
            //let client:TiggerTcpClient = Client(options);
            var controlListen = { port: 0, host: "" }; //控制通道监听地址
            var outboundsListen = { port: 0, host: "" }; //多线程通道监听起始地址
            var options = { port: 0, host: "" }; //目标转发地址
            var server = Server(controlListen);
            new Dispatcher(options, outboundsListen, server, 0, true);
        }
        else if (args["--type"] == "client") {
            //以客户端方式运作
            var options = { port: 10000, host: "ali1.0x7c00.site" };
            // let server:TiggerTcpServer = Server(options);
            // server.sendData()
            //let server: TiggerTcpServer = Server(options);
            var client = Client(options);
            var dispatcher_listen_options = { port: 10000, host: "localhost" };
            new Dispatcher(dispatcher_listen_options, options, client, 8, false);
        }
        else {
            throw "请指定运行方式";
        }
    }
}
catch (err) {
    if (err.code == 'ARG_UNKNOWN_OPTION') {
        console.log(err.message);
    }
    else {
        throw err;
    }
}
