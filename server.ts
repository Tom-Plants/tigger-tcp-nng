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
            let conn = createConnection({host: thost, port: tport}).on("end", () => {
            }).on("data", (data: Buffer) => {
                server.sendData(data, arg);
            });

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
            server.sendData(Buffer.from("PTSTP"), arg);
        }
    });
}