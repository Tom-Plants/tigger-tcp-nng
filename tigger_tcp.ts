import arg from "arg";
import { ListenOptions, TcpSocketConnectOpts } from "net";
import StartClient from "./client";
import StartServer from "./server";

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
            StartServer("0.0.0.0", 8081, "localhost", 1899, 3);

        }else if(args["--type"] == "client")
        {
            //以客户端方式运作
            //StartClient("45.135.135.142", 8081, "0.0.0.0", 10000, 3);
            StartClient("localhost", 8081, "0.0.0.0", 10000, 3);

            setInterval(() => {
                console.log("hello world");
            }, 1000);

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