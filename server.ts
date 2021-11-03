import { createConnection, Socket } from "net";
import Mapper from "./Mapper";
import Server from "./transmission/server";
import CServer from "./controller/server";
import DoubleBufferedConsole from "./console/doublebufferedconsole";

let mapper: Map<number, Socket>;
let server: Server;

let thost: string;
let tport: number;

let dfConsole: DoubleBufferedConsole;

export default function StartServer(
    host: string,
    port: number,
    target_host: string,
    target_port: number,
    tunnelN: number
    ) {

    dfConsole = new DoubleBufferedConsole();

    thost = target_host;
    tport = target_port;

    mapper = new Map<number, Socket>();

    server = new Server(host, port, tunnelN);
    server.onDataRecived(onDataRecive);
    server.onDrain(() => {
        mapper.forEach((value: Socket) => {
            value.resume();
        });
    });


    setInterval(() => {
        dfConsole.log(">>>>>>", "transmission status,  paused ?:", server.isPaused(), "<<<<<<");
        mapper.forEach((value: Socket, num: number) => {
            dfConsole.log(">>>>>>", {pause: value.isPaused(), num, upload: value.bytesWritten, download: value.bytesRead}, "<<<<<<");
        });
        dfConsole.log('-------------------------------------------------------');
        dfConsole.show();
    }, 100);
}

function onDataRecive(arg: number, data: Buffer) {

    if(data.length == 5) {
        let cmd = data.toString();
        if(cmd == "PTCLS") {
            mapper.get(arg)?.destroy();
            mapper.delete(arg);
        }else if(cmd == "COPEN") {
            let conn = createConnection({host: thost, port: tport}, () => {
                server.sendData(Buffer.from("PTCTN"), arg);
            }).on("end", () => {
                server.sendData(Buffer.from("SHALF"), arg);
            }).on("data", (data: Buffer) => {
                if(false == server.sendData(data, arg)) {
                    conn.pause();
                }
            }).on("close", () => {
                server.sendData(Buffer.from("PTCLS"), arg);
                mapper.get(arg)?.destroy();
                mapper.delete(arg);
            }).on("error", () => { })
            .on("drain", () => {
                server.sendData(Buffer.from("PTCTN"), arg);
            }).setKeepAlive(true, 200);

            mapper.set(arg, conn);
        }else if(cmd == "CHALF") {
            mapper.get(arg)?.end();
        }else if(cmd == "PTCTN") {
            mapper.get(arg)?.resume();
        }else if(cmd == "PTSTP") {
            mapper.get(arg)?.pause();
        }
        return;
    }

    if(false == mapper.get(arg)?.write(data))
    {
        server.sendData(Buffer.from("PTSTP"), arg)
    }
}
