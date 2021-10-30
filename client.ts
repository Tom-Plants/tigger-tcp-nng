import { createServer, Server, Socket } from "net";
import Client from "./transmission/client";
import CClient from "./controller/client";
import DoubleBufferedConsole from "./console/doublebufferedconsole";

let localServer:Server;
let mapper: Map<number, Socket>;
let client: Client;
let controller: CClient;
let dfConsole:DoubleBufferedConsole;

export default function StartClient(host: string, port: number, host_listen: string, port_listen: number, tunnelN: number) {
    dfConsole = new DoubleBufferedConsole();

    mapper = new Map<number, Socket>();
    localServer = createLocalServer(port_listen, host_listen);

    controller = new CClient(host, port-1);
    controller.regCommand("PTSTP", (port: number) => {
        mapper.get(port)?.pause();
    });
    controller.regCommand("PTCTN", (port: number) => {
        mapper.get(port)?.resume();
    });

    client = new Client(host, port, tunnelN);
    client.onDataRecived(onDataRecive);
    client.onDrain(() => {
        mapper.forEach((value: Socket) => {
            value.resume();
        });
    });

    //setInterval(() => {
        //dfConsole.log(">>>>>>", "transmission status,  paused ?:", client.isPaused(), "<<<<<<");
        //mapper.forEach((value: Socket, num: number) => {
            //dfConsole.log(">>>>>>", {pause: value.isPaused(), num, upload: value.bytesWritten, download: value.bytesRead}, "<<<<<<");
        //});
        //dfConsole.log('-------------------------------------------------------');
        //dfConsole.show();
    //}, 10);
}


function onDataRecive(arg: number, data: Buffer) {
    if(data.length == 5) {
        let cmd = data.toString();
        if(cmd == "PTCLS") {
            mapper.get(arg)?.destroy();
            mapper.delete(arg);
        }else if(cmd == "SHALF") {
            mapper.get(arg)?.end();
        }
        return;
    }

    if(false == mapper.get(arg)?.write(data)) {
        controller.sendCommand("PTSTP", arg);
    }
}

function createLocalServer(port_listen: number, host_listen: string): Server {
    return createServer({
        allowHalfOpen: true,
        pauseOnConnect: true
    }).listen({port: port_listen, hostname: host_listen}, () => {
    }).on("connection", (socket: Socket) => {
        if(socket.remotePort == undefined) {
            socket.destroy();
            return;
        }

        let referPort:number = socket.remotePort;

        socket.on("close", () => {
            client.sendData(Buffer.from("PTCLS"), referPort);
            mapper.get(referPort)?.destroy();
            mapper.delete(referPort);
        }).on("end", () => {
            client.sendData(Buffer.from("CHALF"), referPort);
        }).on("data", (data: Buffer) => {
            if(client.sendData(data, referPort) == false) {
                socket.pause();
            }
        }).on('error', () => { })
        .on('drain', () => {
            controller.sendCommand("PTCTN", referPort);
        });


        client.sendData(Buffer.from("COPEN"), referPort);
        mapper.set(referPort, socket);
    });
}
