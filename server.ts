import { createConnection, Socket } from "net";
import Mapper from "./Mapper";
import Server from "./transmission/server";
import CServer from "./controller/server";

let mapper: Mapper<Socket>;
let server: Server;
let controller: CServer;

let thost: string;
let tport: number;

export default function StartServer(
    host: string,
    port: number,
    target_host: string,
    target_port: number,
    tunnelN: number
    ) {

    thost = target_host;
    tport = target_port;

    mapper = new Mapper<Socket>();

    controller = new CServer(host, port-1);
    controller.regCommand("PTSTP", (port: number) => {
        mapper.getItem(port.toString(), (obj: Socket) => {
            obj.pause();
        })
    });
    controller.regCommand("PTCTN", (port: number) => {
        mapper.getItem(port.toString(), (obj: Socket) => {
            obj.resume();
        });
    });

    server = new Server(host, port, tunnelN);
    server.onDataRecived(onDataRecive);

}

function onDataRecive(arg: number, data: Buffer) {
    console.log("data from client: ", arg, data);

    if(data.length == 5) {
        let cmd = data.toString();
        if(cmd == "PTCLS") {
            mapper.removeItem(arg.toString(), (obj: Socket) => {
                obj.destroy();
            });
        }else if(cmd == "COPEN") {
            console.log("接收到客户端的传入链接", arg);
            let conn = createConnection({host: thost, port: tport}, () => {
                controller.sendCommand("PTCTN", arg);
            }).on("end", () => {
                server.sendData(Buffer.from("SHALF"), arg);
            }).on("data", (data: Buffer) => {
                //console.log("[extern => server]Send data with", arg);
                server.sendData(data, arg);
            }).on("close", () => {
                mapper.removeItem(arg.toString(), (obj: Socket) => {
                    obj.destroy();
                });
            }).on("error", () => {})
            .on("drain", () => {
                controller.sendCommand("PTCTN", arg);
            });

            mapper.setItem(arg.toString(), conn);
        }else if(cmd == "CHALF") {
            mapper.getItem(arg.toString(), (obj: Socket) => {
                obj.end();
            });
        }
        return;
    }

    mapper.getItem(arg.toString(), (obj: Socket) => {
        if(false == obj.write(data)) {
            //console.log("[server => extern]send data with ", arg);
            controller.sendCommand("PTSTP", arg);
        }
    });
}