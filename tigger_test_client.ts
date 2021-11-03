import { createServer, Server, Socket } from "net";

createLocalServer(10000, "0.0.0.0");
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
            let k:any = socket;
            console.log("socket stopped", referPort);
            socket.destroy();
        });
        console.log(referPort, "opened");
        socket.on("end", () => {
            console.log("CHALF", referPort);
            socket.end();
        });
        socket.on("data", (data: Buffer) => {
            console.log(socket.remotePort, "被暂停了");
            socket.pause();
            setTimeout(() => {
                console.log(socket.remotePort, "被恢复了");
                socket.resume();
            }, 1000);
        });
        socket.on('error', (errr) => {console.log(errr);})
        socket.on('drain', () => {
        })
        socket.setKeepAlive(true, 200);
    }).listen({port: port_listen, host: host_listen});
}
