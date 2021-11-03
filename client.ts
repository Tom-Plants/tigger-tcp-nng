import { createServer, Server, Socket } from "net";
import Client from "./transmission/client";
import FClient, { IdleData } from "./transmission/fake_client";
import CClient from "./controller/client";
import DoubleBufferedConsole from "./console/doublebufferedconsole";
import ITransmission from "./transmission/itransmission";

let mapper: Map<number, Socket>;
let client: ITransmission;
let dfConsole:DoubleBufferedConsole;
let real_client: Client;
let fake_client: FClient;

export default function StartClient(host: string, port: number, host_listen: string, port_listen: number, tunnelN: number) {
    dfConsole = new DoubleBufferedConsole();
    mapper = new Map<number, Socket>();

    createLocalServer(port_listen, host_listen);


    {
        fake_client = new FClient(host, port, tunnelN);
        fake_client.onDataRecived(onDataRecive);
        client = fake_client;
    }

    {
        real_client = new Client(host, port, tunnelN);
        let regRealClient = (c: Client) => {
            c.onDataRecived(onDataRecive);
            c.onDrain(() => {
                mapper.forEach((value: Socket) => {
                    value.resume();
                });
            });
            c.onReady(() => {
                client = real_client;
            });
            c.onReconnecting(() => {
                client = fake_client;

                real_client.destory();
                real_client = new Client(host, port, tunnelN);
                regRealClient(real_client);
            });
        }
        regRealClient(real_client);
    }

    setInterval(() => {
        dfConsole.log(">>>>>>", "transmission status,  paused ?:", client.isPaused(), "<<<<<<");
        mapper.forEach((value: Socket, num: number) => {
            dfConsole.log("|||||", {pause: value.isPaused(), num, upload: value.bytesWritten, download: value.bytesRead}, "|||||");
        });
        dfConsole.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
        dfConsole.show();
    }, 100);
}


function onDataRecive(arg: number, data: Buffer) {
    if(data.length == 5) {
        let cmd = data.toString();
        if(cmd == "PTCLS") {
            mapper.get(arg)?.destroy();
            mapper.delete(arg);
        }else if(cmd == "SHALF") {
            mapper.get(arg)?.end();
        }else if(cmd == "PTCTN") {
            mapper.get(arg)?.resume();
        }else if(cmd == "PTSTP") {
            mapper.get(arg)?.pause();
        }
        return;
    }

    if(false == mapper.get(arg)?.write(data)) {
        client.sendData(Buffer.from("PTSTP"), arg);
    }
}

function createLocalServer(port_listen: number, host_listen: string): Server {
    return createServer({
        allowHalfOpen: true
    }, (socket: Socket) => {
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
        }).on('error', () => {})
        .on('drain', () => {
            client.sendData(Buffer.from("PTCTN"), referPort);
        }).setKeepAlive(true, 200);

        client.sendData(Buffer.from("COPEN"), referPort);
        mapper.set(referPort, socket);
    }).listen({port: port_listen, host: host_listen});
}
