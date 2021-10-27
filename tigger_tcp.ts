import arg from "arg";
import { ListenOptions, TcpSocketConnectOpts } from "net";
import StartClient from "./client";
import StartServer from "./Server";

try{
    const args = arg({
        '--type': String
    });

    //条件通过
    if(args["--type"] != undefined)
    {
        if(args["--type"] == "server")
        {
            //以服务器方式运作

            // let server:TiggerTcpServer = Server(options);
            // server.sendData()

            //let client:TiggerTcpClient = Client(options);
            StartServer("0.0.0.0", 12345, "localhost", 1899, 8);

        }else if(args["--type"] == "client")
        {
            //以客户端方式运作
            StartClient("ali1.0x7c00.site", 12345, "0.0.0.0", 10000, 8);
        }else
        {
            throw "请指定运行方式";
        }
        
    }
}catch(err: any)
{
    if(err.code == 'ARG_UNKNOWN_OPTION')
    {
        console.log(err.message);
    }
    else{
        throw err;
    }
}