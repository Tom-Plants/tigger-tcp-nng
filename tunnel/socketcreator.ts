import { createServer, Server } from "net"

let server = createServer();
export default function getServer(): Server {
    return server;
}