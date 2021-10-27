import { createConnection, Socket } from "net";
import Mapper from "./Mapper";
import Server from "./transmission/server";

let mapper: Mapper<Socket>;
let server: Server;

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
    server = new Server(host, port, tunnelN);
    server.onDataRecived(onDataRecive);
    mapper = new Mapper<Socket>();
}

function onDataRecive(arg: number, data: Buffer) {
    if(data.length == 5) {
        let cmd = data.toString();
        if(cmd == "PTCLS") {
            mapper.removeItem(arg.toString(), (obj: Socket) => {
                obj.destroy();
            });
        }else if(cmd == "COPEN") {
            console.log("接收到客户端的传入链接", arg);
            let conn = createConnection({host: thost, port: tport}).on("end", () => {
            }).on("data", (data: Buffer) => {
                console.log("[extern => server]Send data with", arg);
                server.sendData(data, arg);
            }).on("close", () => {
                mapper.removeItem(arg.toString(), (obj: Socket) => {
                    obj.destroy();
                });
            })

            mapper.setItem(arg.toString(), conn);
        }else if(cmd == "CHALF") {
            mapper.getItem(arg.toString(), (obj: Socket) => {
                obj.end();
            });
        }
        else if(cmd == "PTSTP") {
            mapper.getItem(arg.toString(), (obj: Socket) => {
                obj.pause();
            });
        }else if(cmd == "PTCTN") {
            mapper.getItem(arg.toString(), (obj:Socket) => {
                obj.resume();
            })
        }
        return;
    }

    mapper.getItem(arg.toString(), (obj: Socket) => {
        if(false == obj.write(data)) {
            console.log("[server => extern]send data with ", arg);
            server.sendData(Buffer.from("PTSTP"), arg);
        }
    });
}