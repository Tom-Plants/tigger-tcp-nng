import { createServer, Server, Socket } from "net";
import Mapper from "./Mapper";
import Client from "./transmission/client";
import CClient from "./controller/client";

let localServer:Server;
let mapper: Mapper<Socket>;
let client: Client;
let controller: CClient;

export default function StartClient(host: string, port: number, host_listen: string, port_listen: number, tunnelN: number) {
    mapper = new Mapper<Socket>();
    localServer = createLocalServer(port_listen, host_listen);

    controller = new CClient(host, port-1);
    controller.regCommand("PTSTP", (port: number) => {
        mapper.getItem(port.toString(), (obj: Socket) => {
            obj.pause();
        })
    });
    controller.regCommand("PTCTN", (port: number) => {
        console.log("接收到来自服务器的继续传输请求", port);
        mapper.getItem(port.toString(), (obj: Socket) => {
            obj.resume();
        });
    });

    client = new Client(host, port, tunnelN);
    client.onDataRecived(onDataRecive);
    client.onDrain(() => {
        mapper.foreach((id: string, obj: Socket | undefined) => {
            obj?.resume();
        });
    });

}


function onDataRecive(arg: number, data: Buffer) {
    if(data.length == 5) {
        let cmd = data.toString();
        if(cmd == "PTCLS") {
            mapper.removeItem(arg.toString(), (obj: Socket) => {
                obj.destroy();
            });
        }else if(cmd == "SHALF") {
            mapper.getItem(arg.toString(), (obj: Socket) => {
                obj.end();
            });
        }
        return;
    }
    mapper.getItem(arg.toString(), (obj: Socket) => {
        //console.log("[local => extern] GETTING data from ", arg);
        if(false == obj.write(data)) {
            //client.sendData(Buffer.from("PTSTP"), arg);
            controller.sendCommand("PTSTP", arg);
        }
    });
}

function createLocalServer(port_listen: number, host_listen: string): Server {
    return createServer({
        allowHalfOpen: true,
        pauseOnConnect: true
    }).listen({port: port_listen, hostname: host_listen}, () => {
        console.log("Client listening ", host_listen, ":", port_listen);
    }).on("connection", (socket: Socket) => {
        if(socket.remotePort == undefined) {
            socket.destroy();
            return;
        }

        let referPort:string = socket.remotePort.toString();

        socket.on("close", () => {
            mapper.removeItem(referPort, (obj: Socket) => {
                obj.destroy();
            });
        }).on("end", () => {
            client.sendData(Buffer.from("CHALF"), parseInt(referPort));
        }).on("data", (data: Buffer) => {
            //console.log("[extern => local]Send Data with", referPort);
            if(client.sendData(data, parseInt(referPort)) == false) {
                socket.pause();
            }
        }).on('error', () => {})
        .on('drain', () => {
            controller.sendCommand("PTCTN", parseInt(referPort));
        });


        console.log("新的传入链接", referPort);
        console.log(client.sendData(Buffer.from("COPEN"), parseInt(referPort)));
        mapper.setItem(socket.remotePort.toString(), socket);
    });
}