import { CommandCallBack } from "../public/types";
import RawSocketServer from "../tunnel/server_raw_socket";

export default class Server extends RawSocketServer {
    private mapper: Map<string, Array<CommandCallBack>>;
    constructor(host: string, port: number) {
        super(host, port);

        this.mapper = new Map<string, Array<CommandCallBack>>();
        this.onDataRecived((data: Buffer) => {
            let cmd = data.slice(0, 5).toString();
            let port = data.readUInt16LE(5);
            let r = this.mapper.get(cmd);
            r?.map((value: CommandCallBack) => {
                value(port);
            });
        });
    }

    regCommand(cmd: string, callback: CommandCallBack) {
        let r: Array<CommandCallBack> | undefined;
        r = this.mapper.get(cmd);
        if(r == undefined) r = new Array<CommandCallBack>();
        r.push(callback);
        this.mapper.set(cmd, r);
    }

    /**
     * 
     * @param cmd length < 5
     * @param port 0 < port <= 65535
     */
    sendCommand(cmd: string, port: number): void {
        let cmdBuf = Buffer.from(cmd);

        let portBuf = Buffer.alloc(2);
        portBuf.writeUInt16LE(port);

        let sendBuf = Buffer.concat([cmdBuf, portBuf]);
        this.sendData(sendBuf);
    }
}